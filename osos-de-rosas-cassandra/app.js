(function (root) {
  "use strict";

  var NAME_MAX = 20;
  var PLACEHOLDER_NAME = "Su nombre";

  var LABELS = {
    BRAND_NAME: "nombre de la marca",
    WHATSAPP_NUMBER: "número de WhatsApp",
    PRICE_EUR: "precio",
    DELIVERY_ZONE_TEXT: "zona de entrega",
    LEAD_DAYS: "días que tardas en hacer un oso",
    SELLER_LEGAL_NAME: "nombre y apellidos de la titular",
    SELLER_NIF: "NIF",
    SELLER_ADDRESS: "domicilio",
    SELLER_EMAIL: "email de contacto",
    LATE_DELIVERY_POLICY_TEXT: "qué pasa si la entrega llega tarde",
    COLOR_DURABILITY_TEXT: "cuánto aguanta el color"
  };

  var SOURCES = { estado: "Estados de WhatsApp", ig: "Instagram" };

  function missing(key) {
    return "[FALTA DATO: " + (LABELS[key] || key) + "]";
  }

  function isSet(v) {
    return v !== null && v !== undefined && String(v).trim() !== "";
  }

  function phoneDigits(v) {
    return isSet(v) ? String(v).replace(/\D/g, "") : "";
  }

  function leadDays(cfg) {
    var n = Number(cfg.LEAD_DAYS);
    return isSet(cfg.LEAD_DAYS) && isFinite(n) && n >= 0 ? Math.floor(n) : null;
  }

  function formatPrice(v) {
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    return new Intl.NumberFormat("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n);
  }

  // Texto para mostrar de una clave de config, o el aviso de dato que falta.
  function display(cfg, key) {
    var v = cfg[key];
    if (key === "WHATSAPP_NUMBER") v = phoneDigits(v);
    if (key === "LEAD_DAYS") v = leadDays(cfg);
    if (!isSet(v)) return { text: missing(key), missing: true };
    if (key === "PRICE_EUR") return { text: formatPrice(v), missing: false };
    return { text: String(v), missing: false };
  }

  // Quita < > y caracteres de control; nunca más de NAME_MAX unidades.
  function sanitizeName(raw) {
    var s = String(raw == null ? "" : raw).replace(/[<>\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, "");
    if (s.length > NAME_MAX) {
      s = s.slice(0, NAME_MAX);
      if (/[\uD800-\uDBFF]$/.test(s)) s = s.slice(0, -1);
    }
    return s;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function toISO(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function isoToEs(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[3] + "/" + m[2] + "/" + m[1] : "";
  }

  // Fecha mínima para validar. Sin LEAD_DAYS, al menos hoy.
  function minDateISO(cfg, today) {
    var days = leadDays(cfg);
    return toISO(addDays(today, days === null ? 0 : days));
  }

  function sourceLabel(search) {
    var m = /[?&]src=([^&#]*)/.exec(search || "");
    var key = m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
    return Object.prototype.hasOwnProperty.call(SOURCES, key) ? SOURCES[key] : "La web";
  }

  function buildMessage(f) {
    return [
      "Hola Cassandra, quiero un oso de rosas.",
      "Color: " + f.color,
      "Nombre en el lazo: " + f.nombre,
      "Fecha de entrega: " + isoToEs(f.fecha),
      "Vengo de: " + f.origen
    ].join("\n");
  }

  function buildOrderUrl(number, f) {
    return "https://wa.me/" + phoneDigits(number) + "?text=" + encodeURIComponent(buildMessage(f));
  }

  function validate(f, minIso, cfg) {
    var errors = {};
    if (!f.color) errors.color = "Elige un color.";
    if (!f.nombre) errors.nombre = "Escribe el nombre o la frase del lazo.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.fecha || "")) {
      errors.fecha = "Elige el día que lo quieres.";
    } else if (f.fecha < minIso) {
      var days = leadDays(cfg);
      errors.fecha = days
        ? "Necesito " + days + " días para hacerlo. Elige el " + isoToEs(minIso) + " o más tarde."
        : "Elige el " + isoToEs(minIso) + " o más tarde.";
    }
    return errors;
  }

  var api = {
    NAME_MAX: NAME_MAX,
    missing: missing,
    display: display,
    sanitizeName: sanitizeName,
    minDateISO: minDateISO,
    isoToEs: isoToEs,
    toISO: toISO,
    addDays: addDays,
    sourceLabel: sourceLabel,
    buildMessage: buildMessage,
    buildOrderUrl: buildOrderUrl,
    validate: validate
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  var cfg = root.CONFIG || {};

  function fillConfig() {
    var nodes = document.querySelectorAll("[data-cfg]");
    for (var i = 0; i < nodes.length; i++) {
      var d = display(cfg, nodes[i].getAttribute("data-cfg"));
      nodes[i].textContent = d.text;
      nodes[i].classList.toggle("falta", d.missing);
    }
  }

  function setError(name, msg) {
    var el = document.getElementById("err-" + name);
    var field = document.querySelector("[data-field='" + name + "']");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
    if (field) {
      if (msg) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  }

  function initOrder() {
    var form = document.getElementById("pedido");
    if (!form) return;

    var swatches = document.getElementById("colores");
    var nameInput = document.getElementById("nombre");
    var counter = document.getElementById("contador");
    var dateInput = document.getElementById("fecha");
    var dateNote = document.getElementById("fecha-nota");
    var button = document.getElementById("pedir");
    var bear = document.getElementById("oso-color");
    var ribbonText = document.getElementById("lazo-texto");
    var ribbonPath = document.getElementById("lazo-curva-texto");
    var colors = Array.isArray(cfg.COLORS) ? cfg.COLORS : [];
    var today = new Date();
    var minIso = minDateISO(cfg, today);

    colors.forEach(function (c, i) {
      var label = document.createElement("label");
      label.className = "muestra";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "color";
      input.value = c.name;
      input.id = "color-" + i;
      if (i === 0) input.setAttribute("data-field", "color");
      input.setAttribute("aria-describedby", "err-color");
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.setAttribute("aria-hidden", "true");
      chip.style.backgroundColor = c.hex;
      var text = document.createElement("span");
      text.textContent = c.name;
      label.appendChild(input);
      label.appendChild(chip);
      label.appendChild(text);
      swatches.appendChild(label);
    });

    if (leadDays(cfg) !== null) {
      dateInput.min = minIso;
    } else if (dateNote) {
      dateNote.hidden = false;
    }

    var number = phoneDigits(cfg.WHATSAPP_NUMBER);
    if (!number) {
      button.disabled = true;
      button.textContent = missing("WHATSAPP_NUMBER");
      button.classList.add("falta");
    }

    function fitRibbon() {
      var max = ribbonPath.getTotalLength() * 0.86;
      var size = 42;
      ribbonText.setAttribute("font-size", size);
      while (size > 12 && ribbonText.getComputedTextLength() > max) {
        size -= 1;
        ribbonText.setAttribute("font-size", size);
      }
    }

    function updateRibbon() {
      var value = nameInput.value.trim();
      var tp = ribbonText.firstElementChild;
      tp.textContent = value || PLACEHOLDER_NAME;
      ribbonText.classList.toggle("vacio", !value);
      fitRibbon();
    }

    nameInput.maxLength = NAME_MAX;
    nameInput.addEventListener("input", function () {
      var clean = sanitizeName(nameInput.value);
      if (clean !== nameInput.value) {
        var pos = Math.min(nameInput.selectionStart || clean.length, clean.length);
        nameInput.value = clean;
        nameInput.setSelectionRange(pos, pos);
      }
      counter.textContent = nameInput.value.length + "/" + NAME_MAX;
      if (nameInput.value.trim()) setError("nombre", "");
      updateRibbon();
    });

    swatches.addEventListener("change", function (e) {
      var c = colors.filter(function (x) { return x.name === e.target.value; })[0];
      if (c && bear) bear.setAttribute("fill", c.hex);
      setError("color", "");
    });

    dateInput.addEventListener("change", function () {
      if (dateInput.value && dateInput.value >= minIso) setError("fecha", "");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!number) return;
      var checked = form.querySelector("input[name='color']:checked");
      var fields = {
        color: checked ? checked.value : "",
        nombre: sanitizeName(nameInput.value).trim(),
        fecha: dateInput.value,
        origen: sourceLabel(root.location.search)
      };
      var errors = validate(fields, minIso, cfg);
      ["color", "nombre", "fecha"].forEach(function (k) { setError(k, errors[k]); });
      var first = ["color", "nombre", "fecha"].filter(function (k) { return errors[k]; })[0];
      if (first) {
        document.querySelector("[data-field='" + first + "']").focus();
        return;
      }
      root.location.href = buildOrderUrl(number, fields);
    });

    updateRibbon();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitRibbon);
  }

  fillConfig();
  initOrder();
})(typeof window !== "undefined" ? window : this);
