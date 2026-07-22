#!/usr/bin/env python3
"""Genera placeholders LQIP (blur-up) para las fotos del sitio.

Para cada foto grande de docs/assets/ produce una miniatura ~20px muy
comprimida y difuminada, la codifica en base64 y la vuelca en
docs/data/lqip.json, con clave = ruta relativa a docs/ (p.ej.
"assets/apt-vm-gallery-1.jpg"). El front (BlurImg en shared.jsx) la usa
como fondo mientras carga la foto real, que entra con un fundido.

Uso: python3 scripts/build-lqip.py
Requiere Pillow. Solo toca imágenes fotográficas (apt-*, photo-*, hero-*),
nunca logos, planos, favicons ni marcas de agua.
"""
import base64, io, json, os, re, sys
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'docs', 'assets')
OUT = os.path.join(ROOT, 'docs', 'data', 'lqip.json')

INCLUDE = re.compile(r'^(apt-|photo-|hero-).*\.(jpe?g|png)$', re.I)
EXCLUDE = re.compile(r'plano|logo|favicon|brand|watermark|indalo|sprite|apple-touch', re.I)
LQIP_W = 20          # ancho de la miniatura base
JPEG_Q = 42          # calidad (agresiva: es un borrón)

def make_lqip(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    tw = LQIP_W
    th = max(1, round(h * tw / w))
    im = im.resize((tw, th), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    buf = io.BytesIO()
    im.save(buf, format='JPEG', quality=JPEG_Q, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    return 'data:image/jpeg;base64,' + b64

def main():
    out = {}
    total_bytes = 0
    for name in sorted(os.listdir(ASSETS)):
        p = os.path.join(ASSETS, name)
        if not os.path.isfile(p):
            continue
        if not INCLUDE.match(name) or EXCLUDE.search(name):
            continue
        try:
            uri = make_lqip(p)
        except Exception as e:
            print(f'  skip {name}: {e}', file=sys.stderr)
            continue
        out['assets/' + name] = uri
        total_bytes += len(uri)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'), ensure_ascii=False)
    print(f'LQIP: {len(out)} imágenes, {total_bytes/1024:.1f} KB en {os.path.relpath(OUT, ROOT)}')

if __name__ == '__main__':
    main()
