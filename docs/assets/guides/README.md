# Guías de huésped — PDFs

Sube los PDFs aquí con estos nombres exactos:

| Apartamento | PIN | Nombre del archivo |
| --- | --- | --- |
| Hestía Mar | `HVM2016` | `HVM2016.pdf` |
| Hestía Thalassa | `HVT2019` | `HVT2019.pdf` |
| Hestía Salinas | `HVS2021` | `HVS2021.pdf` |

El nombre del archivo coincide con el PIN para que la URL no sea adivinable trivialmente. La validación es client-side y no es seguridad real — quien conozca la URL podrá descargar el PDF directamente.

## Replicar en el otro portal

Mantén los mismos archivos también en:

```
nuevo-portal-de-hestia/project/assets/guides/
```

## Cambiar el PIN

Si necesitas rotar un PIN: renombra el archivo y actualiza `APT_GUIDE_PIN` en `docs/components/apartment-page.jsx` y `nuevo-portal-de-hestia/project/components/apartment-page.jsx`.
