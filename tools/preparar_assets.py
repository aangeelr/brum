"""Prepara los assets de la web a partir de material real de Brum.

- Capturas: fotogramas de las dos grabaciones de la app del 15/10/2026 (ffmpeg), recortadas a la ventana
  (sin barra de título ni barra de tareas) y guardadas en WebP a dos tamaños.
- Logo, favicon e imagen para redes: de los assets oficiales del repo de la app.
- Datos de los gráficos: telemetría real (Oulton Park, MX-5 ND Cup, AC EVO) y las vueltas reales de
  Brands Hatch con el Mini, leídas de la copia de seguridad (solo lectura).

Uso: python tools/preparar_assets.py   (desde la carpeta brum-web)
"""

import json
import sqlite3
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

WEB = Path(__file__).resolve().parent.parent
MOTOR = WEB.parent
VIDEOS = Path.home() / "Videos"
VID = {"A": VIDEOS / "2026-10-15 20-33-54.mkv", "B": VIDEOS / "2026-10-15 20-53-46.mkv"}
APP_ASSETS = MOTOR / "pitwall" / "assets"
TELEMETRIA = MOTOR / "BRUM-promo" / "assets" / "data" / "telemetria.json"
DB = MOTOR / "brum-backups" / "datos-buenos-20261015" / "data" / "telemetry.db"
# La vuelta de 1:14.847 (tanda 77, vuelta 8) con todos sus canales
VUELTA = DB.parent / "telemetry" / "077-acevo-oulton-park-mazda-mx-5-nd-cup" / "077-oulton-park-mazda-mx-5-nd-cup-vuelta-08.parquet"
OUT = WEB / "assets"

# nombre -> (vídeo, segundo). Los segundos salen de mirar los vídeos a saltos de 5 s.
CAPTURAS = {
    "envivo": ("A", 990),
    "ejercicio-ficha": ("B", 24),
    "ejercicio-evaluacion": ("B", 590),
    "licencia": ("B", 270),
    "suspension": ("B", 425),
    "canales": ("B", 490),
    "setup": ("B", 100),
    "historial": ("B", 745),
    "comunidad": ("B", 65),
    "general": ("B", 392),
    "neumaticos": ("B", 434),
    "dinamica": ("B", 446),
}
VENTANA = (0, 33, 1920, 1010)  # fuera la barra de título de Windows y la barra de tareas
DETALLES = {  # recorte para la imagen de redes, en píxeles del fotograma original
    "envivo": {"envivo-sectores": (150, 492, 885, 840)},
}


def fotograma(video, segundo, destino):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(segundo), "-i", str(VID[video]), "-frames:v", "1", str(destino)],
        check=True,
    )
    return Image.open(destino).convert("RGB")


def webp(im, nombre, anchos=(1600, 800)):
    carpeta = OUT / "capturas"
    carpeta.mkdir(parents=True, exist_ok=True)
    for ancho in anchos:
        copia = im if im.width <= ancho else im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        copia.save(carpeta / f"{nombre}-{ancho}.webp", quality=90, method=6)


def capturas():
    with tempfile.TemporaryDirectory() as tmp:
        for nombre, (video, seg) in CAPTURAS.items():
            im = fotograma(video, seg, Path(tmp) / f"{nombre}.png")
            webp(im.crop(VENTANA), nombre)
            for det, caja in DETALLES.get(nombre, {}).items():
                recorte = im.crop(caja)
                webp(recorte, det, anchos=(recorte.width,))


def marca():
    img = OUT / "img"
    img.mkdir(parents=True, exist_ok=True)
    estelas = Image.open(APP_ASSETS / "logo-color.png").convert("RGBA")
    letras = Image.open(APP_ASSETS / "logo-blanco.png").convert("RGBA")
    logo = Image.alpha_composite(estelas, letras)
    logo = logo.crop(logo.getbbox())
    logo.save(img / "logo.png", optimize=True)
    logo.resize((logo.width // 2, logo.height // 2), Image.LANCZOS).save(img / "logo-mitad.png", optimize=True)
    icono = Image.open(APP_ASSETS / "icono-oscuro.png").convert("RGBA")
    for lado, nombre in ((32, "favicon-32.png"), (180, "apple-touch-icon.png"), (512, "icono-512.png")):
        icono.resize((lado, lado), Image.LANCZOS).save(img / nombre, optimize=True)
    return logo


def imagen_redes(logo):
    """1200x630 para cuando se comparte el enlace."""
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), "#0B0B0B")
    d = ImageDraw.Draw(im)
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill="#15171A")
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill="#15171A")
    d.rectangle([0, 0, W, 6], fill="#FF5A00")
    lg = logo.copy()
    lg.thumbnail((380, 120))
    im.paste(lg, (64, 56), lg)
    fuentes = Path("C:/Windows/Fonts")
    negra = fuentes / "seguibli.ttf"
    if not negra.exists():
        negra = fuentes / "segoeuib.ttf"
    f1 = ImageFont.truetype(str(negra), 60)
    f2 = ImageFont.truetype(str(fuentes / "bahnschrift.ttf"), 30)
    d.text((64, 230), "Aprende a pilotar,", font=f1, fill="#F3F4F6")
    d.text((64, 302), "ejercicio a ejercicio.", font=f1, fill="#FF5A00")
    d.text((64, 448), "Academia de sim racing · Ejercicios · Telemetría", font=f2, fill="#D1D5DB")
    d.text((64, 492), "Gratis para Windows · en desarrollo", font=f2, fill="#2ECC71")
    sect = Image.open(OUT / "capturas" / "envivo-sectores-735.webp").convert("RGB")
    sect.thumbnail((380, 380))
    sombra = Image.new("RGBA", (sect.width + 80, sect.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rectangle([40, 52, sect.width + 40, sect.height + 52], fill=(0, 0, 0, 200))
    sombra = sombra.filter(ImageFilter.GaussianBlur(18))
    im.paste(sombra, (W - sect.width - 96, 300), sombra)
    im.paste(sect, (W - sect.width - 56, 340))
    im.save(OUT / "img" / "redes.jpg", quality=88)


def datos():
    t = json.loads(TELEMETRIA.read_text(encoding="utf-8"))
    d0 = t["delta"][0]
    # delta de la vuelta nueva (1:14.847) contra la anterior (1:15.777): negativo = vas ganando
    delta = [round(-(x - d0), 3) for x in t["delta"]]
    dist = [round(x, 1) for x in t["dist"]]

    def delta_en(m):
        for i in range(1, len(dist)):
            if dist[i] >= m:
                a = (m - dist[i - 1]) / (dist[i] - dist[i - 1])
                return delta[i - 1] + a * (delta[i] - delta[i - 1])
        return delta[-1]

    largo = dist[-1]
    cortes = [largo / 3, 2 * largo / 3, largo]
    acum = [delta_en(c) for c in cortes]
    sectores = [round(acum[0], 3), round(acum[1] - acum[0], 3), round(acum[2] - acum[1], 3)]

    e = t["envivo"]
    vivo, recorrido = [], 0.0
    for i in range(len(e["lap_time"])):
        if i:
            recorrido += e["speed"][i] * (e["lap_time"][i] - e["lap_time"][i - 1])
        if i % 2 == 0:
            vivo.append([
                round(e["lap_time"][i], 2), round(recorrido * largo / 2661.6, 1), round(e["speed"][i] * 3.6),
                round(e["throttle"][i] * 100), round(e["brake"][i] * 100), round(e["gear"][i]), round(e["rpm"][i]),
            ])
    escala = largo / vivo[-1][1]
    for fila in vivo:
        fila[1] = round(fila[1] * escala, 1)

    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    filas = con.execute(
        """select s.started_at, l.lap_number, l.lap_time from laps l join sessions s on s.id = l.session_id
           where s.track = 'Brands Hatch' and s.car = 'Mini John Cooper S' and s.guest_from = ''
             and l.valid = 1 and l.lap_time between 55 and 75 order by s.started_at, l.lap_number"""
    ).fetchall()
    sesiones = sorted({f[0] for f in filas})
    vueltas = [[sesiones.index(f[0]), f[1], round(f[2], 3)] for f in filas]

    data = {
        "comparador": {
            "sim": "Assetto Corsa EVO", "circuito": "Oulton Park", "coche": "Mazda MX-5 ND Cup",
            "nueva": t["t_rapida"], "anterior": t["t_lenta"], "dist": dist, "delta": delta,
            "vNueva": [round(v * 3.6, 1) for v in t["vel_rapida"]],
            "vAnterior": [round(v * 3.6, 1) for v in t["vel_lenta"]],
            "sectores": sectores,
        },
        "vivo": vivo,
        "banco": banco(),
        "progreso": {
            "sim": "Assetto Corsa EVO", "circuito": "Brands Hatch", "coche": "Mini John Cooper S",
            "fechas": "9 y 10 de octubre de 2026", "vueltas": vueltas,
        },
    }
    (WEB / "js").mkdir(exist_ok=True)
    (WEB / "js" / "datos.js").write_text(
        "// Generado por tools/preparar_assets.py con telemetría real. No editar a mano.\n"
        "window.BRUM_DATOS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print("sectores", sectores, "| vueltas Brands", len(vueltas), "| muestras en vivo", len(vivo))


def banco():
    """Todos los canales de la vuelta de 1:14.847, para el banco de datos de la web.

    muestras (unas 14 por segundo): [t, km/h, acelerador %, freno %, volante x100, marcha, G lateral, G longitudinal,
    freno °C DI, DD, TI, TD, suspensión mm DI, DD, TI, TD]. neumaticos (una por segundo): [°C DI..TD, psi DI..TD].
    """
    import pyarrow.parquet as pq
    v = pq.read_table(VUELTA).to_pydict()
    muestras, neumaticos, seg = [], [], 0
    for i in range(0, len(v["lap_time"]), 4):
        x = v["extra"][i]
        muestras.append([
            round(v["lap_time"][i], 2), round(v["speed"][i] * 3.6), round(v["throttle"][i] * 100), round(v["brake"][i] * 100),
            round(v["steer"][i] * 100), v["gear"][i], round(v["accel"][i][0], 2), round(v["accel"][i][1], 2),
            *[round(b) for b in x["brake_temp"]], *[round(s) for s in x["suspension_travel"]],
        ])
    for i, t in enumerate(v["lap_time"]):
        if t >= seg:
            neumaticos.append([*[round(c, 1) for c in v["tyre_temps"][i]], *[round(p, 1) for p in v["tyre_press"][i]]])
            seg += 1
    return {"muestras": muestras, "neumaticos": neumaticos}


def clip_delta():
    """Bucle corto del delta y los sectores de En vivo: un tramo verde y uno rojo, a doble velocidad."""
    (OUT / "video").mkdir(parents=True, exist_ok=True)
    caja = "crop=1740:376:150:368,scale=1600:-2"
    filtro = (
        f"[0:v]trim=start=984:end=1004,setpts=(PTS-STARTPTS)/2,{caja},fps=30[a];"
        f"[0:v]trim=start=846:end=858,setpts=(PTS-STARTPTS)/2,{caja},fps=30[b];"
        "[a][b]concat=n=2:v=1:a=0[v]"
    )
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VID["A"]), "-filter_complex", filtro, "-map", "[v]", "-an",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    str(OUT / "video" / "delta.mp4")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(OUT / "video" / "delta.mp4"), "-frames:v", "1",
                    "-c:v", "libwebp", "-quality", "85", str(OUT / "video" / "delta-poster.webp")], check=True)


if __name__ == "__main__":
    capturas()
    imagen_redes(marca())
    clip_delta()
    datos()
