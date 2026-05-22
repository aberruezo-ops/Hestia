# Registro de Actividades de Tratamiento (RAT)
**Responsables del tratamiento:** Alex Berruezo Márquez · Francisco Javier Moral Arévalo  
**Actividad:** Alquiler vacacional — Hestía Your Home · Vera Playa (Almería)  
**Fecha de redacción:** Mayo 2026  
**Última revisión:** Mayo 2026

> Documento interno conforme al art. 30 RGPD (UE) 2016/679 y LOPD-GDD 3/2018.  
> No es un documento público. Conservar junto a contratos y documentación fiscal.

---

## Actividad 1 — Gestión de reservas y contratos de arrendamiento

| Campo | Detalle |
|---|---|
| **Finalidad** | Gestionar solicitudes de reserva, formalizar contratos de arrendamiento turístico, cumplir obligaciones fiscales y de registro de viajeros |
| **Base jurídica** | Art. 6.1.b RGPD (ejecución de contrato) · Art. 6.1.c RGPD (obligación legal: registro de viajeros, normativa tributaria) |
| **Categorías de datos** | Nombre completo, DNI/pasaporte, fecha de nacimiento, nacionalidad, teléfono, email, fechas de estancia, número de personas, importe económico |
| **Interesados** | Huéspedes adultos responsables de la reserva |
| **Origen de los datos** | Proporcionados por el propio interesado (WhatsApp, email, formulario web) |
| **Destinatarios** | Responsables del tratamiento (Alex y Fran) · Obligación legal: Ministerio del Interior (registro de viajeros) si aplica |
| **Transferencias internacionales** | No |
| **Plazo de conservación** | 5 años desde la última estancia (normativa fiscal art. 66 LGT) · DNI/pasaporte: eliminado tras el registro obligatorio si no hay obligación de conservación adicional |
| **Soporte** | Archivo JSON en repositorio GitHub privado (`data-private/`) · Emails y mensajes de WhatsApp en dispositivos personales de los responsables |
| **Medidas de seguridad** | Repositorio privado · Acceso restringido a los dos responsables · Sin servidores propios |

---

## Actividad 2 — Publicación de opiniones de huéspedes

| Campo | Detalle |
|---|---|
| **Finalidad** | Recibir, revisar y publicar voluntariamente opiniones de huéspedes verificados en el sitio web |
| **Base jurídica** | Art. 6.1.a RGPD (consentimiento explícito mediante checkbox en el formulario) |
| **Categorías de datos** | Nombre o alias de firma, dirección de email, texto libre de la opinión, apartamento donde se alojó, fecha de estancia, valoración numérica |
| **Interesados** | Huéspedes que han completado una estancia y deciden voluntariamente dejar una opinión |
| **Origen de los datos** | Formulario web `/escribir-opinion.html` |
| **Destinatarios** | Web3Forms (Singular Bits LLC, api.web3forms.com) — encargado del tratamiento que reenvía el formulario al email de los responsables sin almacenamiento permanente |
| **Transferencias internacionales** | Sí — Web3Forms (EE.UU.) · Base: garantías adecuadas conforme al art. 46 RGPD |
| **Plazo de conservación** | Mientras la opinión esté publicada en la web · Email recibido: eliminado tras revisión y decisión de publicación |
| **Dato publicado** | Solo nombre/alias y texto de opinión · El email nunca se publica |
| **Soporte** | `docs/data/reviews.json` en repositorio GitHub privado · Email de los responsables |
| **Medidas de seguridad** | Repositorio privado · PIN de verificación de huésped real antes del envío · Honeypot anti-spam · Revisión manual antes de publicar |
| **Retirada del consentimiento** | El interesado puede solicitar la retirada de su opinión escribiendo a info@hestiayourhome.com |

---

## Actividad 3 — Comunicaciones directas (WhatsApp y email)

| Campo | Detalle |
|---|---|
| **Finalidad** | Responder consultas, confirmar reservas, gestionar incidencias durante la estancia |
| **Base jurídica** | Art. 6.1.b RGPD (ejecución de contrato o medidas precontractuales) |
| **Categorías de datos** | Nombre, teléfono y/o email, contenido de la comunicación |
| **Interesados** | Potenciales huéspedes y huéspedes actuales |
| **Origen de los datos** | Iniciativa del propio interesado |
| **Destinatarios** | Responsables del tratamiento únicamente |
| **Transferencias internacionales** | No (salvo las inherentes a WhatsApp/Meta y al proveedor de email del interesado, fuera del control de los responsables) |
| **Plazo de conservación** | Duración de la relación + 1 año. Datos no necesarios para la reserva: eliminados al concluir la consulta |
| **Soporte** | Dispositivos personales de los responsables (WhatsApp, aplicación de email) |
| **Medidas de seguridad** | Acceso restringido a dispositivos personales protegidos con PIN/biometría |

---

## Actividad 4 — Analítica web agregada

| Campo | Detalle |
|---|---|
| **Finalidad** | Medir visitas al sitio web de forma agregada y anónima para mejorar el servicio |
| **Base jurídica** | Art. 6.1.f RGPD (interés legítimo: analítica técnica anónima que no identifica usuarios) |
| **Categorías de datos** | Ningún dato personal identificable · Solo métricas agregadas (páginas vistas, países aproximados, dispositivo, referrer) |
| **Interesados** | Visitantes del sitio web |
| **Encargado del tratamiento** | Cloudflare Web Analytics (Cloudflare, Inc., EE.UU.) |
| **Transferencias internacionales** | Sí — Cloudflare (EE.UU.) · Base: garantías adecuadas conforme al art. 46 RGPD |
| **Plazo de conservación** | No aplica (no se recogen datos personales) |
| **Consentimiento** | El script solo se carga si el visitante acepta las cookies analíticas · Los visitantes que elijan "Solo esenciales" no generan ningún dato de analítica |
| **Test de ponderación (art. 6.1.f)** | Interés legítimo: mejora técnica del sitio · Sin impacto en derechos del interesado: los datos son anónimos y agregados, sin posibilidad de identificación individual · Expectativa razonable: el usuario es informado en la política de cookies y puede rechazar |

---

## Derechos de los interesados

Los interesados pueden ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad dirigiéndose a:

**Email:** info@hestiayourhome.com  
**Dirección postal:** Calle Islas Canarias 7, 04621 Vera Playa, Almería

Plazo de respuesta: 1 mes (prorrogable 2 meses en casos complejos, art. 12 RGPD).

En caso de no obtener respuesta satisfactoria, el interesado puede reclamar ante la **Agencia Española de Protección de Datos (AEPD):** www.aepd.es

---

## Historial de revisiones

| Fecha | Cambio |
|---|---|
| Mayo 2026 | Redacción inicial del RAT |
