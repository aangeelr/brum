# Web de Brum

Página de descarga de **Brum · Sim Racing Academy**. HTML, CSS y JS sin frameworks, pensada para GitHub Pages.

- `index.html`, `css/brum.css`, `js/brum.js`: la página.
- `js/datos.js`: telemetría real (Oulton Park, MX-5 ND Cup, AC EVO) y las vueltas de Brands Hatch. Lo genera
  `tools/preparar_assets.py`; no se edita a mano.
- `assets/capturas`, `assets/video`: capturas y clip sacados de las grabaciones de la app del 15/10/2026.
- `assets/fotos`: dos fotos de Wikimedia Commons con licencia CC BY (créditos en el pie de la página y en
  `assets/credits.json`).
- `assets/fonts`: Archivo y Barlow (licencia OFL, incluida).

## Publicar

1. Repositorio público en GitHub (por ejemplo `brum`) con esta carpeta en la raíz.
2. *Settings → Pages*: rama `main`, carpeta `/ (root)`. La web queda en `https://aangeelr.github.io/brum/`.
3. Los enlaces de descarga apuntan a `github.com/aangeelr/brum`.

## Subir una versión nueva

Cada versión es una *Release* con el instalador adjunto **siempre con el mismo nombre**,
`Brum-instalador.exe`. Así el botón (`releases/latest/download/Brum-instalador.exe`) siempre baja la última.
El número de versión va en el título de la release y en los textos de la página (`0.6.1`).

Con la CLI de GitHub:

```bash
gh release create v0.6.1 "Brum-instalador.exe" --title "Brum 0.6.1" --notes "..."
```

## Consultar descargas (oculto en la web normal)

Abre `https://aangeelr.github.io/brum/?estadisticas=1#estadisticas`: abre el contador y te lleva hasta él.
También puedes desplegar «Estadísticas de descargas» al final de la web normal; las cifras están ocultas hasta abrirlo.
El contador suma las descargas de `Brum-instalador.exe` de todas las releases disponibles,
incluidas las anteriores a este cambio. GitHub cuenta las descargas sin depender del JavaScript de la web.
No cuenta usuarios únicos ni instalaciones y también incluye descargas desde fuera de la web.
Si se borra o sustituye un archivo de una release, se pierde su cuenta anterior.
El parámetro oculta la cifra a los visitantes habituales; no es una contraseña: los datos de GitHub son públicos.
Sin el parámetro ni abrir el desplegable no se muestra la cifra ni se consulta la API. Si GitHub falla o limita las consultas,
se muestra un aviso en lugar de un cero engañoso.

Comprobación: `node --test tools/descargas.test.cjs`.

## Regenerar capturas y datos

```bash
python tools/preparar_assets.py
```

Lee los vídeos de `~/Videos`, los assets de `../pitwall/assets`, la telemetría de `../BRUM-promo` y la copia de
seguridad de `../brum-backups` (solo lectura).

## Comprobar

`tools/tour.js`, `tools/tour-movil.js` y `tools/captura-completa.js` sacan capturas con Playwright CLI:

```bash
npx @playwright/cli@latest -s=brum open http://localhost:8642/
npx @playwright/cli@latest -s=brum run-code --filename=tools/captura-completa.js
```
