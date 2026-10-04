# Pendientes

Decisiones y tareas que se han aplazado a propósito, con el motivo por el
que no se hicieron en el momento en que surgieron. No es un backlog de
ideas, es solo lo que se decidió dejar para después.

---

## Actualizar React 18 → 19

**Surgió:** revisión de versiones de lo que usa la web en vivo (octubre 2026).

**Estado actual:** React 18.3.1 + ReactDOM 18.3.1 (última versión de la
rama 18.x, cargadas por CDN desde unpkg con fallback local en
`docs/assets/react.development.js` / `react-dom.development.js`).

**Por qué no se hizo ya:** es un cambio de versión mayor, no un parche.
Puede alterar comportamientos sutiles (manejo de refs, warnings de act,
APIs retiradas) y este sitio no tiene tests automáticos que lo detecten
solos: build-jsx.js solo compila, no verifica comportamiento. Un bump
silencioso se descubriría con bugs en producción, no antes.

**Qué hace falta para hacerlo:**
1. Subir el pin de versión en el `<script src="https://unpkg.com/react@...">` / `react-dom@...` de cada HTML.
2. Sustituir `docs/assets/react.development.js` y `react-dom.development.js` (los fallback locales) por las copias de React 19.
3. Repasar visualmente las páginas clave (home, los 3 apartamentos, /reservas, /p-edit) en desktop y móvil tras el cambio, con el smoke test (`node scripts/smoke-test.cjs`) como mínimo, no como único control.
4. Vigilar especialmente: el calendario de reservas (mucho uso de refs y estado), el panel de admin (formularios complejos) y cualquier sitio que use `ReactDOM.createPortal` (lightbox, modales).

**Cuándo tiene sentido retomarlo:** cuando haya tiempo para hacerlo como
tarea dedicada con revisión completa, no de pasada junto a otra cosa.
