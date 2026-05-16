# Plantilla unificada · Contrato de arrendamiento por temporada

Esta es la plantilla cerrada que rellena el generador de `/p-edit.html → 📄 Contrato`. Cada `{{placeholder}}` se sustituye por el valor que tú metas en el formulario; cada `[VARIANTE]` se elige según el apartamento.

**Decisiones cerradas** (mayo 2026):
1. **Política de cancelación**: la dictas tú al crear cada contrato (campo libre de días).
2. **Fianza**: toggle sí/no en el formulario. Cuando sí → 300 € fijos.
3. **Huésped adicional**: 20 €/noche (fuente: `prices.json`).
4. **Cláusula de fuerza mayor**: SIEMPRE incluida.
5. **Texto COVID-19**: eliminado.
6. **Plazas de garaje**: Mar = 160 · Thalassa = 163 · Salinas = 290.
7. **Servicios adicionales**: tabla al final del contrato sincronizada con `docs/data/prices.json` (la misma que ve el cliente en la web y editas en `/p-edit`).
8. **Fecha de firma**: se rellena automáticamente con la fecha del día en que se genera el contrato (`new Date()` en el navegador). Editable en el formulario por si quieres antedatar o postdatar.
9. **Entrega al cliente**: en vez de un botón "Descargar PDF", el botón será **"Generar y enviar por correo"**. Al pulsarlo:
    a) Se descarga el PDF en tu equipo automáticamente.
    b) Se abre tu cliente de correo (`mailto:`) con destinatario = email del huésped, asunto y cuerpo prerrellenados (ver borrador al final del documento).
    c) Tú adjuntas el PDF descargado al borrador y lo envías.
    *(Limitación técnica: `mailto:` no permite adjuntar archivos automáticamente desde el navegador — por eso el flujo es descarga + adjuntar manual.)*

---

## CONTRATO DE ARRENDAMIENTO POR TEMPORADA

Madrid, **{{FECHA_FIRMA}}**

### REUNIDOS

Por una parte, **D. Alejandro Berruezo Márquez** y **D. Francisco Javier Moral Arévalo**, mayores de edad, y con domicilio a efectos de notificaciones en Avenida de la Constitución 38, 1A, 28821 de Coslada, Madrid, con DNI. ***DNI-RETIRADO*** y ***DNI-RETIRADO***, telf. 620316370 y 654138251, respectivamente, y correo electrónico: info@hestiayourhome.com y cuenta corriente: ***IBAN-RETIRADO***.

*(De ahora en adelante, "Los Propietarios".)*

De otra parte,
**D./Dña. {{NOMBRE_ARRENDATARIO}}**, mayor de edad,
con domicilio a efectos de notificaciones en: **{{DOMICILIO_ARRENDATARIO}}**,
con Documento Nacional de Identidad: **{{DNI_ARRENDATARIO}}**,
y con teléfono: **{{TELEFONO_ARRENDATARIO}}**.

*(en adelante, "la Parte Arrendataria".)*

Ambas partes se reconocen capacidad legal suficiente para este acto y libremente,

### EXPONEN

**I.** Que el Propietario es titular de la siguiente finca en perfecto estado de uso:

**VIVIENDA:** Dirección: **{{APT_DIRECCION_COMPLETA}}**, en Vera (Almería), y plaza de garaje **{{APT_PLAZA_GARAJE}}**, en las condiciones y con los muebles y servicios cuya descripción y fotografías se exponen en la página web www.hestiayourhome.com.

La vivienda se entrega limpia, en perfecto estado de uso, conservación y habitabilidad y los suministros y servicios que posee la misma se encuentran en funcionamiento. La vivienda se devolverá limpia y en perfecto estado.

[VARIANTE: SOLO HVM (Mar)]
> Hestía permite acceder a la vivienda desde el garaje sin apenas escalones (no más de dos), pero no desde el portal desde donde existen unos 6 escalones aproximadamente. Dentro de Hestía, el acceso a la terraza tiene el marco de la ventana y la ducha y la bañera no están preparadas para personas con movilidad reducida, por lo que requerirían ayuda.

Hestía se encuentra en una zona de expansión y existen obras de construcción {{ZONA_OBRAS}}. La Parte Arrendataria da por conocida esta situación y los Propietarios no se hacen responsables de cualquier situación ocasionada por dichas obras.

**II.** Ambas partes han acordado concertar el arrendamiento por temporada de la finca antes descrita, por lo que establecen el presente contrato, que se regirá por lo dispuesto en las siguientes,

### CLÁUSULAS

#### PRIMERA · OBJETO

El Propietario cede en arrendamiento de temporada con la duración que se indicará a la Parte Arrendataria, que acepta, la finca descrita.

#### SEGUNDA · RENTA Y FIANZA

**2.1** La renta neta es de **{{PRECIO_TOTAL_LETRAS}} ({{PRECIO_TOTAL_NUM}}) EUROS** para **{{N_HUESPEDES_LETRAS}} ({{N_HUESPEDES}}) personas**{{BLOQUE_MASCOTA_RENTA}}. Este contrato no tendrá validez en los siguientes casos:

- Sin el correspondiente justificante de abono en la cuenta ***IBAN-RETIRADO*** o BIZUM al teléfono +34 620 316 370 de la prereserva, es decir, **{{PRERESERVA_LETRAS}} ({{PRERESERVA_NUM}}) EUROS**. Deberá ingresarse en el momento de la formalización de este contrato.
- Sin el correspondiente abono en efectivo del remanente de la estancia, es decir, **{{REMANENTE_LETRAS}} ({{REMANENTE_NUM}}) EUROS**. Deberá pagarse en efectivo en el momento del check-in.
- Si no se envía el DNI o pasaporte de cada uno de los huéspedes mayores de 16 años, como adjunto al contrato firmado.
{{LINEA_FIANZA_REQUISITO}}  *(solo si fianza activada: "- Si no se ha realizado la transferencia por la fianza que se explica en el punto 2.4.")*

**2.2** La cancelación del contrato con más de **{{DIAS_CANCELACION_LETRAS}} ({{DIAS_CANCELACION}}) días** del inicio de la reserva no supondrá ningún coste, aunque se agradece comunicar lo antes posible la cancelación, con el fin de que otros huéspedes puedan disfrutar de Hestía.

**2.3** La cancelación del contrato con menos de **{{DIAS_CANCELACION_LETRAS}} ({{DIAS_CANCELACION}}) días** del inicio de la estancia supondrá la pérdida de las cantidades entregadas, salvo cuestión de fuerza mayor demostrable oficialmente de alguno de los huéspedes. En este caso, si se consigue realquilar, se devolverán todas las cantidades entregadas o se podrán posponer las fechas a los próximos SEIS (6) meses desde la fecha de la estancia.

{{BLOQUE_2_4_FIANZA}}  *(solo si fianza activada: "**2.4** Dos días antes de la llegada a Hestía, la Parte Arrendataria ingresará la fianza de TRESCIENTOS (300) EUROS. Esta fianza se devolverá a la finalización de la estancia, una vez revisada la vivienda, descontando los desperfectos ocasionados, si los hubiere.")*

#### TERCERA · DURACIÓN

Este contrato se otorga por la temporada de **{{N_NOCHES_LETRAS}} ({{N_NOCHES}}) noches**, desde el día **{{FECHA_ENTRADA}}** a las 15:00, y quedará automáticamente resuelto sin necesidad de aviso alguno, el día **{{FECHA_SALIDA}}** a las 11:00, debiendo la Parte Arrendataria entregar las llaves con anterioridad.

La Parte Arrendataria deberá abandonar la finca en el estado en que la encontró, dejándola libre de efectos y enseres y permaneciendo en perfecto estado los servicios de que dispone, sin que quepa prórroga del mismo salvo acuerdo escrito entre las partes.

#### CUARTA · OBLIGACIONES DE LAS PARTES

**4.1** La Parte Arrendataria se obliga a conservar la vivienda en perfecto estado durante el plazo de duración libremente pactado entre ambas partes.

**4.2** La Parte Arrendataria no podrá alojar a más huéspedes ni realizar en la vivienda actividades molestas, insalubres, nocivas, peligrosas, ilícitas o contrarias a los Estatutos de la Comunidad. Tampoco podrá almacenar materias inflamables, explosivas o corrosivas en la vivienda y/o desarrollar, en la misma, actividades mercantiles o de industria.

**4.3** La Parte Arrendataria será directa y exclusivamente responsable y exime de toda responsabilidad a la propiedad por:
  i) Los daños que puedan ocasionarse a personas o cosas y sean derivados de mal uso por la Parte Arrendataria de instalaciones para servicios y suministros de la casa de temporada arrendada.
  ii) Los daños, deterioros o pérdidas que se produzcan en la misma, ya sean causados por la Parte Arrendataria o por las personas que convivan en la vivienda.

**4.4** La Parte Arrendataria no podrá hacer obras, ni introducir modificación alguna sin permiso escrito del Propietario. En ningún caso podrá hacer taladros o agujeros en las paredes.

**4.5** El Propietario mantendrá los suministros de agua y luz, etc., al corriente de pago y en pleno funcionamiento, así como el seguro de la vivienda vigente.

**4.6** La Parte Arrendataria se verá obligada a la reparación y conservación de los enseres y muebles siempre que se derive por mal uso, así como de las instalaciones eléctricas y fontanería, siendo por cuenta de la parte arrendadora las obras que tengan carácter de mayores.

**4.7** {{CLAUSULA_MASCOTAS}}
  *Por defecto (sin mascota): "Queda prohibida la introducción de cualquier tipo de animal doméstico o salvaje dentro de la vivienda."*
  *Con mascota: "Queda prohibida la introducción de cualquier tipo de animal doméstico o salvaje dentro de la vivienda, salvo la mascota declarada de la familia."*

**4.8** Queda prohibido el subarriendo en cualquiera de sus modalidades.

#### QUINTA · RENUNCIAS

La Parte Arrendataria renuncia a los derechos contenidos en los artículos 31 a 33 de la Ley de Arrendamientos Urbanos, y por tanto a los derechos de Arrendamiento, subrogación, cesión, o traspaso, ya sean de forma total o parcial, tanteo, retracto y derecho de impugnación de la transmisión.

#### SEXTA · CLÁUSULA PENAL

El incumplimiento de la obligación de abandonar la Vivienda en el plazo pactado obligará a la Parte Arrendataria a satisfacer en concepto de cláusula penal, la suma correspondiente al triple de la renta diaria, exigibles por semanas vencidas hasta la libre disponibilidad de la vivienda por el Propietario, sin perjuicio de las costas, gastos y demás indemnizaciones que fueran a su cargo incluso minutas de abogado y procurador, aunque no fuera preceptiva su intervención.

#### SÉPTIMA · JURISDICCIÓN

Las partes integrantes se someten a la jurisdicción y competencia de los tribunales y juzgados del lugar donde está situada la vivienda, con renuncia expresa a su fuero propio.

Ambas partes se ratifican en el presente contrato y firman por duplicado, a un solo efecto, en el lugar y fecha indicados en el encabezamiento.

#### OCTAVA · SERVICIOS INCLUIDOS

El apartamento se entrega limpio y dotado.
- Un juego de toallas por cada huésped.
- {{BLOQUE_SABANAS_POR_APT}}

#### NOVENA · SERVICIOS ADICIONALES

Los siguientes servicios pueden añadirse a la reserva. Los precios son los publicados en la web y se mantienen actualizados desde `/p-edit`:

| Servicio | Precio | Unidad |
|---|---:|---|
| Huésped adicional *(incluye sábanas y toallas)* | 20 € | por noche |
| Juego de toallas adicional | 6 € | por set |
| Juego de sábanas adicional · individual | 10 € | por set |
| Juego de sábanas adicional · doble | 12 € | por set |
| Trona | 5 € | por estancia |
| Cuna *(sábanas incluidas)* | 20 € | por estancia |
| Early check-in · 10 €/h antes de 15:00 (o 40 € desde 10:00) | 10 € | por hora |
| Late check-out · 10 €/h después de 11:00 (o 40 € hasta 18:00) | 10 € | por hora |
| Late check-in presencial · 21:00 → 23:00 | 20 € | por estancia |
| Late check-in presencial · 23:00 → 00:00 | 40 € | por estancia |
| Suplemento mascota | 10 € / noche | máx. 50 €/estancia |

#### DÉCIMA · NORMAS DE HESTÍA

Hestía dispone de productos consumibles. Por favor, sed colaborativos: si gastáis o consumís, reponed (salvo el kit que es un pequeño regalo por nuestra parte).

Respetad el medio ambiente e intentad no malgastar la luz y el agua. En vuestro hogar no dejaríais el aire acondicionado encendido con las ventanas abiertas o cuando no estáis en casa. Pues eso, sentíos como en vuestro hogar.

Asimismo, si salís, recoged los cojines, el toldo, las plantas de la terraza, especialmente si hay viento, lluvia o predicción de mal tiempo.

Respetad y no extraigáis de Hestía el equipamiento, el contenido, el mobiliario y los detalles. Sabemos que vuestro cuidado y uso va a ser de lo más respetuoso y, por eso, hemos decidido suministraros las mejores calidades: toallas y sábanas de algodón de máxima calidad, colchones viscolásticos, edredones de plumas de pato o sintéticos (por si eres alérgico), hidroterapia, cromoterapia, cuidado por los olores… Tras vuestra estancia se realizará un inventario e inspección de Hestía, con lo que cualquier deterioro o sustracción será vuestra responsabilidad.

Nuestro máximo deseo es que descanséis y que respetéis igualmente el descanso de nuestros vecinos, evitando los ruidos, la música y el jaleo a deshoras.

Hestía es exclusivamente para vuestro uso y disfrute, no para el de otros.

Respetad las horas de check-in (a partir de las 15:00) y check-out (hasta las 11:00), pues se necesita un tiempo considerable para poner Hestía a punto para la siguiente llegada.

No están permitidas las mascotas, salvo aprobación explícita.
No fuméis. En Hestía está prohibido. Vuestra salud es lo primero.
Las toallas son para uso exclusivo dentro de Hestía, no para la piscina ni para la playa.
Solo está permitido colgar ropa en el tendedero, no en las barandillas ni en la terraza.
El uso de las zonas comunes será en el horario permitido, especialmente la piscina. Será responsabilidad vuestra el incumplimiento de las normas de la urbanización.
No está permitido el naturismo ni el toples en toda la urbanización, ya que se trata de una urbanización textil.
Cualquier incidente o problemática derivada de los menores de edad, tanto en Hestía como en las zonas comunes, será responsabilidad de sus padres/tutores.
Cualquier situación o incidente de los servicios comunes o del exterior de Hestía no es responsabilidad nuestra, aunque intentaremos ayudarte.
Por favor, intenta dejar Hestía limpio y recogido. De las sábanas y toallas nos encargamos nosotros. En cualquier caso, no laves las toallas y sábanas con ropa de otro color, por favor.
Por favor, deja los cojines de la terraza en el interior si hay viento, lluvia o previsión.

---

### Firmas

| **Los Propietarios** (con una es suficiente) | **La Parte Arrendataria** |
|:---|:---|
| Fdo.: Alejandro Berruezo Márquez | Fdo.: **{{NOMBRE_ARRENDATARIO}}** |
| Fdo.: Francisco Javier Moral Arévalo |  |

---

## Tabla maestra de variantes por apartamento

### Hestía Vera Mar (HVM)
- `APT_DIRECCION_COMPLETA`: Apto. 1A, del portal 14, edificio 3, en la urbanización Paraíso Playa, en C/ Islas Canarias, 7
- `APT_PLAZA_GARAJE`: **160**
- `ZONA_OBRAS`: "enfrente"
- `BLOQUE_ACCESIBILIDAD`: **SÍ** (movilidad reducida + escalones)
- `BLOQUE_SABANAS_POR_APT`: "Un juego de sábanas para la cama de matrimonio y dos juegos de sábanas para las camas individuales."

### Hestía Vera Thalassa (HVT)
- `APT_DIRECCION_COMPLETA`: Apto. 11, planta 5ª, escalera 13, en la urbanización Thalassa, en C/ Tomillo 2
- `APT_PLAZA_GARAJE`: **163**
- `ZONA_OBRAS`: "cercanas"
- `BLOQUE_ACCESIBILIDAD`: NO
- `BLOQUE_SABANAS_POR_APT`: "Un juego de sábanas para la cama doble (D1) y un juego para cada cama individual del dormitorio dos (D2)."

### Hestía Vera Salinas (HVS)
- `APT_DIRECCION_COMPLETA`: Apto. 7, planta 1ª, bloque 22, en la urbanización Pueblo Salinas, en C/ Alcazaba 115
- `APT_PLAZA_GARAJE`: **290** ✅ confirmado
- `ZONA_OBRAS`: "cercanas"
- `BLOQUE_ACCESIBILIDAD`: NO
- `BLOQUE_SABANAS_POR_APT`: "Dos juegos de sábanas para la cama de matrimonio y sofá-cama y un juego de sábanas por cada cama individual del dormitorio dos."

---

## Inputs del formulario `/p-edit.html → 📄 Contrato`

| Campo | Tipo | Origen / Lógica |
|---|---|---|
| **Apartamento** | select (Mar / Thalassa / Salinas) | Carga la variante de dirección, garaje, accesibilidad y sábanas |
| **Nombre completo del arrendatario** | text | Se imprime en mayúsculas |
| **Domicilio del arrendatario** | text | Calle, número, ciudad, CP |
| **DNI / Pasaporte** | text | |
| **Teléfono** | text | |
| **Email** | text (opcional) | Para envío posterior por correo |
| **Fecha de entrada** | date | `{{FECHA_ENTRADA}}` |
| **Fecha de salida** | date | `{{FECHA_SALIDA}}` → calcula `{{N_NOCHES}}` |
| **Nº de huéspedes** | number 1-6 | `{{N_HUESPEDES}}` |
| **¿Mascota?** | toggle sí/no (+ nº) | Activa cláusula 4.7 variante + texto `{{BLOQUE_MASCOTA_RENTA}}` |
| **Importe total (€)** | number | Lo dictas tú al confirmar — `{{PRECIO_TOTAL_NUM}}` |
| **Importe prereserva (€)** | number | Por defecto 20-25 % del total, editable — `{{PRERESERVA_NUM}}` |
| **Política de cancelación (días)** | number | Lo dictas tú — `{{DIAS_CANCELACION}}` |
| **¿Fianza?** | toggle sí/no | Sí → 300 € fijos · activa la línea de requisito + cláusula 2.4 |
| **Fecha del contrato (firma)** | date (hoy por defecto) | `{{FECHA_FIRMA}}` |

El generador convertirá automáticamente cifras a letras (`630 → SEISCIENTOS TREINTA`) usando una librería en JS, y calculará el `{{REMANENTE_NUM}}` como `precio_total − prereserva`.

---

## Borrador del correo de envío

Cuando pulses "Generar y enviar por correo", se descargará el PDF y se abrirá tu cliente de correo con esto prerrellenado:

### Asunto
```
Contrato de reserva · Hestía Vera {{APARTAMENTO_CORTO}} · {{FECHA_ENTRADA}} → {{FECHA_SALIDA}}
```
*(Apartamento corto: Mar / Thalassa / Salinas.)*

### Destinatario
```
{{EMAIL_ARRENDATARIO}}
```

### Cuerpo

> Estimado/a **{{NOMBRE_ARRENDATARIO}}**,
>
> ¡Muchas gracias por tu interés en Hestía! Adjunto encontrarás el contrato de arrendamiento para tu estancia en **Hestía Vera {{APARTAMENTO_CORTO}}** del **{{FECHA_ENTRADA}}** al **{{FECHA_SALIDA}}**.
>
> Para confirmar tu reserva necesitamos que nos hagas llegar:
>
> 1. **El contrato firmado** por todas las partes (puedes contestar a este correo con el PDF firmado adjunto).
> 2. **El DNI o pasaporte** de cada huésped mayor de 16 años.
> 3. **El justificante de la prereserva** de **{{PRERESERVA_NUM}} €**, ingresada por transferencia a la cuenta `***IBAN-RETIRADO***` o BIZUM al teléfono `+34 620 316 370`.
>
> El remanente de **{{REMANENTE_NUM}} €** se abona en efectivo el día de la llegada, en el momento del check-in.
>
> Recibida toda la documentación, tu reserva quedará confirmada y te escribiremos unos días antes de tu llegada para coordinar el check-in (autónomo o presencial, lo que te encaje mejor).
>
> Si tienes cualquier duda, escríbenos sin problema.
>
> Un abrazo,
> **Alex y Fran** · Hestía
> `info@hestiayourhome.com` · `+34 620 316 370`

### Recordatorio al final del cuerpo (para tu yo del futuro al enviar)

> **Recuerda adjuntar el PDF que se acaba de descargar (`Hestia-{{APARTAMENTO_CORTO}}-Contrato-{{NOMBRE_ARRENDATARIO}}-{{FECHA_ENTRADA}}.pdf`) antes de pulsar Enviar.**

Este recordatorio NO se incluye en el correo al cliente — aparece como aviso/toast en `/p-edit` después de la descarga.

---

## Resumen del flujo en `/p-edit.html → 📄 Contrato`

1. Rellenas el formulario (apartamento, datos del huésped, fechas, importes, política, fianza).
2. Pulsas **Generar y enviar por correo**.
3. El navegador:
    a. Genera el PDF a partir de la plantilla con los valores sustituidos.
    b. Lo descarga automáticamente como `Hestia-{apt}-Contrato-{nombre}-{fecha}.pdf`.
    c. Abre tu cliente de correo con destinatario, asunto y cuerpo ya hechos.
4. Tú arrastras el PDF al borrador y pulsas Enviar.

Tiempo total estimado por contrato: **< 30 segundos** una vez tengas los datos del huésped a mano.
