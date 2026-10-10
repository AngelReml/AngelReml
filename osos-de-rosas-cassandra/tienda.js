// Ilustración del oso hecho de rosas (canvas) y detalles de la página de venta.
(function () {
  "use strict";

  var W = 400, H = 500;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cfg = window.CONFIG || {};
  var colors = Array.isArray(cfg.COLORS) && cfg.COLORS.length ? cfg.COLORS : [{ name: "Rosa", hex: "#F2A7B0" }];

  // Silueta del oso en un lienzo de 400 × 500.
  function bearPath() {
    var p = new Path2D();
    [[118, 84, 34], [282, 84, 34], [90, 332, 36], [310, 332, 36], [130, 442, 40], [270, 442, 40]].forEach(function (c) {
      p.moveTo(c[0] + c[2], c[1]);
      p.arc(c[0], c[1], c[2], 0, Math.PI * 2);
    });
    [[200, 172, 112, 96], [200, 338, 112, 110]].forEach(function (e) {
      p.moveTo(e[0] + e[2], e[1]);
      p.ellipse(e[0], e[1], e[2], e[3], 0, 0, Math.PI * 2);
    });
    return p;
  }

  // Posiciones de las rosas: rejilla hexagonal con un poco de azar, dentro de la silueta.
  var ROSES = (function () {
    var probe = document.createElement("canvas").getContext("2d");
    var path = bearPath();
    var list = [], s = 20, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var y = 20, row = 0; y < H; y += s * 0.87, row++) {
      for (var x = (row % 2) * s / 2; x < W; x += s) {
        var jx = x + (rnd() - 0.5) * 5, jy = y + (rnd() - 0.5) * 5;
        if (probe.isPointInPath(path, jx, jy)) {
          // Volumen: más oscuras en el borde de la silueta, más claras arriba a la izquierda.
          var out = 0;
          for (var d = 0; d < 8; d++) {
            var ang = d * Math.PI / 4;
            if (!probe.isPointInPath(path, jx + Math.cos(ang) * 24, jy + Math.sin(ang) * 24)) out++;
          }
          var shade = out >= 3 ? 0 : (jx + jy < 520 && out === 0 ? 2 : 1);
          if (rnd() < 0.15) shade = Math.max(0, shade - 1);
          list.push({ x: jx, y: jy, r: 12.5 + rnd() * 2.5, rot: rnd() * Math.PI * 2, order: (H - jy) + rnd() * 120, shade: shade });
        }
      }
    }
    list.sort(function (a, b) { return a.order - b.order; });
    list.forEach(function (r, i) { r.i = i; });
    return list;
  })();

  function toHex(rgb) {
    return "#" + rgb.match(/\d+/g).map(function (n) { return ("0" + (+n).toString(16)).slice(-2); }).join("");
  }

  function mix(hex, other, t) {
    var a = parseInt(hex.slice(1), 16), b = parseInt(other.slice(1), 16);
    var r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
    var g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
    var bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  // Una rosa dibujada una vez por color y reutilizada: tres vueltas de pétalos y un botón.
  var sprites = {};
  var SHADES = [[ "#24322B", 0.1 ], null, [ "#FFFFFF", 0.12 ]];
  function sprite(base, level) {
    var key = base + level;
    if (sprites[key]) return sprites[key];
    var hex = SHADES[level] ? toHex(mix(base, SHADES[level][0], SHADES[level][1])) : base;
    var S = 128, c = document.createElement("canvas");
    c.width = c.height = S;
    var x = c.getContext("2d"), m = S / 2, r = S / 2 - 3;
    var dark = mix(hex, "#24322B", 0.5), edge = mix(hex, "#24322B", 0.28), light = mix(hex, "#FFFFFF", 0.4);
    x.fillStyle = dark;
    x.beginPath(); x.arc(m, m + 2, r, 0, Math.PI * 2); x.fill();
    var rings = [[1, 6, 0], [0.74, 5, 0.6], [0.5, 4, 1.3]];
    rings.forEach(function (ring, j) {
      var rr = r * ring[0], n = ring[1];
      for (var i = 0; i < n; i++) {
        var a = ring[2] + (i / n) * Math.PI * 2;
        var cx = m + Math.cos(a) * rr * 0.42, cy = m + Math.sin(a) * rr * 0.42;
        var g = x.createRadialGradient(m - rr * 0.3, m - rr * 0.35, 1, cx, cy, rr * 0.62);
        g.addColorStop(0, j === 2 ? light : mix(hex, "#FFFFFF", 0.18 + j * 0.08));
        g.addColorStop(1, hex);
        x.fillStyle = g;
        x.strokeStyle = edge;
        x.lineWidth = 2.2;
        x.beginPath(); x.arc(cx, cy, rr * 0.6, 0, Math.PI * 2); x.fill(); x.stroke();
      }
    });
    // Botón central en espiral.
    x.strokeStyle = edge;
    x.lineWidth = 2.6;
    x.lineCap = "round";
    x.beginPath();
    for (var k = 0, n2 = 40; k <= n2; k++) {
      var t = k / n2, a2 = t * Math.PI * 3.4, r2 = r * 0.24 * (1 - t * 0.85);
      var px = m + Math.cos(a2) * r2, py = m + Math.sin(a2) * r2;
      if (k === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
    sprites[key] = c;
    return c;
  }

  function Bear(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.fill = opts.fill == null ? 1 : opts.fill;
    this.color = opts.color || colors[0].hex;
    this.state = ROSES.map(function () { return { from: null, to: null, t0: 0, born: -1 }; });
    this.running = false;
    this.resize();
  }
  Bear.prototype.resize = function () {
    var w = this.c.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.c.width = Math.round(w * dpr);
    this.c.height = Math.round(w * dpr * H / W);
    this.k = this.c.width / W;
    this.draw(performance.now());
  };
  Bear.prototype.assemble = function () {
    var now = performance.now(), count = Math.round(ROSES.length * this.fill), self = this;
    ROSES.forEach(function (r, i) {
      self.state[i].born = i < count ? (reduceMotion ? 0 : now + (i / count) * 2200) : Infinity;
      self.state[i].to = self.color;
      self.state[i].from = null;
    });
    this.loop();
  };
  Bear.prototype.setColor = function (hex, cx, cy) {
    if (hex === this.color) return;
    var now = performance.now(), self = this;
    this.color = hex;
    ROSES.forEach(function (r, i) {
      var st = self.state[i], d = Math.hypot(r.x - (cx || 200), r.y - (cy || 304));
      st.from = st.to; st.to = hex; st.t0 = reduceMotion ? 0 : now + d * 2.2;
    });
    this.loop();
  };
  Bear.prototype.loop = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    function frame(now) {
      var busy = self.draw(now);
      if (busy) requestAnimationFrame(frame); else self.running = false;
    }
    requestAnimationFrame(frame);
  };
  Bear.prototype.draw = function (now) {
    var ctx = this.ctx, k = this.k, busy = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.c.width, this.c.height);
    // Sombra en el suelo.
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(200, 486, 150, 11, 0, 0, Math.PI * 2); ctx.fill();
    if (this.fill < 1) {
      // Base de poliestireno visible donde aún no hay rosas.
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.fillStyle = "#E4E7E1";
      ctx.strokeStyle = "rgba(36,50,43,0.35)";
      ctx.lineWidth = 1.5;
      var p = bearPath();
      ctx.fill(p);
    }
    for (var i = 0; i < ROSES.length; i++) {
      var r = ROSES[i], st = this.state[i];
      if (st.born === Infinity || st.born < 0) continue;
      var age = now - st.born;
      if (age < 0) { busy = true; continue; }
      var pop = Math.min(1, age / 320);
      var scale = pop < 1 ? 0.4 + 0.6 * (1 - Math.pow(1 - pop, 3)) * 1.08 : 1;
      if (pop < 1) busy = true;
      var hex = st.to;
      if (st.from && now < st.t0) { hex = st.from; busy = true; }
      else if (st.from && now - st.t0 < 220) { scale *= 1 + 0.18 * Math.sin(((now - st.t0) / 220) * Math.PI); busy = true; }
      var size = r.r * 2 * scale;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.translate(r.x, r.y);
      ctx.rotate(r.rot);
      ctx.globalAlpha = Math.min(1, pop * 1.6);
      ctx.drawImage(sprite(hex, r.shade), -size / 2, -size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    return busy;
  };

  // Texto del lazo en la ilustración: se ajusta al ancho de la cinta.
  function setRibbon(svg, text) {
    var t = svg.querySelector(".lazo-texto");
    if (!t) return;
    var path = svg.querySelector("path[id]");
    t.firstElementChild.textContent = text || "Su nombre";
    t.classList.toggle("vacio", !text);
    var max = path.getTotalLength() * 0.86, size = 38;
    t.setAttribute("font-size", size);
    while (size > 12 && t.getComputedTextLength() > max) { size -= 1; t.setAttribute("font-size", size); }
  }

  var bears = [];
  document.querySelectorAll("[data-oso]").forEach(function (fig) {
    var canvas = fig.querySelector("canvas");
    var b = new Bear(canvas, { fill: parseFloat(fig.getAttribute("data-oso")) });
    b.fig = fig;
    bears.push(b);
  });

  // Cada oso se monta rosa a rosa la primera vez que aparece en pantalla.
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        bears.forEach(function (b) { if (b.fig === e.target) b.assemble(); });
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    bears.forEach(function (b) { io.observe(b.fig); });
  } else {
    bears.forEach(function (b) { b.assemble(); });
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { bears.forEach(function (b) { b.resize(); }); }, 120);
  });

  var liveBears = bears.filter(function (b) { return b.fig.hasAttribute("data-vivo"); });
  var ribbons = document.querySelectorAll("svg.cinta[data-vivo]");
  var nameInput = document.getElementById("nombre");
  var colorName = document.querySelectorAll("[data-color-elegido]");

  function syncName() {
    var v = nameInput ? nameInput.value.trim() : "";
    ribbons.forEach(function (svg) { setRibbon(svg, v); });
  }
  if (nameInput) nameInput.addEventListener("input", syncName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncName);
  syncName();

  var swatches = document.getElementById("colores");
  if (swatches) {
    swatches.addEventListener("change", function (e) {
      var c = colors.filter(function (x) { return x.name === e.target.value; })[0];
      if (!c) return;
      liveBears.forEach(function (b) { b.setColor(c.hex); });
      colorName.forEach(function (el) { el.textContent = c.name.toLowerCase(); });
    });
  }

  // Ideas para el lazo: rellenan el campo.
  document.querySelectorAll("[data-idea]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!nameInput) return;
      nameInput.value = btn.getAttribute("data-idea");
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      nameInput.focus();
    });
  });

  // Barra fija en móvil: se oculta mientras el configurador está a la vista.
  var bar = document.getElementById("barra");
  var config = document.getElementById("disena");
  if (bar && config && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle("oculta", entries[0].isIntersecting);
    }, { threshold: 0.05 }).observe(config);
  }
})();
