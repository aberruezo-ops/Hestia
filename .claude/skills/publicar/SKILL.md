---
name: publicar
description: Publica los cambios de la sesión en la web de Hestía. Compila, verifica, hace commit en la rama de trabajo, push y fusión directa en main.
disable-model-invocation: true
---

# Publicar en la web

Ritual de publicación del proyecto (decisión del propietario: tras cada cambio,
fusión directa en `main` sin preguntar). Ejecútalo en orden y para en cuanto
algo falle; nunca uses `--force` ni `--no-verify`.

## 1. Compilar

```bash
node scripts/build-jsx.js
```

Si sale `failed` distinto de 0, para y corrige.

## 2. Versión del CSS

Los hooks solo suben `styles.css?v=` cuando el CSS se edita con Edit/Write.
Si `docs/assets/styles.css` ha cambiado respecto a `origin/main` pero la versión
de `docs/index.html` es la misma que en `origin/main`, súbela a mano:

```bash
git fetch -q origin main
if ! git diff --quiet origin/main -- docs/assets/styles.css; then
  CUR=$(grep -oE 'styles\.css\?v=[0-9]+' docs/index.html | head -1 | grep -oE '[0-9]+$')
  MAIN=$(git show origin/main:docs/index.html | grep -oE 'styles\.css\?v=[0-9]+' | head -1 | grep -oE '[0-9]+$')
  if [ "$CUR" = "$MAIN" ]; then
    sed -i "s/styles\.css?v=$CUR/styles.css?v=$((CUR + 1))/g" docs/*.html
  fi
fi
```

## 3. Verificar

- `node scripts/test-pricing.mjs`: si falla, es un bug de precio y no se publica.
- Si el cambio es visible (texto, estilos, componentes, imágenes), lanza el
  subagente `revisor-marca` y corrige lo que marque como bloqueante.

## 4. Revisar qué se sube

```bash
git status --short
git diff --stat
```

Comprueba que no van secretos, datos de huéspedes, capturas de depuración ni
ficheros ajenos al cambio. Añade solo lo que corresponde (`git add` por ruta).

## 5. Commit y push de la rama

Mensaje en español, explicando el porqué del cambio, con las líneas de
atribución que indique la sesión. Después:

```bash
RAMA=$(git branch --show-current)
git push -u origin "$RAMA"
```

## 6. Fusión en main

```bash
git fetch -q origin main
git checkout -q main
git merge -q --ff-only origin/main
git merge --no-edit "$RAMA"
git push -q origin main
git checkout -q "$RAMA"
```

Si la fusión da conflicto, para, deja `main` como estaba (`git merge --abort`) y
explícale al usuario qué choca.

## 7. Informe

Una o dos frases: qué se ha publicado, el hash del commit y el de la fusión en
`main`. GitHub Pages tarda uno o dos minutos en servirlo.

El repo privado `aberruezo-ops/hestia-data` (reservas) no sigue este ritual: allí
se trabaja directamente en `main`.
