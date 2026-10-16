/* Brum · web de descarga. Todo con datos reales de js/datos.js. */
(() => {
  const D = window.BRUM_DATOS;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const menosMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MENOS = "−";

  const miles = (n) => String(Math.round(n));
  const tVuelta = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s - m * 60).toFixed(3).padStart(6, "0")}`;
  };
  const tDelta = (x, dec = 3) => {
    const r = Number(x.toFixed(dec));
    return (r > 0 ? "+" : r < 0 ? MENOS : "±") + Math.abs(r).toFixed(dec);
  };
  const lerp = (a, b, k) => a + (b - a) * k;
  const limita = (x, a, b) => Math.min(b, Math.max(a, x));

  // ---------- Datos de la vuelta (Oulton Park) ----------
  const C = D.comparador;
  const L = C.dist[C.dist.length - 1];
  const CORTES = [L / 3, (2 * L) / 3, L];

  function interp(xs, ys, x) {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
    let lo = 0, hi = xs.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid; else hi = mid;
    }
    const k = (x - xs[lo]) / (xs[hi] - xs[lo]);
    return ys[lo] + (ys[hi] - ys[lo]) * k;
  }
  const deltaEn = (m) => interp(C.dist, C.delta, m);
  const estadoDe = (x, umbral = 0.0005) => (x < -umbral ? "gana" : x > umbral ? "pierde" : "");

  // Muestras de En vivo: [t, metro, km/h, acelerador, freno, marcha, rpm]
  const V = D.vivo;
  const escalaT = C.nueva / V[V.length - 1][0];
  const VT = V.map((f) => f[0] * escalaT);
  const VM = V.map((f) => f[1]);
  const tEnMetro = (m) => interp(VM, VT, m);
  const SECT = CORTES.map((c, i) => {
    const tNueva = tEnMetro(c) - (i ? tEnMetro(CORTES[i - 1]) : 0);
    const dAcum = deltaEn(c) - (i ? deltaEn(CORTES[i - 1]) : 0);
    return { tNueva, tAnterior: tNueva - dAcum, delta: C.sectores[i] };
  });

  // ---------- Entradas por sección ----------
  const visto = new IntersectionObserver(
    (ents) => ents.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visto");
      visto.unobserve(e.target);
    }),
    { rootMargin: "0px 0px -12% 0px" }
  );
  $$(".tablero [data-revela]").forEach((el, i) => el.style.setProperty("--i", i % 4));
  $$("[data-revela]").forEach((el) => visto.observe(el));

  // ---------- Barra: el scroll es una vuelta ----------
  const barra = { prog: $("[data-progreso]"), metro: $("[data-metro]"), m: $("[data-metro-m]"), d: $("[data-metro-d]") };
  let pedidoScroll = false;
  function alScroll() {
    pedidoScroll = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? limita(scrollY / max, 0, 1) : 0;
    barra.prog.style.transform = `scaleX(${p})`;
    const m = p * L;
    const meta = p > 0.995;
    const d = meta ? deltaEn(L) : deltaEn(Math.min(L, m + 50)) - deltaEn(Math.max(0, m - 50));
    barra.m.textContent = meta ? "Meta" : `${miles(m)} m`;
    barra.d.textContent = tDelta(d);
    barra.metro.classList.toggle("gana", d < -0.0005);
    barra.metro.classList.toggle("pierde", d > 0.0005);
    paralaje();
  }
  addEventListener("scroll", () => { if (!pedidoScroll) { pedidoScroll = true; requestAnimationFrame(alScroll); } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(alScroll));

  const fotos = $$("[data-parallax]");
  function paralaje() {
    if (menosMov) return;
    for (const img of fotos) {
      const caja = img.parentElement.getBoundingClientRect();
      if (caja.bottom < 0 || caja.top > innerHeight) continue;
      const k = (caja.top + caja.height / 2 - innerHeight / 2) / innerHeight;
      img.style.transform = `translate3d(0, ${(k * -9).toFixed(2)}%, 0)`;
    }
  }

  // ---------- HUD En vivo: la vuelta real reproducida ----------
  const hud = $("[data-hud]");
  if (hud) {
    const H = {
      tiempo: $("[data-hud-tiempo]", hud), delta: $("[data-hud-delta]", hud), barra: $("[data-hud-barra]", hud),
      kmh: $("[data-hud-kmh]", hud), dist: $("[data-hud-dist]", hud), marcha: $("[data-hud-marcha]", hud), rpm: $("[data-hud-rpm]", hud),
      secs: $$("[data-sec]", hud), total: $("[data-total]", hud), ultima: $("[data-ultima]", hud), mejor: $("[data-mejor]", hud),
    };
    H.secs.forEach((el, i) => { $("[data-ref]", el).textContent = SECT[i].tAnterior.toFixed(3); });

    const lienzos = [$("[data-hud-pedales]", hud), $("[data-hud-vel]", hud)].map((cv) => ({ cv, cx: cv.getContext("2d") }));
    function ajustaLienzos() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      for (const l of lienzos) {
        const r = l.cv.getBoundingClientRect();
        l.w = Math.max(1, r.width); l.h = Math.max(1, r.height);
        l.cv.width = Math.round(l.w * dpr); l.cv.height = Math.round(l.h * dpr);
        l.cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    ajustaLienzos();
    addEventListener("resize", ajustaLienzos);

    const VENTANA = 10;
    function dibuja(idx) {
      const t = VT[idx];
      const desde = t - VENTANA;
      let i0 = idx;
      while (i0 > 0 && VT[i0 - 1] >= desde) i0--;
      const [ped, vel] = lienzos;
      const x = (tt, l) => ((tt - desde) / VENTANA) * l.w;
      // Pedales: acelerador verde relleno, freno rojo
      let c = ped.cx;
      c.clearRect(0, 0, ped.w, ped.h);
      c.strokeStyle = "rgba(255,255,255,0.06)"; c.lineWidth = 1;
      for (const g of [0.25, 0.5, 0.75]) { c.beginPath(); c.moveTo(0, ped.h * g); c.lineTo(ped.w, ped.h * g); c.stroke(); }
      for (const [canal, color, relleno] of [[3, "#2ECC71", "rgba(46,204,113,0.22)"], [4, "#FF4B4B", "rgba(255,75,75,0.28)"]]) {
        c.beginPath();
        c.moveTo(x(VT[i0], ped), ped.h);
        for (let i = i0; i <= idx; i++) c.lineTo(x(VT[i], ped), ped.h - (V[i][canal] / 100) * (ped.h - 4));
        c.lineTo(x(VT[idx], ped), ped.h);
        c.closePath(); c.fillStyle = relleno; c.fill();
        c.beginPath();
        for (let i = i0; i <= idx; i++) { const y = ped.h - (V[i][canal] / 100) * (ped.h - 4); i === i0 ? c.moveTo(x(VT[i], ped), y) : c.lineTo(x(VT[i], ped), y); }
        c.strokeStyle = color; c.lineWidth = 2; c.stroke();
      }
      // Velocidad
      c = vel.cx;
      c.clearRect(0, 0, vel.w, vel.h);
      c.strokeStyle = "rgba(255,255,255,0.06)"; c.lineWidth = 1;
      for (const g of [0.25, 0.5, 0.75]) { c.beginPath(); c.moveTo(0, vel.h * g); c.lineTo(vel.w, vel.h * g); c.stroke(); }
      const yv = (k) => vel.h - ((k - 40) / 150) * (vel.h - 6);
      c.beginPath();
      for (let i = i0; i <= idx; i++) { i === i0 ? c.moveTo(x(VT[i], vel), yv(V[i][2])) : c.lineTo(x(VT[i], vel), yv(V[i][2])); }
      c.strokeStyle = "#FF9F43"; c.lineWidth = 2.2; c.stroke();
    }

    let estadoHud = "";
    function ponDelta(d) {
      H.delta.textContent = tDelta(d);
      const e = estadoDe(d);
      if (e !== estadoHud) { hud.classList.toggle("gana", e === "gana"); hud.classList.toggle("pierde", e === "pierde"); estadoHud = e; }
      const k = limita(Math.abs(d) / 1.5, 0, 1);
      // Negativo (vas ganando) a la derecha, como en la app
      H.barra.style.transform = d <= 0 ? `scaleX(${k})` : `translateX(-100%) scaleX(${k})`;
      H.barra.style.transformOrigin = d <= 0 ? "0 50%" : "100% 50%";
    }

    function sector(i, modo) {
      const el = H.secs[i];
      const S = SECT[i];
      el.classList.remove("vivo", "gana", "pierde");
      const p = $("[data-p]", el);
      if (modo === "pendiente") { $("[data-d]", el).textContent = "—"; $("[data-t]", el).textContent = ""; p.style.transform = "scaleX(0)"; return; }
      if (modo === "hecho") {
        el.classList.add(estadoDe(S.delta) || "gana");
        $("[data-d]", el).textContent = tDelta(S.delta, 2);
        $("[data-t]", el).textContent = S.tNueva.toFixed(3);
        p.style.transform = "scaleX(1)";
        if (!menosMov) { el.classList.remove("salta"); void el.offsetWidth; el.classList.add("salta"); }
        return;
      }
      el.classList.add("vivo");
    }

    const VEL = 3;
    let idx = 0, secActual = -1, t0 = 0, tVivo = 0, enMeta = false, metaHasta = 0, visible = false, rafHud = 0;
    function reinicia(ahora, desde = 0) {
      idx = 0; secActual = -1; tVivo = desde; t0 = ahora - (desde * 1000) / VEL; enMeta = false;
      hud.classList.remove("meta");
      H.secs.forEach((_, i) => sector(i, "pendiente"));
      $("[data-d]", H.total).textContent = "—"; $("[data-t]", H.total).textContent = "";
      H.total.classList.remove("gana", "pierde");
      H.ultima.classList.remove("gana"); $("[data-v]", H.ultima).textContent = "—";
      H.mejor.classList.remove("gana"); $("[data-v]", H.mejor).textContent = tVuelta(C.anterior);
    }
    function meta() {
      enMeta = true;
      H.tiempo.textContent = tVuelta(C.nueva);
      sector(2, "hecho");
      $("[data-d]", H.total).textContent = tDelta(C.delta[C.delta.length - 1], 2);
      $("[data-t]", H.total).textContent = tVuelta(C.nueva);
      H.total.classList.add("gana");
      H.ultima.classList.add("gana"); $("[data-v]", H.ultima).textContent = tVuelta(C.nueva);
      H.mejor.classList.add("gana"); $("[data-v]", H.mejor).textContent = tVuelta(C.nueva);
      ponDelta(C.delta[C.delta.length - 1]);
      hud.classList.add("meta");
    }
    function cuadro(ahora) {
      rafHud = 0;
      if (!visible || document.hidden) return;
      if (enMeta) {
        if (ahora >= metaHasta) reinicia(ahora);
      } else {
        const t = ((ahora - t0) / 1000) * VEL;
        tVivo = t;
        while (idx < VT.length - 1 && VT[idx + 1] <= t) idx++;
        const f = V[idx];
        H.tiempo.textContent = tVuelta(Math.min(t, C.nueva));
        H.kmh.textContent = f[2];
        H.dist.textContent = miles(f[1]);
        H.marcha.textContent = f[5] || "N";
        H.rpm.textContent = miles(f[6]);
        ponDelta(deltaEn(f[1]));
        const s = f[1] < CORTES[0] ? 0 : f[1] < CORTES[1] ? 1 : 2;
        if (s !== secActual) {
          for (let k = Math.max(0, secActual); k < s; k++) sector(k, "hecho");
          sector(s, "vivo"); secActual = s;
        }
        const ini = s ? CORTES[s - 1] : 0;
        $("[data-d]", H.secs[s]).textContent = (Math.min(t, C.nueva) - (s ? tEnMetro(CORTES[s - 1]) : 0)).toFixed(1);
        $("[data-p]", H.secs[s]).style.transform = `scaleX(${limita((f[1] - ini) / (CORTES[s] - ini), 0, 1)})`;
        dibuja(idx);
        if (idx >= VT.length - 1) { meta(); metaHasta = ahora + 3200; }
      }
      rafHud = requestAnimationFrame(cuadro);
    }
    function arranca() { if (!rafHud && visible && !document.hidden) { if (!enMeta) t0 = performance.now() - (tVivo * 1000) / VEL; rafHud = requestAnimationFrame(cuadro); } }

    if (menosMov) {
      reinicia(0);
      [0, 1].forEach((i) => sector(i, "hecho"));
      idx = VT.length - 1;
      dibuja(idx);
      H.kmh.textContent = V[idx][2]; H.dist.textContent = miles(V[idx][1]); H.marcha.textContent = V[idx][5]; H.rpm.textContent = miles(V[idx][6]);
      meta();
    } else {
      reinicia(performance.now(), Math.max(0, SECT[0].tNueva - 2.5));
      new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; if (visible) arranca(); }, { threshold: 0.1 }).observe(hud);
      document.addEventListener("visibilitychange", arranca);
    }

    // Inclinación con el ratón, con inercia
    const escena = $("[data-tilt]");
    if (escena && !menosMov && matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth > 700) {
      let objX = -7, objY = 4, x = -7, y = 4, rafT = 0;
      const mueve = () => {
        x = lerp(x, objX, 0.08); y = lerp(y, objY, 0.08);
        escena.style.setProperty("--ry", `${x.toFixed(2)}deg`);
        escena.style.setProperty("--rx", `${y.toFixed(2)}deg`);
        rafT = Math.abs(x - objX) + Math.abs(y - objY) > 0.02 ? requestAnimationFrame(mueve) : 0;
      };
      addEventListener("pointermove", (e) => {
        objX = -7 + (e.clientX / innerWidth - 0.5) * 6;
        objY = 4 - (e.clientY / innerHeight - 0.5) * 4;
        if (!rafT) rafT = requestAnimationFrame(mueve);
      }, { passive: true });
    }
  }

  // ---------- Delta: arrastra por la vuelta ----------
  const sec = $("[data-delta]");
  if (sec) {
    const svg = $("svg", sec);
    const W = 1000, Hh = 300, ARR = 18, ABJ = 150, ALT_V = 130, ALT_D = 120;
    const vMin = 50, vMax = 175;
    const dMin = Math.min(...C.delta), dMax = Math.max(...C.delta);
    const xm = (m) => (m / L) * W;
    const yv = (v) => ARR + ALT_V - ((v - vMin) / (vMax - vMin)) * ALT_V;
    const yd = (d) => ABJ + 10 + ((d - dMax) / (dMin - dMax)) * ALT_D;
    const camino = (ys) => C.dist.map((m, i) => `${i ? "L" : "M"}${xm(m).toFixed(1)} ${ys[i].toFixed(1)}`).join("");
    $("[data-vel-ant]", sec).setAttribute("d", camino(C.vAnterior.map(yv)));
    $("[data-vel-nue]", sec).setAttribute("d", camino(C.vNueva.map(yv)));
    const ns = "http://www.w3.org/2000/svg";
    const nuevo = (tag, at) => { const el = document.createElementNS(ns, tag); for (const k in at) el.setAttribute(k, at[k]); return el; };
    const gs = $(".dg-sectores", svg);
    CORTES.forEach((c, i) => {
      const x0 = xm(i ? CORTES[i - 1] : 0);
      if (i % 2 === 0) gs.append(nuevo("rect", { x: x0, y: 0, width: xm(c) - x0, height: Hh }));
      const et = document.createElement("span"); et.className = "etq"; et.style.left = `calc(${(x0 / W) * 100}% + 10px)`; et.textContent = `S${i + 1}`;
      $("[data-delta-graf]", sec).append(et);
    });
    // Delta en tramos: verde donde baja (ganas), rojo donde sube (pierdes)
    const gd = $(".dg-delta", svg);
    gd.append(nuevo("line", { x1: 0, x2: W, y1: yd(0), y2: yd(0) }));
    const nP = C.dist.length;
    const signos = C.dist.map((_, i) => (C.delta[Math.min(nP - 1, i + 3)] - C.delta[Math.max(0, i - 3)] < 0 ? -1 : 1));
    for (let pasada = 0; pasada < 2; pasada++) {
      let a = 1;
      while (a < nP) {
        let b = a;
        while (b + 1 < nP && signos[b + 1] === signos[a]) b++;
        if (b - a < 5 && a > 1) for (let k = a; k <= b; k++) signos[k] = signos[a - 1];
        a = b + 1;
      }
    }
    let tramo = null, signo = 0;
    for (let i = 1; i < nP; i++) {
      const s = signos[i];
      const p = `${xm(C.dist[i - 1]).toFixed(1)} ${yd(C.delta[i - 1]).toFixed(1)}`;
      if (s !== signo) { if (tramo) gd.append(tramo.el); tramo = { el: nuevo("path", { class: s < 0 ? "g" : "p" }), d: `M${p}` }; signo = s; }
      tramo.d += `L${xm(C.dist[i]).toFixed(1)} ${yd(C.delta[i]).toFixed(1)}`;
      tramo.el.setAttribute("d", tramo.d);
    }
    if (tramo) gd.append(tramo.el);

    const rango = $("[data-delta-rango]", sec);
    rango.max = Math.floor(L);
    const cursor = $("[data-cursor]", sec);
    const R = { n: $("[data-delta-n]", sec), m: $("[data-delta-m]", sec), s: $("[data-delta-s]", sec), local: $("[data-delta-local]", sec), palabra: $("[data-delta-palabra]", sec) };
    let estadoCampo = "gana", tocado = false;
    function pinta(m) {
      const d = deltaEn(m);
      const loc = deltaEn(Math.min(L, m + 50)) - deltaEn(Math.max(0, m - 50));
      R.n.textContent = tDelta(loc);
      R.m.textContent = `${miles(m)} m`;
      R.s.textContent = `Sector ${m < CORTES[0] ? 1 : m < CORTES[1] ? 2 : 3}`;
      R.local.textContent = `delta acumulado ${tDelta(d)} s`;
      cursor.setAttribute("x1", xm(m)); cursor.setAttribute("x2", xm(m));
      rango.parentElement.style.setProperty("--p", (m / L).toFixed(4));
      rango.setAttribute("aria-valuetext", `${miles(m)} metros: ${tDelta(loc)} segundos en estos 100 metros, ${tDelta(d)} acumulado`);
      const e = loc > 0.004 ? "pierde" : loc < -0.004 ? "gana" : estadoCampo;
      if (e !== estadoCampo) {
        estadoCampo = e;
        sec.dataset.estado = e;
        R.palabra.classList.add("cambia");
        setTimeout(() => { R.palabra.textContent = e === "gana" ? "Aquí ganas." : "Aquí pierdes."; R.palabra.classList.remove("cambia"); }, menosMov ? 0 : 160);
      }
    }
    rango.addEventListener("input", () => { tocado = true; para(); pinta(Number(rango.value)); });

    // Arrastrar sobre el gráfico
    const graf = $("[data-delta-graf]", sec);
    const metroDe = (e) => { const r = graf.getBoundingClientRect(); return limita(((e.clientX - r.left) / r.width) * L, 0, L); };
    graf.addEventListener("pointerdown", (e) => {
      tocado = true; para();
      graf.setPointerCapture(e.pointerId);
      rango.value = metroDe(e); pinta(Number(rango.value));
      const mover = (ev) => { rango.value = metroDe(ev); pinta(Number(rango.value)); };
      const suelta = () => { graf.removeEventListener("pointermove", mover); graf.removeEventListener("pointerup", suelta); graf.removeEventListener("pointercancel", suelta); };
      graf.addEventListener("pointermove", mover); graf.addEventListener("pointerup", suelta); graf.addEventListener("pointercancel", suelta);
    });

    // Donde más ganas / pierdes: tramo de 250 m con mayor cambio de delta
    function extremo(signoBuscado) {
      let mejor = 0, centro = 0;
      for (let m = 0; m <= L - 250; m += 10) {
        const c = deltaEn(m + 250) - deltaEn(m);
        if (c * signoBuscado > mejor) { mejor = c * signoBuscado; centro = m + 125; }
      }
      return centro;
    }
    const destinos = { gana: extremo(-1), pierde: extremo(1) };
    let rafD = 0;
    function para() { if (rafD) cancelAnimationFrame(rafD); rafD = 0; }
    function viaja(destino, ms = 900) {
      para();
      const desde = Number(rango.value);
      if (menosMov) { rango.value = destino; pinta(destino); return; }
      const ini = performance.now();
      const paso = (ahora) => {
        const k = limita((ahora - ini) / ms, 0, 1);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const m = lerp(desde, destino, e);
        rango.value = m; pinta(m);
        rafD = k < 1 ? requestAnimationFrame(paso) : 0;
      };
      rafD = requestAnimationFrame(paso);
    }
    $$("[data-salto]", sec).forEach((b) => b.addEventListener("click", () => { tocado = true; viaja(destinos[b.dataset.salto]); }));
    pinta(0);
    // Una pasada de muestra al entrar, hasta donde más ganas
    new IntersectionObserver((ents, obs) => {
      if (!ents[0].isIntersecting) return;
      obs.disconnect();
      if (!tocado) viaja(destinos.gana, 2200);
    }, { threshold: 0.45 }).observe(sec);
  }

  // ---------- Cómo funciona: cuatro etapas ----------
  const et = $("[data-etapas]");
  if (et) {
    const rango = $("[data-etapas-rango]", et);
    const nombres = $$("[data-ir]", et);
    const video = $("[data-video]", et);
    let enVista = false;
    function ve(n) {
      n = limita(Math.round(n), 0, 3);
      et.dataset.etapa = n;
      $$(".etapa-t, .etapa-m", et).forEach((el) => el.classList.toggle("activa", Number(el.dataset.et) === n));
      nombres.forEach((b, i) => (i === n ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
      rango.value = n;
      rango.parentElement.style.setProperty("--p", (n / 3).toFixed(3));
      rango.setAttribute("aria-valuetext", nombres[n].textContent);
      if (video) { if (n === 0 && enVista && !menosMov) video.play().catch(() => {}); else video.pause(); }
    }
    rango.addEventListener("input", () => ve(Number(rango.value)));
    nombres.forEach((b, i) => b.addEventListener("click", () => ve(i)));
    new IntersectionObserver((ents) => {
      enVista = ents[0].isIntersecting;
      if (video) { if (enVista && Number(et.dataset.etapa) === 0 && !menosMov) { video.preload = "auto"; video.play().catch(() => {}); } else video.pause(); }
    }, { threshold: 0.35 }).observe(et);
    ve(0);
  }

  // ---------- Mejora: 32 vueltas reales ----------
  const vu = $("[data-vueltas]");
  if (vu) {
    const P = D.progreso.vueltas; // [tanda, número de vuelta, tiempo]
    const n = P.length;
    const tiempos = P.map((v) => v[2]);
    const tMin = Math.min(...tiempos), tMax = Math.max(...tiempos);
    const yMin = Math.floor(tMin) - 0.4, yMax = Math.ceil(tMax) + 0.4;
    const X = (i) => 3 + (i / (n - 1)) * 94; // en %
    const Y = (t) => 6 + ((t - yMin) / (yMax - yMin)) * 88; // más rápido arriba
    const svg = $("[data-vueltas-svg]", vu);
    const ns = "http://www.w3.org/2000/svg";
    const nuevo = (tag, at) => { const el = document.createElementNS(ns, tag); for (const k in at) el.setAttribute(k, at[k]); return el; };
    const caja = $("[data-vueltas-puntos]", vu);
    // Tandas como bandas de tono
    let ini = 0;
    for (let i = 1; i <= n; i++) {
      if (i === n || P[i][0] !== P[ini][0]) {
        const x0 = (X(ini) - (ini ? 47 / (n - 1) : 3)) * 10, x1 = (X(i - 1) + (i < n ? 47 / (n - 1) : 3)) * 10;
        if (P[ini][0] % 2 === 0) svg.append(nuevo("rect", { class: "vs-tanda", x: x0, y: 0, width: x1 - x0, height: 360 }));
        const anchoPx = ((x1 - x0) / 1000) * caja.getBoundingClientRect().width;
        if (anchoPx >= 30) {
        const et = document.createElement("span"); et.className = "etq etq-tanda"; et.style.left = `calc(${x0 / 10}% + 6px)`;
        et.textContent = innerWidth < 700 ? `T${P[ini][0] + 1}` : `Tanda ${P[ini][0] + 1}`;
        caja.append(et);
        }
        ini = i;
      }
    }
    for (let s = Math.ceil(yMin); s <= Math.floor(yMax); s++) {
      if ((s - Math.ceil(yMin)) % 2) continue;
      const y = (Y(s) / 100) * 360;
      svg.append(nuevo("line", { class: "vs-guia", x1: 30, x2: 1000, y1: y, y2: y }));
      const et = document.createElement("span"); et.className = "etq etq-eje"; et.style.top = `${Y(s)}%`; et.textContent = tVuelta(s).slice(0, 4);
      $("[data-vueltas-puntos]", vu).append(et);
    }
    const traza = nuevo("path", { class: "vs-traza", d: P.map((v, i) => `${i ? "L" : "M"}${X(i) * 10} ${(Y(v[2]) / 100) * 360}`).join("") });
    svg.append(traza);
    let mejor = Infinity, dMejor = "";
    const esMejor = [];
    P.forEach((v, i) => {
      const nuevoMejor = v[2] < mejor;
      if (nuevoMejor) mejor = v[2];
      esMejor.push(nuevoMejor);
      const x = X(i) * 10, y = (Y(mejor) / 100) * 360;
      dMejor += i ? `H${x}V${y}` : `M${x} ${y}`;
    });
    dMejor += `H${X(n - 1) * 10}`;
    const linMejor = nuevo("path", { class: "vs-mejor", d: dMejor });
    svg.append(linMejor);

    const lect = { t: $("[data-vl-t]", vu), i: $("[data-vl-i]", vu) };
    const botones = P.map((v, i) => {
      const b = document.createElement("button");
      b.type = "button";
      const dif = i ? v[2] - P[i - 1][2] : 0;
      b.className = `pt ${i ? (dif < 0 ? "g" : "p") : ""} ${esMejor[i] ? "mejor" : ""}`;
      b.style.left = `${X(i)}%`; b.style.top = `${Y(v[2])}%`;
      b.style.transitionDelay = `${i * 22}ms`;
      b.setAttribute("aria-label", `Vuelta ${i + 1}: ${tVuelta(v[2])}`);
      b.setAttribute("aria-pressed", "false");
      const muestra = () => {
        botones.forEach((o) => o.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        lect.t.textContent = tVuelta(v[2]);
        const partes = [`Vuelta ${i + 1} de ${n}`, `tanda ${v[0] + 1}`];
        if (i) partes.push(`<b class="${dif < 0 ? "g" : "p"}">${tDelta(dif)} s</b> respecto a la anterior`);
        if (esMejor[i] && i) partes.push(`<b class="g">nueva mejor</b>`);
        if (!i) partes.push("la primera");
        lect.i.innerHTML = partes.join(" · ");
      };
      b.addEventListener("pointerenter", muestra);
      b.addEventListener("focus", muestra);
      b.addEventListener("click", muestra);
      caja.append(b);
      return b;
    });
    const iMejor = tiempos.indexOf(tMin);
    botones[iMejor].dispatchEvent(new Event("click"));

    // La frase, con los números calculados
    const masRapidas = P.filter((v, i) => i && v[2] < P[i - 1][2]).length;
    const sesiones = new Set(P.map((v) => v[0])).size;
    const frase = $("[data-mejora-frase]");
    if (frase) frase.innerHTML = `${n} vueltas en Brands Hatch con el Mini, en ${sesiones} tandas: de <b>${tVuelta(tiempos[0])}</b> a <b>${tVuelta(tMin)}</b>. <b class="g">${masRapidas}</b> fueron más rápidas que la anterior y <b class="p">${n - 1 - masRapidas}</b> más lentas. En las rojas está la siguiente mejora.`;

    // Se dibuja al entrar
    const dibujar = () => {
      vu.classList.add("dibujada");
      if (menosMov) return;
      for (const camino of [traza, linMejor]) {
        const largo = camino.getTotalLength();
        camino.style.strokeDasharray = `${largo} ${largo}`;
        camino.animate([{ strokeDashoffset: largo }, { strokeDashoffset: 0 }], { duration: 1600, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" });
      }
    };
    new IntersectionObserver((ents, obs) => { if (ents[0].isIntersecting) { obs.disconnect(); dibujar(); } }, { threshold: 0.3 }).observe(vu);
  }

  // ---------- Herramientas: el marco fijo cambia con cada paso ----------
  const herr = $("[data-herr]");
  if (herr) {
    const pasos = $$("[data-herr-paso]", herr);
    const imgs = $$("[data-herr-img]", herr);
    const activa = (n) => {
      pasos.forEach((p, i) => p.classList.toggle("activa", i === n));
      imgs.forEach((im, i) => im.classList.toggle("activa", i === n));
    };
    activa(0);
    const obs = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) activa(Number(e.target.dataset.herrPaso)); }), { rootMargin: "-45% 0px -45% 0px" });
    pasos.forEach((p) => obs.observe(p));
  }

  // ---------- Diálogo final ----------
  const dlg = $("[data-dialogo]");
  if (dlg) {
    const sim = $("[data-dlg-sim]", dlg), nombre = $("[data-dlg-nombre]", dlg), prev = $("[data-dlg-prev]", dlg);
    let paso = $("[data-paso-sim]");
    const actualiza = () => {
      prev.textContent = `«${nombre.value.trim() || "Mi primera tanda"}»`;
      paso.textContent = sim.value;
    };
    sim.addEventListener("change", actualiza);
    nombre.addEventListener("input", actualiza);
    dlg.addEventListener("submit", (e) => { e.preventDefault(); location.href = $(".boton-dlg", dlg).href; });
    $$('input[name="modo"]', dlg).forEach((r) => r.addEventListener("change", () => {
      const ya = r.checked && r.value === "ya";
      if (r.checked) paso.parentElement.innerHTML = ya
        ? `Abre Brum, ve a Historial y abre las vueltas que ya tengas de <b data-paso-sim>${sim.value}</b>.`
        : `Abre Brum, elige <b data-paso-sim>${sim.value}</b> y pulsa Iniciar grabación.`;
      paso = $("[data-paso-sim]");
    }));
  }

  alScroll();
})();
