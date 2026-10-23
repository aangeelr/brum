/* GitHub cuenta las descargas del instalador. Consulta: ?estadisticas=1 */
(async () => {
  const contador = document.querySelector("[data-descargas]");
  const panel = document.querySelector("[data-estadisticas]");
  if (!contador || !panel) return;
  let cargado = false;
  async function cargar() {
    if (cargado) return;
    cargado = true;
    contador.hidden = false;
    contador.textContent = "Consultando descargas…";
    try {
      let total = 0;
      for (let pagina = 1; ; pagina++) {
        const respuesta = await fetch(`https://api.github.com/repos/aangeelr/brum/releases?per_page=100&page=${pagina}`, {
          headers: { Accept: "application/vnd.github+json" },
          signal: AbortSignal.timeout(10000)
        });
        if (!respuesta.ok) throw new Error(`GitHub: ${respuesta.status}`);
        const versiones = await respuesta.json();
        for (const version of versiones) {
          if (version.draft) continue;
          for (const archivo of version.assets) {
            if (archivo.name === "Brum-instalador.exe") total += archivo.download_count;
          }
        }
        if (versiones.length < 100) break;
      }
      contador.textContent = `Descargas del instalador: ${total.toLocaleString("es-ES")} · Todas las versiones disponibles en GitHub. Incluye descargas repetidas; no son usuarios únicos.`;
    } catch {
      cargado = false;
      contador.textContent = "No se pudo consultar el contador de GitHub. Vuelve a intentarlo más tarde.";
    }
  }
  panel.addEventListener("toggle", () => { if (panel.open) cargar(); });
  if (new URLSearchParams(window.location.search).get("estadisticas") === "1") {
    panel.open = true;
    panel.scrollIntoView({ behavior: "instant", block: "center" });
    await cargar();
    panel.scrollIntoView({ behavior: "instant", block: "center" });
  }
})();
