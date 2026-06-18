/* Cliente del Apps Script (Google Sheets como base de datos). */
import { API_URL } from "./config.js";

export const apiOk = () => /^https:\/\/script\.google/.test(API_URL);

function conTimeout(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, listo: () => clearTimeout(t) };
}

export async function apiGet() {
  const { signal, listo } = conTimeout(15000);
  try {
    const r = await fetch(API_URL + "?t=" + Date.now(), { cache: "no-store", signal });
    return await r.json();
  } finally { listo(); }
}

export async function apiPost(payload) {
  const { signal, listo } = conTimeout(20000);
  try {
    const r = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita preflight CORS
      body: JSON.stringify(payload),
      signal
    });
    return await r.json();
  } finally { listo(); }
}
