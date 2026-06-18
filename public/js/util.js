/* Utilidades puras: formato, tiempo y puntaje. */
import { M } from "./datos.js";

export const esc = (s) => String(s == null ? "" : s)
  .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const clp = (n) => "$" + Number(n).toLocaleString("es-CL");

/* ---- Reloj sincronizado con el servidor ----
   El servidor envía su hora (now) en cada snapshot. Guardamos la
   diferencia con el reloj local para que el cierre de partidos no
   dependa de un teléfono mal configurado. */
let offsetReloj = 0;
export function sincronizarReloj(servidorMs) {
  if (typeof servidorMs === "number" && isFinite(servidorMs)) {
    offsetReloj = servidorMs - Date.now();
  }
}
export const ahora = () => Date.now() + offsetReloj;

export const fmtDia = (utc) => new Date(utc)
  .toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
export const fmtHora = (utc) => new Date(utc)
  .toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
export const fmtFirma = (ts) => new Date(ts)
  .toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const isLocked = (m) => ahora() >= m.ms;

/* 3 exacto · 2 diferencia de gol · 1 solo ganador · 0 nada · null sin datos */
export function pts(pred, real) {
  if (!pred || !real || pred[0] == null || real[0] == null) return null;
  const [ph, pa] = pred, [rh, ra] = real;
  if (ph === rh && pa === ra) return 3;
  if (ph - pa === rh - ra) return 2;
  if (Math.sign(ph - pa) === Math.sign(rh - ra)) return 1;
  return 0;
}

export const copia = (o) => JSON.parse(JSON.stringify(o || {}));

export const completa = (v) => !!(v && v[0] != null && v[1] != null);
export const predsCount = (p) => M.reduce((c, m) => c + (completa(p[m.id]) ? 1 : 0), 0);
export const abiertasSinPred = (p) => M.reduce((c, m) => c + (!isLocked(m) && !completa(p[m.id]) ? 1 : 0), 0);
export const grupoCompleto = (g, p) => M.filter((m) => m.g === g).every((m) => completa(p[m.id]));

/* "2 d 3 h" · "3 h 12 m" · "12 m" · "<1 m" */
export function restante(ms) {
  if (ms <= 0) return "0 m";
  const mnt = Math.floor(ms / 60000), h = Math.floor(mnt / 60), d = Math.floor(h / 24);
  if (d >= 1) return d + " d " + (h % 24) + " h";
  if (h >= 1) return h + " h " + (mnt % 60) + " m";
  if (mnt >= 1) return mnt + " m";
  return "<1 m";
}

/* Próximo partido por cerrar (en todo el fixture). */
export function proximoCierre() {
  const now = ahora();
  let prox = null;
  for (const m of M) {
    if (m.ms > now && (!prox || m.ms < prox.t)) prox = { m, t: m.ms };
  }
  return prox;
}

/* ¿Hay algún partido que cierra dentro de las próximas 24 h?
   Sirve para decidir si vale la pena re-renderizar las cuentas regresivas. */
export function hayCierreInminente() {
  const now = ahora();
  return M.some((m) => m.ms > now && m.ms - now < 24 * 3600e3);
}
