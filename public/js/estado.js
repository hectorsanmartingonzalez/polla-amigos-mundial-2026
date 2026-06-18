/* Estado de la aplicación (sin tocar el DOM). */
export const S = {
  view: "inicio",
  grupo: "A",
  users: [],
  results: {},
  meId: null,
  pin: null,           // PIN de 4 dígitos de la sesión actual
  pidiendoPin: null,   // id del participante que está ingresando su PIN
  preds: {},           // copia editable de las predicciones propias
  dirty: false,
  cargando: true,
  errorRed: false,
  registrando: false,
  guardando: false,      // guardando/firmando predicciones
  verificando: false,    // verificando PIN (login)
  pozoAnimado: false,    // el conteo del pozo ya se animó una vez
  flash: null          // [matchId, lado] para animar el dígito recién cambiado
};

export const me = () => S.users.find((u) => u.id === S.meId) || null;

const LLAVE_ID = "pa26_id";
const LLAVE_PIN = "pa26_pin";

export function cargarIdentidad() {
  try {
    S.meId = localStorage.getItem(LLAVE_ID) || null;
    S.pin = localStorage.getItem(LLAVE_PIN) || null;
  } catch (_) { S.meId = null; S.pin = null; }
}
export function guardarIdentidad(id, pin) {
  S.meId = id; S.pin = pin;
  try {
    localStorage.setItem(LLAVE_ID, id);
    localStorage.setItem(LLAVE_PIN, pin);
  } catch (_) {}
}
export function limpiarIdentidad() {
  S.meId = null; S.pin = null;
  try {
    localStorage.removeItem(LLAVE_ID);
    localStorage.removeItem(LLAVE_PIN);
  } catch (_) {}
}
