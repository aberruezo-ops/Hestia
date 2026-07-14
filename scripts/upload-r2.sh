#!/usr/bin/env bash
# ================================================================
# Hestía · Subida de vídeos a Cloudflare R2
# Uso: bash scripts/upload-r2.sh <fichero.mp4>
#      bash scripts/upload-r2.sh all          ← sube todos los .mp4 de la carpeta
# ================================================================
#
# CONFIGURACIÓN PREVIA (una sola vez):
#   1. npm install -g wrangler
#   2. wrangler login
#   3. Crear el bucket:  wrangler r2 bucket create hestia-videos
#   4. Activar acceso público en el Dashboard de Cloudflare:
#      R2 → hestia-videos → Settings → Public access → Enable
#   5. Opcional: añadir dominio propio (videos.hestiayourhome.com)
#      en R2 → Custom Domains
#
# SUBIDA DE FICHEROS:
#   bash scripts/upload-r2.sh hero-playa.mp4
#   bash scripts/upload-r2.sh all
#
# URL resultante (acceso público):
#   https://pub-XXXXXXXX.r2.dev/hero-playa.mp4
#   o bien (con dominio propio):
#   https://videos.hestiayourhome.com/hero-playa.mp4
# ================================================================

set -euo pipefail

BUCKET="hestia-videos"
# Carpeta local donde están los vídeos a subir
VIDEO_DIR="docs/assets"

# ── Colores para la terminal ──────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC} $*"; }
fail() { echo -e "${RED}✗${NC} $*"; exit 1; }

# ── Comprobar que wrangler está instalado ─────────────────────────
command -v wrangler &>/dev/null || fail "wrangler no encontrado. Instálalo: npm install -g wrangler"

# ── Función: subir un fichero ─────────────────────────────────────
upload_file() {
  local FILE="$1"
  local BASENAME
  BASENAME="$(basename "$FILE")"

  echo "Subiendo $BASENAME a R2/$BUCKET …"
  wrangler r2 object put "${BUCKET}/${BASENAME}" \
    --file "$FILE" \
    --content-type "video/mp4" \
    --cache-control "public, max-age=31536000, immutable"

  ok "Subido: $BASENAME"
  echo "   URL (pública): https://pub-<ID>.r2.dev/${BASENAME}"
  echo "   URL (dominio): https://videos.hestiayourhome.com/${BASENAME}"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────
if [[ "${1:-}" == "all" ]]; then
  mapfile -t FILES < <(find "$VIDEO_DIR" -maxdepth 1 -name "*.mp4" | sort)
  if [[ ${#FILES[@]} -eq 0 ]]; then
    fail "No se encontraron .mp4 en $VIDEO_DIR"
  fi
  warn "Se subirán ${#FILES[@]} vídeo(s) a R2/$BUCKET:"
  printf '  %s\n' "${FILES[@]}"
  echo ""
  read -rp "¿Continuar? [s/N] " CONFIRM
  [[ "${CONFIRM,,}" == "s" ]] || { echo "Cancelado."; exit 0; }
  for f in "${FILES[@]}"; do
    upload_file "$f"
  done
  ok "Todos los vídeos subidos."
elif [[ -n "${1:-}" ]]; then
  TARGET="$1"
  # Si no se da ruta completa, busca en VIDEO_DIR
  [[ -f "$TARGET" ]] || TARGET="${VIDEO_DIR}/${TARGET}"
  [[ -f "$TARGET" ]] || fail "No se encuentra el fichero: $TARGET"
  upload_file "$TARGET"
else
  echo "Uso:"
  echo "  bash scripts/upload-r2.sh <fichero.mp4>   # sube un vídeo"
  echo "  bash scripts/upload-r2.sh all              # sube todos"
  exit 1
fi
