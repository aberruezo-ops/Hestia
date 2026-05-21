---
name: video-edit
description: >
  Video handling and editing with ffmpeg. Use this skill whenever the user
  wants to process, transform, or inspect a video file — including but not
  limited to: cropping out a watermark or UI overlay, trimming start/end,
  compressing or resizing for web (MP4/WebM), converting formats, extracting
  a frame or thumbnail, looping a clip, removing audio, adjusting playback
  speed, concatenating clips, or batch-processing multiple files.
  Also triggers when the user mentions ffmpeg directly, asks about video file
  size, quality, codec, resolution, or asks to "prepare video assets" for a
  website. Prefer this skill over generic Bash answers when video files are
  involved.
---

# Video Edit — ffmpeg skill

You have access to `ffmpeg` and `ffprobe` via the Bash tool.

## First: inspect before you touch

Always run `ffprobe` on the input before building the ffmpeg command. You
need to know the actual resolution, codec, frame rate, duration, and whether
there are audio streams, because ffmpeg flags that look correct for one file
can silently produce wrong output for another.

```bash
ffprobe -v error -show_streams -show_format -of json "$INPUT"
```

Read the output. Then build the command.

## Output naming

Save outputs alongside the source unless the user specifies otherwise. Append
a short suffix that describes what changed:
- `hero-loop.mp4` → `hero-loop-crop.mp4`
- `promo.mov` → `promo-web.mp4`

Never overwrite the original. If the user says "replace it", move the
original to `original/` first.

## Key operations

### Inspect
```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,codec_name,duration \
  -of default=noprint_wrappers=1 "$INPUT"
```

### Crop (remove watermark / UI overlay)
The crop filter takes `w:h:x:y` — width, height, top-left corner.
Use `ffprobe` to get the real resolution first; eyeball or pixel-count to
find the region to keep.

```bash
ffmpeg -i "$INPUT" -vf "crop=W:H:X:Y" -c:a copy "$OUTPUT"
```

For web assets that need re-encoding anyway, chain crop + encode in one pass:
```bash
ffmpeg -i "$INPUT" \
  -vf "crop=W:H:X:Y,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k \
  "$OUTPUT"
```
The `trunc(…)*2` ensures width/height are even — libx264 requires this.

### Trim (cut start / end)
```bash
# Fast cut using keyframes (may not be frame-accurate at start)
ffmpeg -ss 00:00:05 -to 00:00:30 -i "$INPUT" -c copy "$OUTPUT"

# Frame-accurate (re-encodes, slower)
ffmpeg -i "$INPUT" -ss 00:00:05 -to 00:00:30 \
  -c:v libx264 -crf 23 -c:a aac "$OUTPUT"
```
Prefer `-c copy` for trimming silent background clips; prefer re-encode for
anything shown to users where a clean first frame matters.

### Compress / convert for web (MP4)
```bash
ffmpeg -i "$INPUT" \
  -c:v libx264 -crf 26 -preset slow \
  -profile:v baseline -level 3.0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -c:a aac -b:a 96k \
  "$OUTPUT.mp4"
```
- `-crf 26` — good quality/size balance; lower = better quality, bigger file
- `-movflags +faststart` — puts the moov atom at the front for faster web streaming
- `yuv420p` — broadest browser / device compatibility

### Convert for web (WebM — smaller, no royalties)
```bash
ffmpeg -i "$INPUT" \
  -c:v libvpx-vp9 -crf 33 -b:v 0 \
  -c:a libopus -b:a 64k \
  "$OUTPUT.webm"
```

### Resize / scale
```bash
# Scale to max width 1280, keep aspect ratio
ffmpeg -i "$INPUT" -vf "scale=1280:-2" -c:v libx264 -crf 23 "$OUTPUT"

# Scale to specific dimensions (may distort — use only if you know the ratio)
ffmpeg -i "$INPUT" -vf "scale=1920:1080" -c:v libx264 -crf 23 "$OUTPUT"
```
`-2` rounds the auto-calculated dimension to the nearest even number (required
by libx264).

### Remove audio
```bash
ffmpeg -i "$INPUT" -c:v copy -an "$OUTPUT"
```

### Extract a frame / thumbnail
```bash
# Single frame at timestamp
ffmpeg -ss 00:00:02 -i "$INPUT" -frames:v 1 -q:v 2 thumbnail.jpg

# One frame every N seconds
ffmpeg -i "$INPUT" -vf "fps=1/5" frame_%04d.jpg
```

### Loop a short clip (for hero background videos)
```bash
# Create a 30-second looping version of a 4-second clip
ffmpeg -stream_loop 7 -i "$INPUT" -t 30 -c copy "$OUTPUT"
```
`-stream_loop N` repeats the input N+1 times. Calculate N = ceil(target / duration) - 1.

### Change playback speed
```bash
# 2× faster (halve duration)
ffmpeg -i "$INPUT" -vf "setpts=0.5*PTS" -af "atempo=2.0" "$OUTPUT"

# 0.5× slower (double duration)
ffmpeg -i "$INPUT" -vf "setpts=2.0*PTS" -af "atempo=0.5" "$OUTPUT"
```

### Concatenate clips
```bash
# Write a list file
printf "file '%s'\n" clip1.mp4 clip2.mp4 clip3.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy "$OUTPUT"
```
All clips must have the same codec, resolution, and frame rate for `-c copy`
to work correctly. If they differ, re-encode each to a common spec first.

### Batch process (multiple files)
```bash
for f in docs/assets/*.mp4; do
  ffmpeg -i "$f" -vf "scale=1280:-2" -c:v libx264 -crf 26 \
    "${f%.mp4}-web.mp4"
done
```

## Codec quick reference

| Goal | Video codec | Audio codec | Container |
|------|-------------|-------------|-----------|
| Max compatibility | libx264 | aac | .mp4 |
| Smallest file, modern browsers | libvpx-vp9 | libopus | .webm |
| Lossless archival | libx264 -crf 0 | aac | .mp4 |
| GIF replacement | libvpx-vp9 -an | (none) | .webm |

## CRF quality guide (libx264)

| CRF | Use case |
|-----|----------|
| 18–20 | Near-lossless, large files |
| 23 | Default, good quality |
| 26–28 | Web assets, hero backgrounds |
| 30–32 | Previews, thumbnails |

## After running ffmpeg

Always verify the output:
```bash
ffprobe -v error -show_streams -of json "$OUTPUT" | python3 -m json.tool
ls -lh "$INPUT" "$OUTPUT"   # compare file sizes
```
Report: resolution, codec, duration, audio streams, and file size before/after.

## Error patterns to watch for

- **width/height not divisible by 2** → add `scale=trunc(iw/2)*2:trunc(ih/2)*2`
- **No audio stream** → add `-an` or the output will have silent audio track issues
- **Moov atom not at start** → add `-movflags +faststart` for web
- **Can't open output** → check path exists and no write-protected existing file
