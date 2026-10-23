---
name: Brum · Sim Racing Academy
description: Web de descarga de Brum. La página es una vuelta: el scroll avanza metros y el delta dice dónde ganas o pierdes.
colors:
  naranja: "#FF5A00"
  naranja-vivo: "#FF7A00"
  gana: "#2ECC71"
  pierde: "#FF4B4B"
  campo-gana: "#0C2617"
  campo-pierde: "#2B0D0D"
  velocidad: "#FF9F43"
  suelo: "#0B0B0B"
  suelo-2: "#111215"
  sup: "#16171B"
  sup-2: "#1D1F24"
  app-panel: "#101114"
  app-celda: "#15171A"
  app-borde: "#26292E"
  tinta: "#F3F4F6"
  tinta-2: "#D1D5DB"
  apagado: "#9CA3AF"
typography:
  display:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(44px, 6.4vw, 104px)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(34px, 4.4vw, 74px)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(21px, 1.9vw, 30px)"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.25vw, 19px)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  numero:
    fontFamily: "Bahnschrift, Barlow, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    fontFeature: "'tnum' 1"
  numero-gigante:
    fontFamily: "Bahnschrift, Barlow, Segoe UI, sans-serif"
    fontSize: "clamp(96px, 15vw, 252px)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
rounded:
  pagina: "0px"
  app-sm: "6px"
  app-md: "8px"
  app-lg: "10px"
  app-xl: "14px"
spacing:
  tesela: "8px"
  medianil: "24px"
  margen: "clamp(16px, 3vw, 44px)"
  hueco: "clamp(96px, 12vw, 200px)"
  barra: "72px"
components:
  button-primary:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.suelo}"
    rounded: "{rounded.pagina}"
    padding: "0 28px"
    height: "58px"
  button-primary-hover:
    backgroundColor: "{colors.naranja-vivo}"
  button-barra:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.suelo}"
    rounded: "{rounded.pagina}"
    padding: "0 20px"
    height: "44px"
  chip:
    backgroundColor: "rgba(255, 255, 255, 0.09)"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pagina}"
    padding: "12px 18px"
  chip-hover:
    backgroundColor: "rgba(255, 255, 255, 0.16)"
  tesela:
    backgroundColor: "{colors.sup}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pagina}"
    padding: "24px"
  tesela-accion:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.suelo}"
    rounded: "{rounded.pagina}"
    padding: "24px"
  pregunta:
    backgroundColor: "{colors.sup}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pagina}"
    padding: "16px 24px"
  pregunta-abierta:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.suelo}"
  app-caja:
    backgroundColor: "{colors.app-celda}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.app-lg}"
    padding: "8px 12px"
  app-campo:
    backgroundColor: "{colors.suelo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.app-md}"
    padding: "0 14px"
    height: "48px"
  metro:
    backgroundColor: "#15161A"
    textColor: "{colors.tinta-2}"
    typography: "{typography.numero}"
    rounded: "{rounded.app-sm}"
    padding: "8px 12px"
---

# Design System: Brum · Sim Racing Academy

## Overview

**Creative North Star: "La hoja de debrief"**

La página se lee como la vuelta que el piloto revisa después de la tanda. El scroll es distancia de pista: una barra fija arriba cuenta los metros de Oulton Park y el delta real de esa vuelta, y cada sección es un tramo. El suelo es negro liso (#0B0B0B, sin rejilla ni textura); encima, titulares en itálica muy negra y ancha, números de cronometraje tabulares, y fragmentos de la propia app (HUD En vivo, Comparador, gráfico de vueltas, diálogo de instalación) construidos en HTML vivo con las convenciones de la app.

Dos geometrías conviven a propósito. El cromo de la página es cuadrado y plano: botones, chips, teselas y preguntas sin radio ni sombra. Los fragmentos de la app (todo lo marcado `data-ui`) llevan las esquinas redondeadas, los bordes de 1px y la profundidad de la app real, y las capturas flotan en perspectiva con sombra suave. Así se distingue «esto es la web» de «esto es Brum».

El color es funcional antes que decorativo: verde es mejora, rojo es pérdida, naranja es la marca y la acción. Las secciones de campo completo (la sección Delta, el final de descarga) usan el color como suelo, no como adorno.

**Key Characteristics:**
- Suelo negro liso; superficies en grises fríos casi negros, sin rejilla ni ruido.
- Archivo variable: itálica 900 con anchura 112–125 % para titulares; redonda para texto.
- Todo número en Bahnschrift/Barlow con cifras tabulares.
- Verde = mejora, rojo = pérdida, naranja = marca y acción. Nunca se intercambian.
- Cromo de página cuadrado y plano; fragmentos de la app redondeados y con profundidad.
- Movimiento con propósito: titular enmascarado, HUD que reproduce la vuelta a 3x, cortinillas con clip-path, fundidos con desenfoque, paralaje suave en fotos; todo cae a estático con movimiento reducido.

## Colors

Negro de pit wall con tres voces: naranja que actúa, verde que gana, rojo que pierde.

### Primary
- **Naranja Brum** (naranja): el color de la marca y de toda acción. Botones de descarga, barra de progreso de la vuelta, cursor y tirador del Comparador, anillo de foco, selección de texto, pregunta abierta, tesela de cabecera de Simuladores, tesela de Ko-fi y el campo completo del final de descarga. En los fragmentos de la app marca el sector en curso.
- **Naranja vivo** (naranja-vivo): solo el hover de lo que ya es naranja.

### Secondary
- **Verde mejora** (gana): delta negativo, sector ganado, mejor vuelta, línea de mejores vueltas. También el canal de acelerador en los gráficos de pedales.
- **Rojo pérdida** (pierde): delta positivo, sector perdido, vuelta más lenta. También el canal de freno.
- **Campo verde / Campo rojo** (campo-gana, campo-pierde): el suelo entero de la sección Delta cambia entre estos dos según el signo del delta bajo el cursor (transición de 450ms).

### Tertiary
- **Naranja velocidad** (velocidad): solo el trazo y la lectura de velocidad en los gráficos de la app.

### Neutral
- **Suelo** (suelo): fondo de la página y de la barra fija; texto sobre naranja.
- **Suelo 2** (suelo-2): alterna con el suelo en bloques grandes (texto de Cómo funciona, tesela de marca del pie).
- **Superficie / Superficie 2** (sup, sup-2): teselas, preguntas cerradas, paneles de captura; sup-2 para el hover y la tesela «Tus datos».
- **Panel, celda y borde de la app** (app-panel, app-celda, app-borde): el fondo del HUD, del gráfico de vueltas y del diálogo; las cajas interiores; el borde de 1px y el anillo de sombra de toda captura.
- **Tinta / Tinta 2 / Apagado** (tinta, tinta-2, apagado): texto principal, secundario (menú, leyendas, subtítulos) y terciario (notas, ejes, créditos).

### Named Rules
**La regla del semáforo.** Verde y rojo solo significan mejora y pérdida de tiempo (o acelerador y freno dentro de un gráfico). Nunca decoran, nunca marcan estados de interfaz ajenos al tiempo.

**La regla del naranja que actúa.** Si es naranja, se puede pulsar o es la marca. Un texto naranja que no hace nada miente.

## Typography

**Display Font:** Archivo variable, redonda e itálica, peso 100–900, anchura 62–125 % (con Segoe UI, system-ui)
**Body Font:** Archivo (con Segoe UI, system-ui)
**Label/Mono Font:** Bahnschrift, con Barlow 500/600/700 de respaldo, cifras tabulares

**Character:** La itálica muy negra y ensanchada repite la palabra BRUM del logo; Bahnschrift es la letra de cronometraje de la app. Una grita, la otra mide.

### Hierarchy
Cinco tamaños de texto y nada más (más el número gigante del delta).
- **Display** (900 itálica, anchura 125 %, clamp(44px, 6.4vw, 104px), 0.95): solo el titular de inicio, en líneas enmascaradas. En teléfono pasa a 11.6vw y anchura 112 %, siempre ancha.
- **Headline** (900 itálica, anchura 112 %, clamp(34px, 4.4vw, 74px), 0.95, -0.03em): los h2 de sección. Los titulares de etapa y de herramientas usan la misma voz a tamaño propio.
- **Title** (500, clamp(21px, 1.9vw, 30px), 1.35): frases de apoyo y h3 de bloque (1.1).
- **Body** (400, clamp(17px, 1.25vw, 19px), 1.55): texto corrido, 30–54ch según bloque.
- **Label** (14px): pies de dato, créditos, figcaption. Las etiquetas internas de la app van en mayúsculas de 11–13px con 0.04–0.06em de tracking; eso pertenece a los fragmentos, no a la página.
- **Número** (Bahnschrift 700, tabular): tiempos, deltas, metros, versión. El número gigante del delta llega a clamp(96px, 15vw, 252px) con interlínea 0.88.

### Named Rules
**La regla de la itálica negra.** Todo titular de la página es Archivo 900 itálica con anchura por encima de 105 %. Nada de titulares redondos o finos.

**La regla del número tabular.** Toda cifra que cambia o se compara va en la fuente de números con cifras tabulares, y con punto decimal (1:14.847, −0.926).

## Layout

Rejilla de 12 columnas con medianil de 24px y margen lateral fluido (margen). Las secciones se separan con un hueco vertical grande (hueco) y se mueven por bloques de pantalla casi completa (88–92svh). La barra fija mide 72px (60px en teléfono) y el scroll deja ese hueco al saltar a un ancla.

Composición asimétrica: titular a todo lo ancho, texto en las columnas 1–4 y el HUD en 5–12; Academia sangrada 14vw a la izquierda; Herramientas con la lista en 1–5 y la captura fija (sticky) en 6–12. Las rejillas de teselas (Simuladores, pie) usan juntas de 8px (6px en teléfono), como un tablero.

Dos cortes: 1100px (desaparece el menú, todo a una columna, la captura sticky pasa a rejilla estática) y 700px (barra compacta, HUD sin inclinación, teselas a dos columnas, diálogo a todo el ancho).

## Elevation & Depth

La página es plana: ninguna superficie del cromo lleva sombra. La profundidad es exclusiva de los fragmentos de la app y las capturas, que flotan en perspectiva 3D (rotateY −5 a −10°, rotateX 2–4°) con un anillo de 1px y una sombra larga y suave. Las fotos de pista van detrás, desaturadas y veladas con negro al 45–55 %.

### Shadow Vocabulary
- **Anillo de app** (`box-shadow: 0 0 0 1px #26292E`): contorno de todo fragmento y captura.
- **Flotante** (`box-shadow: 0 0 0 1px #26292E, 0 40px 80px -36px rgba(0,0,0,0.9)`): capturas en perspectiva (Cómo funciona, Academia).
- **Flotante alto** (`box-shadow: 0 0 0 1px #26292E, 0 60px 120px -40px rgba(0,0,0,0.9), 0 24px 48px -24px rgba(0,0,0,0.7)`): el HUD de inicio y la captura sticky de Herramientas.
- **Sobre naranja** (`box-shadow: 0 40px 80px -30px rgba(0,0,0,0.45), 0 0 0 1px #26292E`): el diálogo sobre el campo naranja del final.

### Named Rules
**La regla de las dos capas.** La web es plana; Brum flota. Si un elemento no es un fragmento o una captura de la app, no lleva sombra ni perspectiva.

## Shapes

Cromo de página con esquinas vivas (0px): botones, chips, teselas, preguntas, el tirador del Comparador y la barra de rango. Fragmentos de la app con el radio de la app: 6px (contador de la barra), 8px (campos, segmentos y botón del diálogo), 10px (cajas, sectores, capturas), 12–14px (diálogo, HUD, gráfico de vueltas). Los únicos círculos son los puntos de vuelta del gráfico y el indicador de grabación. Los iconos son trazos SVG con terminación cuadrada.

## Components

### Beta, versiones y estadísticas

El inicio explica que es una beta ya usable y en construcción; se repite junto a la descarga, en preguntas y en el pie.
El historial conserva las versiones y fechas reales en un visor de 300px, con la actual arriba y scroll para consultar las anteriores.
Al entrar en pantalla una vez, el carrete baja y frena en la versión actual. Tras una pausa, la 1.0 con ojos intenta colarse: la actual la despide con un guante. La 1.0 vuelve a asomar, ve el guante preparado y se esconde (4800ms, transform y opacity, WAAPI). Un botón permite repetirlo; «1.0 en camino» deja claro que aún no es una versión publicada.
Movimiento reducido muestra directamente la versión actual. Pausa e interacción con el historial cancelan el movimiento.
Las cifras de descargas permanecen dentro de un desplegable discreto al final; `?estadisticas=1#estadisticas` lo abre y lleva hasta él.

### Buttons
Contundentes y cuadrados, como una placa de pit board.
- **Shape:** esquinas vivas (0px).
- **Primary:** naranja con texto suelo, 800, 18px, 58px de alto, 0 28px; icono de descarga en trazo de 2.6px.
- **Hover / Focus:** pasa a naranja vivo y la flecha baja y vuelve (700ms); al pulsar escala 0.97; foco con anillo naranja de 2px separado 3px. El hover solo existe con puntero fino.
- **Barra:** misma pieza a 44px y 16px dentro de la barra fija; se oculta en teléfono.
- **Dentro del diálogo:** la misma pieza toma el radio de la app (8px), porque es la app.

### Chips
- **Style:** blanco al 9 % sobre el campo, sin borde, 600 16px, 12px 18px, esquinas vivas.
- **State:** hover al 16 %, pulsado a 0.97. Son acciones (saltar al punto de más ganancia o pérdida), no filtros.

### Cards / Containers
- **Corner Style:** vivas (0px).
- **Background:** superficie; la tesela de cabecera y la de Ko-fi en naranja con texto suelo; la de Comunidad sobre su captura desenfocada y oscurecida.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Border:** ninguno; se separan por juntas de 8px.
- **Internal Padding:** 24px (16–20px en teléfono).

### Inputs / Fields
Solo dentro del diálogo de instalación, con las convenciones de la app.
- **Style:** fondo suelo, borde 1px #33373E, radio 8px, 48px de alto; etiqueta en mayúsculas 13px apagado.
- **Focus:** el borde pasa a naranja.
- **Segmentado:** dos mitades unidas, la marcada en naranja con texto suelo.
- **Rango (Comparador, Cómo funciona):** pista blanca al 18 % de 8px con relleno tinta y tirador cuadrado naranja de 32px (40px en teléfono).

### Navigation
- **Barra fija:** fondo suelo, logo de imagen a 40px (32px en teléfono), menú en tinta 2 a 16px que pasa a tinta en hover, contador de metros y delta, y el botón de descarga. Una línea de progreso naranja de 3px arriba avanza con el scroll.
- **Contador (metro):** cápsula de la app (radio 6px) en números tabulares; el delta se tiñe verde o rojo según la tendencia de los últimos 100 m.
- **Teléfono:** sin menú ni botón; el contador pierde el nombre de la pista.

### Preguntas
Acordeón nativo: tesela superficie, 20px 600, cruz de dos barras de 3px. Abierta se vuelve naranja con texto suelo y la cruz gira a menos; el contenido se despliega por altura (320ms).

### Fragmento En vivo (HUD)
Reproducción de una vuelta real a velocidad 3x: delta con barra centrada en cero, sectores que se llenan en naranja y se resuelven en verde o rojo con un salto de escala, cajas de vuelta y tiempo, pedales y velocidad en canvas, y un aviso de nueva mejor vuelta que sube al final. Se pausa fuera de pantalla y se inclina siguiendo el puntero en escritorio.

### Comparador (delta arrastrable)
Campo completo verde o rojo, número gigante del delta en el color del tono, traza nueva sólida y anterior discontinua, curva de delta en verde/rojo y cursor naranja. Se arrastra metro a metro; el titular cambia de palabra con un fundido desenfocado.

### Gráfico de vueltas
Panel de la app con puntos verdes o rojos por vuelta, anillo verde en la mejor y la línea de mejores vueltas trazada al entrar en pantalla (1600ms).

## Do's and Don'ts

### Do:
- **Do** usar el naranja (#FF5A00) para toda acción y para la marca, y naranja vivo solo como su hover.
- **Do** reservar verde (#2ECC71) y rojo (#FF4B4B) para ganar y perder tiempo, también como color de campo completo.
- **Do** escribir los titulares en Archivo 900 itálica con anchura 112–125 % y las cifras en Bahnschrift tabular con punto decimal.
- **Do** construir los fragmentos de la app en HTML vivo con su radio (6–14px), su anillo de 1px #26292E y su profundidad; y dejar el cromo de la página cuadrado y plano.
- **Do** revelar con cortinilla de clip-path (1100ms, ease-in-out) las capturas inclinadas y con subida y fundido (700–900ms, ease-out, escalonado 75ms) los bloques.
- **Do** caer a estado final sin inclinación, paralaje ni reproducción cuando el usuario pide menos movimiento.
- **Do** pintar los datos de cuatro esquinas con los colores por rueda de la marca: DI roja, DD verde, TI azul, TD amarilla.

### Don't:
- **Don't** redondear ni sombrear botones, chips o teselas de la página fuera de un fragmento de la app.
- **Don't** usar verde o rojo como adorno o para estados que no sean tiempo.
- **Don't** escribir titulares redondos, finos o estrechos.
- **Don't** redibujar el logo en texto; es imagen.
- **Don't** añadir rejilla, ruido ni textura al suelo negro.
