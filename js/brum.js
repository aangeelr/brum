/* Brum · web de descarga. Todo con datos reales de js/datos.js. */
(() => {
  const D = window.BRUM_DATOS;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const menosMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = document.documentElement;
  const quieto = () => raiz.classList.contains("quieto");
  const reproduce = (v, si) => { v.dataset.toca = si ? "1" : "0"; if (si && !quieto()) v.play().catch(() => {}); else v.pause(); };
  const pausa = $("[data-pausa]");
  if (pausa) pausa.addEventListener("click", () => {
    const q = raiz.classList.toggle("quieto");
    const txt = q ? "Seguir con las animaciones" : "Pausar animaciones";
    pausa.setAttribute("aria-pressed", String(q)); pausa.setAttribute("aria-label", txt); pausa.title = txt;
    $$("video").forEach((v) => reproduce(v, v.dataset.toca === "1"));
    document.dispatchEvent(new Event("brum:sigue"));
  });
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
    apila();
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

    const VENTANA = 6;
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
        el.classList.remove("salta"); void el.offsetWidth; el.classList.add("salta");
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
      if (!visible || document.hidden || quieto()) return;
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
        H.marcha.textContent = f[5] || (f[2] > 20 ? H.marcha.textContent : "N"); // 0 en mitad de un cambio: se queda la de antes
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
        if (idx >= VT.length - 1) { meta(); metaHasta = ahora + 2400; }
      }
      rafHud = requestAnimationFrame(cuadro);
    }
    function arranca() { if (!rafHud && visible && !document.hidden && !quieto()) { if (!enMeta) t0 = performance.now() - (tVivo * 1000) / VEL; rafHud = requestAnimationFrame(cuadro); } }

    reinicia(performance.now(), Math.max(0, SECT[0].tNueva - 2.5));
    new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; if (visible) arranca(); }, { threshold: 0.1 }).observe(hud);
    document.addEventListener("visibilitychange", arranca);
    document.addEventListener("brum:sigue", arranca);

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

  // ---------- Banco de datos: la vuelta de 1:14.847 con todos sus canales ----------
  const bc = $("[data-banco]");
  if (bc && D.banco) {
    // [t, km/h, gas %, freno %, volante x100, marcha, G lateral, G longitudinal, freno °C x4, suspensión mm x4]
    const M = D.banco.muestras, NE = D.banco.neumaticos;
    const T = M.map((f) => f[0]);
    const FIN = T[T.length - 1];
    const B = {
      fase: $("[data-bc-fase]", bc), t: $("[data-bc-t]", bc), kmh: $("[data-bc-kmh]", bc), marcha: $("[data-bc-marcha]", bc),
      glat: $("[data-bc-glat]", bc), glon: $("[data-bc-glon]", bc), freno: $("[data-bc-freno]", bc), frn: $("[data-bc-frn]", bc),
      gas: $("[data-bc-gas]", bc), gasn: $("[data-bc-gasn]", bc), vol: $("[data-bc-vol]", bc), cursor: $("[data-bc-cursor]", bc),
      rango: $("[data-bc-rango]", bc), play: $("[data-bc-play]", bc), discos: $$("[data-disco]", bc),
      ruedas: $$("[data-rueda]", bc).map((r) => ({ tt: $("[data-tt]", r), tp: $("[data-tp]", r), bt: $("[data-bt]", r), fr: $(".bc-fr", r), su: $("[data-su]", r) })),
    };
    B.rango.max = FIN.toFixed(1);
    const FASES = { frena: "Frenando", curva: "En curva", fondo: "A fondo", rueda: "Rodando" };
    const gg = $("[data-bc-gg]", bc), pista = $("[data-bc-vel]", bc), nube = document.createElement("canvas");
    const cg = gg.getContext("2d");
    const GMAX = 2.2;
    let ggW = 0, pW = 0;
    const signo = (x, d = 2) => (Number(x.toFixed(d)) < 0 ? MENOS : "") + Math.abs(x).toFixed(d);

    function ajusta() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ggW = gg.getBoundingClientRect().width || 300;
      for (const cv of [gg, nube]) cv.width = cv.height = Math.round(ggW * dpr);
      cg.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Fondo del GG: ejes, 1 G y 2 G, y la nube de puntos de toda la vuelta
      const c = nube.getContext("2d");
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const m = ggW / 2, k = (m - 10) / GMAX;
      c.strokeStyle = "#2A2D33"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(m, 4); c.lineTo(m, ggW - 4); c.moveTo(4, m); c.lineTo(ggW - 4, m); c.stroke();
      for (const g of [1, 2]) { c.beginPath(); c.arc(m, m, g * k, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = "rgba(255, 159, 67, 0.3)";
      for (const f of M) c.fillRect(m + f[6] * k - 1, m - f[7] * k - 1, 2, 2);
      c.fillStyle = "#6B7280"; c.font = "11px Bahnschrift, Barlow, sans-serif";
      c.fillText("1 G", m + 5, m - k - 5); c.fillText("2 G", m + 5, m - 2 * k - 5);
      c.fillText("Acelera", 6, 14); c.fillText("Frena", 6, ggW - 6);
      // La vuelta entera debajo de la barra: velocidad, frenadas en rojo y gas a fondo en verde
      const r = pista.getBoundingClientRect();
      pW = r.width;
      const pH = r.height;
      pista.width = Math.round(pW * dpr); pista.height = Math.round(pH * dpr);
      const p = pista.getContext("2d");
      p.setTransform(dpr, 0, 0, dpr, 0, 0);
      const x = (t) => (t / FIN) * pW, y = (v) => pH - 8 - ((v - 55) / 115) * (pH - 16);
      for (let i = 0; i < M.length - 1; i++) {
        const w = x(M[i + 1][0]) - x(M[i][0]) + 0.5;
        if (M[i][3] >= 8) { p.fillStyle = "rgba(255, 75, 75, 0.22)"; p.fillRect(x(M[i][0]), 0, w, pH); }
        if (M[i][2] >= 95) { p.fillStyle = "rgba(46, 204, 113, 0.55)"; p.fillRect(x(M[i][0]), pH - 3, w, 3); }
      }
      p.beginPath();
      M.forEach((f, i) => (i ? p.lineTo(x(f[0]), y(f[1])) : p.moveTo(x(f[0]), y(f[1]))));
      p.strokeStyle = "#FF9F43"; p.lineWidth = 1.6; p.stroke();
    }

    let idx = 0, seg = -1, fase = "";
    function pinta(t) {
      while (idx > 0 && T[idx] > t) idx--;
      while (idx < T.length - 2 && T[idx + 1] <= t) idx++;
      const a = M[idx], b = M[idx + 1], k = limita((t - a[0]) / (b[0] - a[0]), 0, 1);
      const v = (j) => a[j] + (b[j] - a[j]) * k;
      const fr = v(3), gas = v(2), glat = v(6), glon = v(7);
      const f = fr >= 8 ? "frena" : Math.abs(glat) >= 0.8 ? "curva" : gas >= 95 ? "fondo" : "rueda";
      if (f !== fase) { fase = f; bc.dataset.fase = f; B.fase.textContent = FASES[f]; }
      B.t.textContent = tVuelta(t);
      B.kmh.textContent = miles(v(1));
      B.marcha.textContent = a[5] || (a[1] > 20 ? B.marcha.textContent : "N");
      B.glat.textContent = signo(glat); B.glon.textContent = signo(glon);
      B.freno.style.transform = `scaleY(${(fr / 100).toFixed(3)})`; B.frn.textContent = miles(fr);
      B.gas.style.transform = `scaleY(${(gas / 100).toFixed(3)})`; B.gasn.textContent = miles(gas);
      B.vol.style.transform = `translateX(${(limita(v(4) / 30, -1, 1) * 50).toFixed(2)}%)`;
      B.ruedas.forEach((r, i) => {
        const bt = v(8 + i);
        r.bt.textContent = miles(bt);
        r.fr.classList.toggle("caliente", bt >= 200);
        r.su.style.transform = `scaleY(${limita((v(12 + i) + 30) / 120, 0.04, 1).toFixed(3)})`;
        const c = limita((bt - 90) / 170, 0, 1);
        B.discos[i].style.fill = `rgb(${Math.round(lerp(42, 255, c))}, ${Math.round(lerp(45, 90, c))}, ${Math.round(lerp(51, 0, c))})`;
      });
      const s = Math.min(Math.floor(t), NE.length - 1);
      if (s !== seg) {
        seg = s;
        B.ruedas.forEach((r, i) => { r.tt.textContent = miles(NE[s][i]); r.tp.textContent = NE[s][4 + i].toFixed(1); });
      }
      // GG: la nube de la vuelta, la estela del último segundo y medio y el punto de ahora
      const m = ggW / 2, kg = (m - 10) / GMAX;
      cg.clearRect(0, 0, ggW, ggW);
      cg.drawImage(nube, 0, 0, ggW, ggW);
      const desde = Math.max(0, idx - 22);
      for (let j = desde + 1; j <= idx; j++) {
        cg.strokeStyle = `rgba(255, 90, 0, ${((j - desde) / (idx - desde + 1)).toFixed(3)})`;
        cg.lineWidth = 2.5;
        cg.beginPath(); cg.moveTo(m + M[j - 1][6] * kg, m - M[j - 1][7] * kg); cg.lineTo(m + M[j][6] * kg, m - M[j][7] * kg); cg.stroke();
      }
      const px = m + glat * kg, py = m - glon * kg;
      cg.strokeStyle = "rgba(243, 244, 246, 0.35)"; cg.lineWidth = 1;
      cg.beginPath(); cg.moveTo(m, m); cg.lineTo(px, py); cg.stroke();
      cg.fillStyle = "#FF5A00"; cg.beginPath(); cg.arc(px, py, 7, 0, Math.PI * 2); cg.fill();
      cg.strokeStyle = "#F3F4F6"; cg.lineWidth = 2; cg.stroke();
      B.cursor.style.transform = `translateX(${((t / FIN) * pW).toFixed(1)}px)`;
      if (!arrastra) B.rango.value = t.toFixed(1);
    }

    let t = 0, ultimo = 0, rafB = 0, enVista = false, parado = false, arrastra = false;
    function cuadro(ahora) {
      rafB = 0;
      if (!enVista || document.hidden || parado || quieto()) return;
      if (ultimo) t += Math.min(0.1, (ahora - ultimo) / 1000);
      ultimo = ahora;
      if (t > FIN) t = 0;
      pinta(t);
      rafB = requestAnimationFrame(cuadro);
    }
    const sigue = () => { if (!rafB && enVista && !parado && !document.hidden && !quieto()) { ultimo = 0; rafB = requestAnimationFrame(cuadro); } };
    B.play.addEventListener("click", () => {
      parado = !parado;
      B.play.setAttribute("aria-pressed", String(parado));
      B.play.setAttribute("aria-label", parado ? "Seguir la vuelta" : "Pausar la vuelta");
      sigue();
    });
    B.rango.addEventListener("pointerdown", () => (arrastra = true));
    addEventListener("pointerup", () => (arrastra = false));
    B.rango.addEventListener("input", () => { t = Number(B.rango.value); pinta(t); });
    addEventListener("resize", () => { ajusta(); pinta(t); });
    ajusta();
    pinta(0);
    new IntersectionObserver((ents) => { enVista = ents[0].isIntersecting; sigue(); }, { threshold: 0.15 }).observe(bc);
    document.addEventListener("visibilitychange", sigue);
    document.addEventListener("brum:sigue", sigue);
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
      if (video) reproduce(video, n === 1 && enVista);
    }
    rango.addEventListener("input", () => ve(Number(rango.value)));
    nombres.forEach((b, i) => b.addEventListener("click", () => ve(i)));
    new IntersectionObserver((ents) => {
      enVista = ents[0].isIntersecting;
      if (video) { if (enVista) video.preload = "auto"; reproduce(video, enVista && Number(et.dataset.etapa) === 1); }
    }, { threshold: 0.35 }).observe(et);
    ve(1); // Se abre en Conduce: la telemetría en directo, moviéndose
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
    // Cada día, una banda con su fecha
    const dia = (i) => (D.progreso.dias || [])[P[i][0]] || `Tanda ${P[i][0] + 1}`;
    let ini = 0, nDia = 0;
    for (let i = 1; i <= n; i++) {
      if (i === n || dia(i) !== dia(ini)) {
        const x0 = (X(ini) - (ini ? 47 / (n - 1) : 3)) * 10, x1 = (X(i - 1) + (i < n ? 47 / (n - 1) : 3)) * 10;
        if (nDia++ % 2 === 0) svg.append(nuevo("rect", { class: "vs-tanda", x: x0, y: 0, width: x1 - x0, height: 360 }));
        const anchoPx = ((x1 - x0) / 1000) * caja.getBoundingClientRect().width;
        if (anchoPx >= 30) {
        const et = document.createElement("span"); et.className = "etq etq-tanda"; et.style.left = `calc(${x0 / 10}% + 6px)`;
        et.textContent = innerWidth < 700 ? dia(ini).replace(" de octubre", "/10") : dia(ini);
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

  // ---------- Inicio: intentos de ejemplo de Track Limits ----------
  const ej = $("[data-ej]");
  if (ej) {
    const chips = $$("[data-ej-chips] li", ej);
    const meds = $$("[data-med]", ej);
    const E = { n: $("[data-ej-n]", ej), inv: $("[data-ej-inv]", ej), res: $("[data-ej-res]", ej) };
    // Vueltas que se salen en cada intento de ejemplo (las reglas son las reales: Oro hasta 1, Plata 2, Bronce 3)
    const INTENTOS = [[1, 3, 4, 6], [2, 5], [4]];
    const estrellas = (inv) => (inv <= 1 ? 3 : inv === 2 ? 2 : inv === 3 ? 1 : 0);
    const TEXTO = { 0: "Sin medalla. Mira la ficha y repite.", 1: "Bronce. Algo es algo.", 2: "Plata. A por el Oro.", 3: "¡Oro! Siguiente ejercicio." };
    let k = 0, timers = [], enVista = false, corriendo = false;
    const espera = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    function resultado(fuera, salta) {
      const st = estrellas(fuera.length);
      meds.forEach((m) => m.classList.toggle("on", Number(m.dataset.med) === st));
      E.res.textContent = TEXTO[st];
      E.res.className = `ej-res ${st ? "gana" : "pierde"}`;
      if (salta) { void E.res.offsetWidth; E.res.classList.add("salta"); }
    }
    async function intento() {
      const fuera = INTENTOS[k % INTENTOS.length];
      E.n.textContent = `Intento ${(k % INTENTOS.length) + 1}`;
      E.inv.textContent = "0";
      E.res.textContent = "Conduciendo…"; E.res.className = "ej-res";
      meds.forEach((m) => m.classList.remove("on"));
      chips.forEach((c) => (c.className = ""));
      let inv = 0;
      for (let i = 0; i < chips.length; i++) {
        chips[i].className = "vivo";
        await espera(420);
        const ko = fuera.includes(i);
        chips[i].className = ko ? "ko" : "ok";
        chips[i].textContent = ko ? "Fuera" : `V${i + 1}`;
        if (ko) E.inv.textContent = String(++inv);
        await espera(90);
      }
      resultado(fuera, true);
      await espera(2600);
      chips.forEach((c, i) => (c.textContent = `V${i + 1}`));
      k++;
    }
    async function bucle() {
      if (corriendo) return;
      corriendo = true;
      while (enVista && !document.hidden && !quieto()) await intento();
      corriendo = false;
    }
    new IntersectionObserver((ents) => { enVista = ents[0].isIntersecting; if (enVista) bucle(); }, { threshold: 0.2 }).observe(ej);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && enVista) bucle(); });
    document.addEventListener("brum:sigue", () => { if (enVista) bucle(); });
  }

  // ---------- ¿Qué te pasa en pista? ----------
  const ficha = $("[data-ficha]");
  if (ficha) {
    const ABRE = { 1: "Abierto desde el principio", 2: "Se abre con 800 XP", 3: "Se abre con 2000 XP", 4: "Se abre con 4000 XP" };
    const NIVEL = { 1: "Fundamentos", 2: "Técnica", 3: "Avanzado", 4: "Maestría" };
    // Sacado del catálogo de la app (src/brum/academia/exercises.py)
    const EJ = [
      [1, "Standing Start", "Desde parado, llega a 150 km/h en menos de 16 s.", "La salida, el embrague y los cambios de marcha.", "1"],
      [1, "Brake Marker", "Desde 200 km/h, empieza a frenar entre los metros 143 y 152.", "Frenar siempre en el mismo punto.", "1"],
      [1, "Smooth Hands", "Una vuelta sin ninguna corrección de volante ni bloqueo de rueda, por debajo de 2:15.", "Suavidad y control del volante.", "1"],
      [1, "Zero Lock", "5 vueltas sin bloquear, con una media por debajo de 2:06.", "Frenar limpio y controlar el límite.", "5"],
      [1, "Track Limits", "8 vueltas seguidas con como mucho una invalidada por salida de pista.", "Respetar los límites de pista y guardar margen.", "8"],
      [1, "Zero Overlap", "5 vueltas válidas sin pisar freno y acelerador a la vez.", "Soltar el acelerador del todo antes de frenar.", "5"],
      [2, "Late Braker", "Busca tu punto de frenada en la primera chicane y retrásalo 5 m en cada intento.", "Explorar el límite de frenada.", "1 por intento"],
      [2, "Entry vs Exit", "Un intento cuidando la entrada y otro cuidando la salida: compara cuál da mejor tiempo.", "Entender qué compensa en cada curva.", "2"],
      [4, "Five Perfect", "5 vueltas con menos de 1,5 s entre la mejor y la peor, y cero bloqueos.", "Consistencia.", "5"],
      [3, "Double or Nothing", "Apuesta 500 $ de la app: 3 vueltas bajo un tiempo objetivo y como mucho un bloqueo.", "Rendir bajo presión.", "3"],
    ];
    const F = {
      nivel: $("[data-f-nivel]", ficha), abre: $("[data-f-abre]", ficha), nombre: $("[data-f-nombre]", ficha), nombre2: $("[data-f-nombre2]", ficha),
      obj: $("[data-f-obj]", ficha), ent: $("[data-f-ent]", ficha), v: $("[data-f-v]", ficha),
    };
    const botones = $$("[data-p]");
    function muestra(i) {
      const [niv, nombre, obj, ent, v] = EJ[i];
      botones.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
      F.nivel.textContent = NIVEL[niv];
      F.nivel.className = `nivel nivel-${niv}`;
      F.abre.textContent = ABRE[niv];
      F.nombre.textContent = nombre; F.nombre2.textContent = nombre;
      F.obj.textContent = obj; F.ent.textContent = ent; F.v.textContent = v;
      ficha.classList.remove("cambia"); void ficha.offsetWidth; ficha.classList.add("cambia");
    }
    botones.forEach((b) => b.addEventListener("click", () => muestra(Number(b.dataset.p))));
    muestra(5);
    ficha.classList.remove("cambia");
  }

  // ---------- Niveles que se apilan ----------
  const niveles = $$("[data-niv]");
  niveles.forEach((n, i) => n.style.setProperty("--i", i));
  function apila() {
    if (menosMov || !niveles.length) return;
    for (let i = 0; i < niveles.length - 1; i++) {
      const a = niveles[i].getBoundingClientRect(), b = niveles[i + 1].getBoundingClientRect();
      const tapado = limita((a.bottom - b.top) / a.height, 0, 1);
      niveles[i].style.transform = `scale(${(1 - tapado * 0.06).toFixed(4)})`;
      niveles[i].style.filter = `brightness(${(1 - tapado * 0.45).toFixed(3)})`;
    }
  }

  // ---------- Licencia: de Rookie a A ----------
  const lic = $("[data-lic]");
  if (lic) {
    const esc = $$(".lic-esc li", lic), fill = $("[data-lic-fill]", lic);
    const enciende = (n) => {
      esc.forEach((li, i) => li.classList.toggle("on", i <= n));
      fill.style.transform = `scaleX(${(n / (esc.length - 1)).toFixed(3)})`;
    };
    new IntersectionObserver((ents, obs) => {
      if (!ents[0].isIntersecting) return;
      obs.disconnect();
      esc.forEach((_, i) => setTimeout(() => enciende(i), 300 + i * 650));
    }, { threshold: 0.5 }).observe(lic);
  }
  $$(".medallas li").forEach((li, i) => li.style.setProperty("--i", i));

  // ---------- Versiones ----------
  const ver = $("[data-versiones]");
  if (ver) {
    $$("li", ver).forEach((li, i) => li.style.setProperty("--i", i));
    new IntersectionObserver((ents, obs) => { if (ents[0].isIntersecting) { obs.disconnect(); ver.classList.add("visto"); } }, { threshold: 0.4 }).observe(ver);
  }

  // ---------- Temas HUD de la Tienda: la web se pone sus colores ----------
  // Colores de la app (src/brum/ui/tema.py): primario, secundario y fondo de tarjeta.
  const TEMAS = {
    theme_daytona: ["Daytona", "#2E5F8A", "#E07B39", "#14202B"],
    theme_bathurst: ["Bathurst", "#6A2C91", "#17D7C4", "#180E22"],
    theme_suzuka: ["Suzuka", "#C8102E", "#F2F0EC", "#241318"],
    theme_racing_red: ["Racing Red", "#E63946", "#FFB703", "#1F1418"],
    theme_endurance_blue: ["Endurance Blue", "#2E86FF", "#00D4FF", "#12181F"],
    theme_le_mans_green: ["Le Mans", "#1C5DBF", "#FFC933", "#121826"],
    theme_monza: ["Monza", "#0B8A3D", "#CE2B37", "#171310"],
    theme_jarama: ["Jarama", "#F2C230", "#2A2A2E", "#1C1A14"],
    theme_zandvoort: ["Zandvoort", "#F58220", "#0A2F5C", "#1A1005"],
    theme_interlagos: ["Interlagos", "#009C3B", "#FFDF00", "#142006"],
    theme_imola: ["Imola", "#7A1F2B", "#D4AF37", "#200E12"],
    theme_silverstone: ["Silverstone", "#1B4D3E", "#C0C0C0", "#10201A"],
    theme_nurburgring: ["Nürburgring", "#2F6E4B", "#B8C4BC", "#13201A"],
    theme_sebring: ["Sebring", "#6B5B3E", "#5FAE85", "#1C1810"],
    theme_carbon: ["Carbono", "#9AA5B1", "#E5E7EB", "#1A1D22"],
    theme_monochrome: ["Monocromo", "#E6E8EB", "#9CA3AF", "#17191C"],
    theme_indianapolis: ["Indianapolis", "#1A1A1A", "#F2F2F2", "#17171A"],
  };
  const luz = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const filaTemas = $("[data-temas]");
  if (filaTemas) {
    const botones = [];
    const ponTema = (id) => {
      const t = TEMAS[id];
      const r = raiz.style;
      if (t) {
        // Si el primario casi no se ve sobre el negro (Indianapolis), manda el secundario
        const [acento, otro] = luz(t[1]) < 0.03 ? [t[2], t[1]] : [t[1], t[2]];
        r.setProperty("--naranja", acento);
        r.setProperty("--naranja-vivo", `color-mix(in oklab, ${acento} 80%, white)`);
        r.setProperty("--acento-2", luz(otro) < 0.03 ? acento : otro);
        r.setProperty("--suelo-2", t[3]);
        r.setProperty("--sobre-acento", luz(acento) > 0.2 ? "#0B0B0B" : "#F3F4F6");
      } else ["--naranja", "--naranja-vivo", "--acento-2", "--suelo-2", "--sobre-acento"].forEach((k) => r.removeProperty(k));
      botones.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tema === (id || "brum"))));
      try { id ? localStorage.setItem("brum-tema", id) : localStorage.removeItem("brum-tema"); } catch (e) { /* sin almacenamiento */ }
    };
    for (const [id, nombre] of [["brum", "Brum"], ...Object.entries(TEMAS).map(([k, t]) => [k, t[0]])]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = id === "brum" ? "tema-b brum" : "tema-b";
      b.dataset.tema = id;
      b.title = nombre;
      b.setAttribute("aria-label", id === "brum" ? "Colores de Brum" : `Tema ${nombre}`);
      if (TEMAS[id]) { b.style.setProperty("--c1", TEMAS[id][1]); b.style.setProperty("--c2", TEMAS[id][2]); }
      filaTemas.append(b);
      botones.push(b);
    }
    botones.push(...$$(".ti-tema[data-tema]"));
    botones.forEach((b) => b.addEventListener("click", () => ponTema(b.dataset.tema === "brum" || b.getAttribute("aria-pressed") === "true" && b.classList.contains("ti-tema") ? null : b.dataset.tema)));
    let guardado = null;
    try { guardado = localStorage.getItem("brum-tema"); } catch (e) { /* sin almacenamiento */ }
    ponTema(TEMAS[guardado] ? guardado : null);
  }

  // ---------- Ráfaga: el vídeo solo corre a la vista ----------
  const raf = $("[data-rafaga]");
  if (raf) {
    raf.removeAttribute("autoplay");
    new IntersectionObserver((ents) => reproduce(raf, ents[0].isIntersecting), { threshold: 0.2 }).observe(raf);
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
        ? `Abre Brum, elige <b data-paso-sim>${sim.value}</b> y pulsa Iniciar grabación en En vivo.`
        : `Abre Brum, elige <b data-paso-sim>${sim.value}</b> y ve a Ejercicios.`;
      paso = $("[data-paso-sim]");
    }));
  }

  alScroll();
})();
