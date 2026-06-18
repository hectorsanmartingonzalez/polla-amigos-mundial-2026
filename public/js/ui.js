/* Piezas de interfaz con efectos: avisos, confeti de celebración, conteo del pozo, barra de guardado. */
import { clp } from "./util.js";

const reduceMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Avisos (aria-live) ---------- */
let toastT = null;
export function toast(msg, error = false) {
  const zona = document.getElementById("avisos");
  zona.innerHTML = "";
  const d = document.createElement("div");
  d.className = "toast" + (error ? " error" : "");
  d.textContent = msg;
  zona.appendChild(d);
  clearTimeout(toastT);
  toastT = setTimeout(() => d.remove(), 2800);
}

/* ---------- Celebración: explosión de confeti + mensaje ---------- */
const COLORES = ["#4F46E5", "#7C3AED", "#6366F1", "#0EA5E9", "#10B981", "#D4A017"];

function lanzarConfeti(capa, cantidad) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < cantidad; i++) {
    const c = document.createElement("div");
    c.className = "confeti";
    const color = COLORES[Math.floor(Math.random() * COLORES.length)];
    const ancho = 7 + Math.random() * 8;
    c.style.left = (Math.random() * 100) + "vw";
    c.style.width = ancho + "px";
    c.style.height = (ancho + Math.random() * 8) + "px";
    c.style.background = color;
    c.style.borderRadius = Math.random() > 0.6 ? "50%" : "2px";
    c.style.animation = `caer ${2.2 + Math.random() * 1.8}s ${Math.random() * 0.6}s cubic-bezier(.25,.6,.5,1) forwards`;
    frag.appendChild(c);
  }
  capa.appendChild(frag);
}

export function celebrar(msg = "¡Listo!", sub = "Tu predicción quedó guardada") {
  if (reduceMotion()) { toast(msg + " ✓"); return; }

  const capa = document.createElement("div");
  capa.className = "confeti-capa";
  document.body.appendChild(capa);
  lanzarConfeti(capa, 80);

  const cartel = document.createElement("div");
  cartel.className = "celebra-msg";
  cartel.setAttribute("role", "status");
  cartel.setAttribute("aria-live", "assertive");
  cartel.innerHTML = `<span class="emoji" aria-hidden="true">🎉</span>
    <div class="txt">${msg}</div><div class="sub">${sub}</div>`;
  document.body.appendChild(cartel);

  if (navigator.vibrate) navigator.vibrate([20, 40, 30]);
  document.body.classList.add("golpe");
  setTimeout(() => document.body.classList.remove("golpe"), 500);

  const cerrar = () => { capa.remove(); cartel.remove(); };
  cartel.addEventListener("click", cerrar);
  capa.addEventListener("click", cerrar);
  setTimeout(() => { cartel.style.transition = "opacity .4s"; cartel.style.opacity = "0"; }, 1600);
  setTimeout(cerrar, 4200);
}

/* ---------- Conteo animado del pozo ---------- */
export function animaPozo(el, hasta) {
  if (reduceMotion()) { el.textContent = clp(hasta); return; }
  let t0 = null;
  const dur = 900;
  const paso = (t) => {
    if (!t0) t0 = t;
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = clp(Math.round(hasta * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

/* ---------- Barra flotante "cambios sin guardar" ---------- */
let barra = null;
export function syncSavebar(mostrar, alGuardar) {
  if (mostrar && !barra) {
    barra = document.createElement("div");
    barra.className = "savebar";
    barra.innerHTML = `<span>Tienes cambios sin guardar</span><button type="button">Guardar</button>`;
    barra.querySelector("button").addEventListener("click", alGuardar);
    document.body.appendChild(barra);
  } else if (!mostrar && barra) {
    barra.remove();
    barra = null;
  }
}

/* ---------- Esqueletos de carga ---------- */
export const skel = (alto, ancho = "100%", extra = "") =>
  `<div class="skel" style="height:${alto}px;width:${ancho};${extra}"></div>`;

/* ---------- Spinner inline (para botones ocupados) ---------- */
export const spinner = () => `<span class="spin" aria-hidden="true"></span>`;
