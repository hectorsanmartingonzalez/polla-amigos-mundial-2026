/* Orquestador: render, eventos, acciones y temporizadores. */
import { GROUPS, MAX_GOLES } from "./datos.js";
import { S, me, cargarIdentidad, guardarIdentidad, limpiarIdentidad } from "./estado.js";
import { apiOk, apiGet, apiPost } from "./api.js";
import { esc, copia, sincronizarReloj, hayCierreInminente } from "./util.js";
import { toast, celebrar, animaPozo, syncSavebar, spinner } from "./ui.js";
import { vInicio, vPred, vTabla, vConfig, vError, cuerpoCorreo } from "./vistas.js";

const $ = (id) => document.getElementById(id);
const TABS = [["inicio", "🏠", "Inicio"], ["pred", "⚽", "Predicción"], ["tabla", "🏆", "Tabla"]];
const PIN_RE = /^[0-9]{4}$/;

/* ============================================================
   Render
   ============================================================ */
const ORDEN_VISTAS = ["inicio", "pred", "tabla"];
let vistaPrev = S.view;
let grupoPrev = S.grupo;

function render() {
  const yo = me();
  $("cab-sub").innerHTML =
    "48 selecciones · 72 partidos de la fase de grupos" +
    (yo ? ` · <b>${esc(yo.nombre)} ${esc(yo.apellido[0])}.</b> <a data-act="salir">cambiar</a>` : "");

  $("tabs").innerHTML = TABS.map(([v, ico, txt]) =>
    `<button type="button" class="tab${S.view === v ? " activo" : ""}" data-act="tab" data-v="${v}">
      <span class="ico">${ico}</span>${txt}</button>`).join("");

  const main = $("main");
  if (!apiOk()) { main.innerHTML = vConfig(); return; }
  if (S.errorRed && !S.users.length) { main.innerHTML = vError(); return; }

  /* Dirección de la transición: por orden de pestaña, o por orden de grupo */
  let dir = 0;
  if (S.view !== vistaPrev) {
    dir = ORDEN_VISTAS.indexOf(S.view) - ORDEN_VISTAS.indexOf(vistaPrev);
  } else if (S.view === "pred" && S.grupo !== grupoPrev) {
    dir = "ABCDEFGHIJKL".indexOf(S.grupo) - "ABCDEFGHIJKL".indexOf(grupoPrev);
  }
  vistaPrev = S.view; grupoPrev = S.grupo;

  main.classList.remove("entra-der", "entra-izq");
  main.innerHTML = S.view === "inicio" ? vInicio() : S.view === "pred" ? vPred() : vTabla();
  if (dir !== 0) {
    /* reflow para reiniciar la animación */
    void main.offsetWidth;
    main.classList.add(dir > 0 ? "entra-der" : "entra-izq");
  }
  S.flash = null;

  if (S.view === "tabla" && !S.cargando) {
    const el = $("pozo-monto");
    if (el) {
      const destino = Number(el.getAttribute("data-to") || 0);
      if (!S.pozoAnimado) { animaPozo(el, destino); S.pozoAnimado = true; }
      else el.textContent = el.getAttribute("data-clp") || el.textContent;
    }
  }
  if (S.pidiendoPin) { const p = $("pin-in"); if (p) p.focus(); }
  syncSavebar(S.dirty && S.view === "pred" && !S.guardando && !!yo, () => guardar(false));
}

/* ============================================================
   Datos
   ============================================================ */
async function cargar(silencioso = false) {
  if (!silencioso) { S.cargando = true; render(); }
  try {
    const d = await apiGet();
    if (!d || !d.ok) throw new Error("respuesta");
    sincronizarReloj(d.now);
    S.users = d.users || [];
    S.results = d.results || {};
    S.errorRed = false;
    const yo = me();
    if (yo && !S.dirty) S.preds = copia(yo.preds);
    if (S.meId && !yo) limpiarIdentidad();
    /* Sesión antigua sin PIN (versión anterior de la app): pedirlo una vez */
    if (yo && !S.pin) {
      S.pidiendoPin = yo.id;
      S.view = "inicio";
    }
  } catch (_) {
    S.errorRed = true;
    if (silencioso) toast("Sin conexión: mostrando datos previos", true);
  }
  S.cargando = false;
  render();
}

async function guardar(firmar) {
  const yo = me();
  if (!yo || S.guardando) return;
  if (!S.pin) { pedirPin_(yo.id, "Ingresa tu PIN para guardar"); return; }
  S.guardando = true; render();
  try {
    const d = await apiPost({ action: "save_preds", id: yo.id, pin: S.pin, preds: S.preds, firmar: !!firmar });
    S.guardando = false;
    if (!d || !d.ok) {
      if (d && /PIN incorrecto/.test(d.error || "")) {
        S.pin = null;
        try { localStorage.removeItem("pa26_pin"); } catch (_) {}
        pedirPin_(yo.id, "El PIN no coincide. Inténtalo de nuevo");
        return;
      }
      toast(d && d.error ? d.error : "No se pudo guardar", true); render(); return;
    }
    const i = S.users.findIndex((u) => u.id === d.user.id);
    if (i >= 0) S.users[i] = d.user;
    S.preds = copia(d.user.preds);
    S.dirty = false;
    render();
    if (firmar) celebrar("¡Confirmadas!", "Tus 72 predicciones quedaron guardadas"); else toast("Avance guardado ✓");
  } catch (_) {
    S.guardando = false;
    toast("Error de conexión al guardar", true);
    render();
  }
}

function pedirPin_(id, msj) {
  S.pidiendoPin = id;
  S.view = "inicio";
  render();
  if (msj) toast(msj, true);
}

async function entrarConPin() {
  const pin = (($("pin-in") || {}).value || "").trim();
  if (!PIN_RE.test(pin)) { toast("El PIN debe ser de 4 dígitos", true); return; }
  const id = S.pidiendoPin;
  S.verificando = true; render();
  try {
    const d = await apiPost({ action: "login", id, pin });
    S.verificando = false;
    if (!d || !d.ok) { toast(d && d.error ? d.error : "No se pudo entrar", true); render(); return; }
    guardarIdentidad(id, pin);
    S.pidiendoPin = null;
    const i = S.users.findIndex((u) => u.id === d.user.id);
    if (i >= 0) S.users[i] = d.user; else S.users.push(d.user);
    S.preds = copia(d.user.preds);
    S.dirty = false;
    S.view = "pred";
    render();
    toast(`Bienvenido, ${d.user.nombre} ✓`);
  } catch (_) {
    S.verificando = false;
    toast("Error de conexión", true);
    render();
  }
}

async function registrar() {
  const n = ($("reg-n") || {}).value || "";
  const a = ($("reg-a") || {}).value || "";
  const pin = (($("reg-p") || {}).value || "").trim();
  if (!n.trim() || !a.trim()) { toast("Ingresa nombre y apellido", true); return; }
  if (!PIN_RE.test(pin)) { toast("Crea un PIN de 4 dígitos", true); return; }
  S.guardando = true; render();
  try {
    const d = await apiPost({ action: "register", nombre: n.trim(), apellido: a.trim(), pin });
    S.guardando = false;
    if (!d || !d.ok) { toast(d && d.error ? d.error : "No se pudo inscribir", true); render(); return; }
    S.users.push(d.user);
    guardarIdentidad(d.user.id, pin);
    S.preds = {}; S.dirty = false; S.registrando = false; S.pidiendoPin = null;
    S.view = "pred"; S.grupo = "A";
    render();
    toast("¡Bienvenido a la polla! ✓");
  } catch (_) {
    S.guardando = false;
    toast("Error de conexión", true);
    render();
  }
}

/* ============================================================
   Eventos (delegación)
   ============================================================ */
document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-act]");
  if (!b || b.disabled) return;
  const act = b.getAttribute("data-act");

  if (act === "tab") {
    const nueva = b.getAttribute("data-v");
    if (nueva === "tabla" && S.view !== "tabla") S.pozoAnimado = false;
    S.view = nueva;
    render();
    if (S.view === "tabla") cargar(true);
  }
  else if (act === "reg-on") { S.registrando = true; S.pidiendoPin = null; render(); const n = $("reg-n"); if (n) n.focus(); }
  else if (act === "reg-off") { S.registrando = false; render(); }
  else if (act === "registrar") registrar();
  else if (act === "soy") {
    const id = b.getAttribute("data-id");
    /* Sesión propia ya validada en este dispositivo: entra directo */
    if (S.meId === id && S.pin) {
      const yo = me();
      S.preds = copia(yo ? yo.preds : {});
      S.dirty = false; S.view = "pred"; render();
      return;
    }
    S.registrando = false;
    pedirPin_(id, null);
  }
  else if (act === "pin-volver") { S.pidiendoPin = null; render(); }
  else if (act === "pin-entrar") entrarConPin();
  else if (act === "salir") {
    limpiarIdentidad();
    S.preds = {}; S.dirty = false; S.pidiendoPin = null; S.view = "inicio";
    render();
  }
  else if (act === "grupo") {
    const g = b.getAttribute("data-g");
    if (!g) return;
    S.grupo = g;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  else if (act === "step") {
    const mid = b.getAttribute("data-m");
    const s = +b.getAttribute("data-s");
    const d = +b.getAttribute("data-d");
    const p = S.preds[mid] || [null, null];
    let v = p[s];
    v = v == null ? (d > 0 ? 0 : null) : Math.min(MAX_GOLES, Math.max(0, v + d));
    if (v === null) return;
    const nuevo = [p[0], p[1]];
    nuevo[s] = v;
    S.preds[mid] = nuevo;
    S.dirty = true;
    S.flash = [mid, s];
    if (navigator.vibrate) navigator.vibrate(8);
    render();
  }
  else if (act === "guardar") guardar(false);
  else if (act === "firmar") guardar(true);
  else if (act === "copiar") {
    const txt = cuerpoCorreo();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(
        () => toast("Predicciones copiadas ✓"),
        () => toast("No se pudo copiar", true));
    } else toast("No se pudo copiar en este navegador", true);
  }
  else if (act === "wsp") {
    location.href = "https://wa.me/?text=" + encodeURIComponent(cuerpoCorreo());
  }
  else if (act === "ver-pin") {
    const inp = $(b.getAttribute("data-target"));
    if (!inp) return;
    inp.type = inp.type === "password" ? "text" : "password";
    b.textContent = inp.type === "password" ? "👁" : "🙈";
    inp.focus();
  }
  else if (act === "refresh" || act === "reload") cargar(false);
});

/* Enter envía los formularios */
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Enter") return;
  if (S.registrando && ["reg-n", "reg-a", "reg-p"].includes(ev.target.id)) {
    ev.preventDefault(); registrar();
  } else if (S.pidiendoPin && ev.target.id === "pin-in") {
    ev.preventDefault(); entrarConPin();
  }
});

/* ============================================================
   Temporizadores: cuentas regresivas y tabla en vivo
   ============================================================ */
/* Cada 30 s refresca las cuentas regresivas en Predicción,
   pero solo si hay un cierre dentro de 24 h (si no, nada cambia). */
setInterval(() => {
  if (document.visibilityState !== "visible") return;
  if (S.view === "pred" && !S.guardando && !S.verificando && !S.registrando && !S.pidiendoPin
      && hayCierreInminente()) {
    render();
  }
}, 30000);

setInterval(() => {
  if (document.visibilityState !== "visible") return;
  if (S.view === "tabla" && !S.cargando) cargar(true);
}, 60000);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && apiOk() && !S.cargando) cargar(true);
});

/* Aviso antes de cerrar/recargar si hay cambios sin guardar */
window.addEventListener("beforeunload", (ev) => {
  if (S.dirty) { ev.preventDefault(); ev.returnValue = ""; }
});

/* Header colapsable: se compacta al hacer scroll hacia abajo */
let tickScroll = false;
function alScrollear() {
  const cab = document.querySelector(".cab");
  if (cab) cab.classList.toggle("compacto", window.scrollY > 40);
  tickScroll = false;
}
window.addEventListener("scroll", () => {
  if (!tickScroll) { tickScroll = true; requestAnimationFrame(alScrollear); }
}, { passive: true });

/* Oculta el splash una vez que la app está lista */
let avisoColdT = null;
function ocultarSplash() {
  clearTimeout(avisoColdT);
  const s = document.getElementById("splash");
  if (s) { s.classList.add("fuera"); setTimeout(() => s.remove(), 600); }
}

/* Si la primera carga tarda (Render despierta del reposo), tranquiliza al usuario */
function armarAvisoColdStart() {
  avisoColdT = setTimeout(() => {
    const a = document.getElementById("splash-aviso");
    if (a) a.classList.add("visible");
  }, 3500);
}

/* ============================================================
   Arranque
   ============================================================ */
cargarIdentidad();
render();
if (apiOk()) {
  armarAvisoColdStart();
  cargar(false).finally(() => setTimeout(ocultarSplash, 350));
} else {
  setTimeout(ocultarSplash, 600);
}
