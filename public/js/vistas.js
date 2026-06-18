/* Vistas: funciones puras que devuelven HTML (sin tocar el DOM). */
import { T, GROUPS, M, matchesOf } from "./datos.js";
import { S, me } from "./estado.js";
import { CUOTA, FECHA_LIMITE_PAGO, ADMIN_NOMBRE } from "./config.js";
import {
  esc, clp, fmtDia, fmtHora, fmtFirma, isLocked, pts, ahora,
  completa, predsCount, abiertasSinPred, grupoCompleto, restante, proximoCierre
} from "./util.js";
import { skel, spinner } from "./ui.js";

/* ============================================================
   INICIO (portada, identificación e inscripción)
   ============================================================ */
function bloqueCuota_() {
  return `
  <div class="eyebrow">La cuota</div>
  <div class="cuota-caja">
    <div class="cuota-monto">${clp(CUOTA)}</div>
    <p>Coordina el pago directamente con <b>${esc(ADMIN_NOMBRE)}</b> (en persona o por
    transferencia). Tienes plazo hasta el día de la final, el <b>${FECHA_LIMITE_PAGO}</b>.</p>
    <p style="margin-top:8px">El pozo se reparte por mitades: <b>la mitad premia al campeón</b>
    de la polla y <b>la otra mitad financia la fiesta final</b> 🎉</p>
  </div>`;
}

const campoPin_ = (id) => `
  <div class="campo-pin-wrap">
    <input id="${id}" class="campo campo-pin" type="password" inputmode="numeric" pattern="[0-9]*"
      maxlength="4" placeholder="••••" autocomplete="off">
    <button type="button" class="ver-pin" data-act="ver-pin" data-target="${id}"
      aria-label="mostrar u ocultar PIN">👁</button>
  </div>`;

export function vInicio() {
  let bases = `
  <div class="eyebrow">Cómo se juega</div>
  <p class="parrafo">Predice el marcador de <b>los 72 partidos de la fase de grupos</b>,
  grupo por grupo. Ganas puntos según qué tan cerca quedes del resultado real:</p>
  <div class="puntaje">
    <div><b class="pz3">3</b><span>Resultado exacto</span></div>
    <div><b class="pz2">2</b><span>Diferencia de gol</span></div>
    <div><b class="pz1">1</b><span>Solo el ganador</span></div>
  </div>
  <p class="parrafo" style="font-size:12.5px">Cada partido se cierra a su hora de inicio: hasta
  entonces puedes cambiar tu predicción. ${esc(ADMIN_NOMBRE.charAt(0).toUpperCase() + ADMIN_NOMBRE.slice(1))}
  carga los resultados y la tabla se actualiza sola. <b>Desempate:</b> más resultados exactos;
  luego más aciertos de diferencia; si persiste, gana quien <b>confirmó primero</b>. Tus
  predicciones quedan protegidas con un <b>PIN de 4 dígitos</b> que solo tú conoces.</p>
  ${bloqueCuota_()}`;

  let comparece = `<hr class="doblelinea solo-movil"><div class="eyebrow">Jugadores</div>`;

  if (S.cargando) {
    comparece += skel(50) + skel(50) + skel(50, "70%");
    return envolverInicio_(bases, comparece);
  }

  /* --- Ingreso de PIN para un jugador elegido --- */
  if (S.pidiendoPin) {
    const u = S.users.find((x) => x.id === S.pidiendoPin);
    comparece += `
    <p class="parrafo" style="margin-top:0">Hola, <b>${esc(u ? u.nombre + " " + u.apellido : "")}</b>.
    Ingresa tu PIN de 4 dígitos para entrar a tus predicciones.</p>
    <label class="eti" for="pin-in">Tu PIN</label>
    ${campoPin_("pin-in")}
    <div style="display:flex;gap:8px;margin-top:18px">
      <button class="btn fantasma" style="flex:1" data-act="pin-volver" type="button">Volver</button>
      <button class="btn violeta" style="flex:2" data-act="pin-entrar" type="button"${S.verificando ? " disabled" : ""}>
        ${S.verificando ? spinner() + "Verificando…" : "Entrar"}</button>
    </div>
    <p class="parrafo" style="font-size:12px;margin-top:14px">¿Olvidaste tu PIN?
    Pídeselo a ${esc(ADMIN_NOMBRE)}.</p>`;
    return envolverInicio_(bases, comparece);
  }

  /* --- Formulario de inscripción --- */
  if (S.registrando) {
    comparece += `
    <label class="eti" for="reg-n">Nombre</label>
    <input id="reg-n" class="campo" placeholder="Ej: Marcelo" maxlength="40" autocomplete="given-name">
    <label class="eti" for="reg-a">Apellido</label>
    <input id="reg-a" class="campo" placeholder="Ej: Carranza" maxlength="40" autocomplete="family-name">
    <label class="eti" for="reg-p">Crea tu PIN (4 dígitos)</label>
    ${campoPin_("reg-p")}
    <p class="parrafo" style="font-size:12px;margin:8px 0 0">Guárdalo bien: te servirá para entrar
    desde otros teléfonos y nadie más podrá tocar tus predicciones.</p>
    <div style="display:flex;gap:8px;margin-top:18px">
      <button class="btn fantasma" style="flex:1" data-act="reg-off" type="button">Volver</button>
      <button class="btn violeta" style="flex:2" data-act="registrar" type="button"${S.guardando ? " disabled" : ""}>
        ${S.guardando ? spinner() + "Inscribiendo…" : "¡Unirme a la polla!"}</button>
    </div>`;
    return envolverInicio_(bases, comparece);
  }

  /* --- Lista de jugadores + botón de inscripción --- */
  const lista = [...S.users].sort((a, b) =>
    (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre));
  if (lista.length) {
    comparece += `<p class="parrafo" style="margin-top:0">¿Ya estás dentro? Toca tu nombre
    (te pedirá tu PIN):</p><div class="lista-personas">`;
    lista.forEach((u, i) => {
      comparece += `<button class="persona" data-act="soy" data-id="${esc(u.id)}" type="button"
        style="animation-delay:${i * 0.04}s">
        <span>${esc(u.nombre)} ${esc(u.apellido)}</span>
        <small>${predsCount(u.preds || {})}/72</small></button>`;
    });
    comparece += `</div>`;
  } else {
    comparece += `<p class="vacio">Aún no hay jugadores.<br>¡Sé el primero en unirte!</p>`;
  }
  comparece += `<button class="btn violeta" style="margin-top:10px;width:100%" data-act="reg-on" type="button">
    Unirme a la polla</button>
  <footer class="pie">Polla entre amigos · v1.0 · 🇨🇦 🇺🇸 🇲🇽</footer>`;

  return envolverInicio_(bases, comparece);
}

const envolverInicio_ = (bases, comparece) => `
  <div class="cuerpo-inicio">
    <section class="panel-bases">${bases}</section>
    <section class="panel-comparece">${comparece}</section>
  </div>`;

/* ============================================================
   PREDICCIÓN (fixture por grupo)
   ============================================================ */
function stepper(mid, lado, val, cerrado, flash) {
  return `<div class="stepper">
    <button type="button" data-act="step" data-m="${mid}" data-s="${lado}" data-d="1"
      ${cerrado ? "disabled" : ""} aria-label="sumar gol">+</button>
    <div class="gol${val != null ? " con" : ""}${flash ? " flip" : ""}" aria-live="off">${val == null ? "·" : val}</div>
    <button type="button" data-act="step" data-m="${mid}" data-s="${lado}" data-d="-1"
      ${(cerrado || val == null || val === 0) ? "disabled" : ""} aria-label="restar gol">−</button>
  </div>`;
}

export function vPred() {
  const yo = me();
  if (!yo) {
    return `<div class="vacio">Primero entra o únete en la pestaña
      <b>Inicio</b> para ingresar tus predicciones.</div>`;
  }
  const idx = GROUPS.indexOf(S.grupo);
  const lista = matchesOf(S.grupo);
  const comp = predsCount(S.preds);
  const faltan = abiertasSinPred(S.preds);
  const listo = faltan === 0 && comp > 0;
  const now = ahora();

  let h = `<div class="pred-wrap"><div class="marca-grupo" data-g="${S.grupo}">${S.grupo}</div>`;

  h += `<div class="riel" role="tablist" aria-label="Grupos">`;
  GROUPS.forEach((g) => {
    h += `<button type="button" role="tab" aria-selected="${g === S.grupo}"
      data-act="grupo" data-g="${g}"
      class="${g === S.grupo ? "activo " : ""}${grupoCompleto(g, S.preds) ? "lleno" : ""}">${g}</button>`;
  });
  h += `</div>
  <div class="foja-info"><span class="gl">Grupo ${S.grupo}</span>
    <span class="fj">${idx + 1} / 12 grupos · ${comp}/72</span></div>
  <div class="barra"><div style="width:${(comp / 72) * 100}%"></div></div>`;

  const prox = proximoCierre();
  if (prox) {
    h += `<div class="cd-banner">⏱ Próximo cierre: ${T[prox.m.h][1]} <b>${esc(T[prox.m.h][0])}
      – ${esc(T[prox.m.a][0])}</b> ${T[prox.m.a][1]} · en <b>${restante(prox.t - now)}</b></div>`;
  }

  h += `<div class="foja">`;
  lista.forEach((m, i) => {
    const p = S.preds[m.id] || [null, null];
    const cerrado = isLocked(m);
    const real = S.results[m.id];
    const ppts = pts(p, real);
    const hecha = completa(p);
    const f0 = S.flash && S.flash[0] === m.id && S.flash[1] === 0;
    const f1 = S.flash && S.flash[0] === m.id && S.flash[1] === 1;
    const tCierre = m.ms - now;
    const chipCierre = !cerrado && tCierre < 24 * 3600e3
      ? ` · <span class="cd">cierra en ${restante(tCierre)}</span>` : "";

    h += `<div class="partido${hecha && !cerrado ? " ok" : ""}${cerrado ? " cerrado" : ""}"
        style="animation-delay:${i * 0.05}s">
      <div class="meta"><span>Nº ${m.n} · ${esc(fmtDia(m.utc))} · ${esc(fmtHora(m.utc))}${chipCierre}</span>
        ${cerrado
          ? `<span class="cierre">${real ? "Jugado" : "En juego"}</span>`
          : hecha ? `<span class="enacta">Listo ✓</span>` : `<span>Pendiente</span>`}
      </div>
      <div class="versus">
        <div class="equipo"><div class="bandera">${T[m.h][1]}</div>
          <div class="nombre">${esc(T[m.h][0])}</div></div>
        <div class="marcador">
          ${stepper(m.id, 0, p[0], cerrado, f0)}<span class="guion">–</span>${stepper(m.id, 1, p[1], cerrado, f1)}
        </div>
        <div class="equipo"><div class="bandera">${T[m.a][1]}</div>
          <div class="nombre">${esc(T[m.a][0])}</div></div>
      </div>`;
    if (real && real[0] != null) {
      h += `<div class="resultado-real">Resultado: <b>${real[0]}–${real[1]}</b>
        ${ppts != null ? `<span class="chip-pts p${ppts}">+${ppts} pts</span>` : ""}</div>`;
    }
    h += `</div>`;
  });
  h += `</div>`;

  const grupoListo = grupoCompleto(S.grupo, S.preds);
  h += `
  <div class="nav-grupos">
    <button class="btn fantasma" type="button"
      data-act="grupo" data-g="${idx > 0 ? GROUPS[idx - 1] : ""}" ${idx === 0 ? "disabled" : ""}
      aria-label="grupo anterior">←</button>
    <button class="btn${grupoListo && idx < 11 ? " destacar" : ""}" type="button"
      data-act="grupo" data-g="${idx < 11 ? GROUPS[idx + 1] : ""}" ${idx === 11 ? "disabled" : ""}>
      Siguiente grupo${idx < 11 ? " (" + GROUPS[idx + 1] + ")" : ""}</button>
  </div>
  <hr class="doblelinea">
  <div class="acciones-acta">
    <button class="btn fantasma" type="button"
      data-act="guardar" ${S.guardando ? "disabled" : ""}>
      ${S.guardando ? spinner() + "Guardando…" : "Guardar avance" + (S.dirty ? " ●" : "")}</button>
    <button class="btn violeta" type="button" data-act="firmar"
      ${(!listo || S.guardando) ? "disabled" : ""}>
      ${S.guardando ? spinner() + "Guardando…" : listo ? "🎉 ¡Confirmar mis predicciones!" : "Faltan " + faltan + " predicciones"}</button>
  </div>`;

  if (yo.submittedAt) {
    h += `
    <p class="parrafo" style="font-size:12px;text-align:center;margin-top:12px">
      <span class="sello">Confirmadas</span>&nbsp;&nbsp;${esc(fmtFirma(yo.submittedAt))}</p>
    <div class="acciones-copia">
      <button class="btn fantasma" type="button" data-act="copiar">⧉ Copiar</button>
      <button class="btn wsp" type="button" data-act="wsp">Compartir por WhatsApp</button>
    </div>`;
  }
  h += `</div>`;
  return h;
}

/* ============================================================
   TABLA EN VIVO
   ============================================================ */
export function vTabla() {
  if (S.cargando) {
    return skel(150) + skel(20, "55%", "margin:18px 0 12px") + skel(62) + skel(62) + skel(62);
  }
  const filas = S.users.map((u) => {
    let total = 0, c3 = 0, c2 = 0, c1 = 0;
    M.forEach((m) => {
      const p = pts((u.preds || {})[m.id], S.results[m.id]);
      if (p === 3) { total += 3; c3++; } else if (p === 2) { total += 2; c2++; }
      else if (p === 1) { total += 1; c1++; }
    });
    return { u, total, c3, c2, c1 };
  });
  /* Desempate: puntos → exactos → diferencias → quien confirmó primero → alfabético */
  filas.sort((a, b) =>
    b.total - a.total || b.c3 - a.c3 || b.c2 - a.c2 ||
    ((a.u.submittedAt || Infinity) - (b.u.submittedAt || Infinity)) ||
    (a.u.apellido + a.u.nombre).localeCompare(b.u.apellido + b.u.nombre));

  const pagados = S.users.filter((u) => u.paid).length;
  const pozo = pagados * CUOTA;
  const jugados = M.filter((m) => S.results[m.id] && S.results[m.id][0] != null).length;
  const medalla = ["oro", "plata", "bronce"];

  const lado = `
  <div class="pozo">
    <div class="titulo">Pozo acumulado · ${pagados} cuota${pagados === 1 ? "" : "s"} pagada${pagados === 1 ? "" : "s"}</div>
    <div class="monto" id="pozo-monto" data-to="${pozo}" data-clp="${clp(pozo)}">${clp(0)}</div>
    <div class="reparto">
      <div><span>🏆 Premio campeón</span><b>${clp(pozo / 2)}</b></div>
      <div><span>🎉 Fiesta final</span><b>${clp(pozo / 2)}</b></div>
    </div>
  </div>
  <p class="parrafo nota-cuota">Cuota ${clp(CUOTA)} — se recibe hasta el día de la final
  (${FECHA_LIMITE_PAGO}). El pozo se reparte por mitades: premio del campeón y fondo de la fiesta.
  Desempate final: quien confirmó primero.</p>`;

  let listaH = `
  <div class="eyebrow">Tabla en vivo · ${jugados}/72 cargados
    <button class="btn-mini" type="button" style="margin-left:auto" data-act="refresh">↻ Actualizar</button>
  </div>`;
  if (!filas.length) listaH += `<p class="vacio">Sin jugadores todavía.</p>`;
  filas.forEach((f, i) => {
    const estado = f.u.submittedAt
      ? `✓ confirmadas`
      : `${predsCount(f.u.preds || {})}/72 sin confirmar`;
    const esYo = f.u.id === S.meId;
    listaH += `<div class="fila${i === 0 && f.total > 0 ? " lider" : ""}${esYo ? " yo" : ""}" style="animation-delay:${i * 0.045}s">
      <div class="pos ${f.total > 0 && i < 3 ? medalla[i] : ""}">${i + 1}</div>
      <div class="quien"><div class="nom">${esc(f.u.nombre)} ${esc(f.u.apellido)}
        ${f.u.paid ? `<span class="sello verde">Pagó</span>` : `<span class="sello gris">Pendiente</span>`}</div>
        <div class="det">exactos ${f.c3} · dif ${f.c2} · ganador ${f.c1} · ${estado}</div></div>
      <div class="pts">${f.total}<small>PTS</small></div>
    </div>`;
  });

  return `<div class="cuerpo-tabla">
    <aside class="lado-tabla">${lado}</aside>
    <div class="lista-tabla">${listaH}</div>
  </div>`;
}

/* ============================================================
   Estados especiales
   ============================================================ */
export const vConfig = () => `
  <div class="aviso-config"><b>Falta un paso de configuración (solo administrador).</b><br><br>
  Esta app aún no está conectada a la planilla. Edita <code>public/js/config.js</code>
  y pega en <code>API_URL</code> la URL de tu Apps Script (termina en <code>/exec</code>).
  Los pasos completos están en <code>INSTRUCCIONES.md</code> del repositorio.</div>`;

export const vError = () => `
  <div class="vacio">No pudimos conectar con el servidor.<br>Revisa tu conexión a internet.
  <br><br><button class="btn fantasma" type="button" data-act="reload"
  style="max-width:220px;margin:0 auto">Reintentar</button></div>`;

/* ============================================================
   Texto para copiar o compartir
   ============================================================ */
export function cuerpoCorreo() {
  const yo = me();
  if (!yo) return "";
  const L = [
    "MIS PREDICCIONES — POLLA AMIGOS · MUNDIAL 2026",
    "Jugador: " + yo.nombre + " " + yo.apellido,
    "Confirmadas: " + fmtFirma(yo.submittedAt || Date.now()),
    "Predicciones: " + predsCount(yo.preds || {}) + "/72",
    "------------------------------"
  ];
  GROUPS.forEach((g) => {
    L.push("GRUPO " + g);
    matchesOf(g).forEach((m) => {
      const p = (yo.preds || {})[m.id];
      L.push(m.h + " " + (p && p[0] != null ? p[0] : "-") + ":" + (p && p[1] != null ? p[1] : "-") + " " + m.a);
    });
    L.push("");
  });
  return L.join("\n");
}
