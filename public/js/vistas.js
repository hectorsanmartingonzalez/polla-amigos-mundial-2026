/* Vistas: funciones puras que devuelven HTML (sin tocar el DOM). */
import { T, M, RONDA_NOMBRE, PISTAS, tienePendiente, TOTAL } from "./datos.js";
import { S, me } from "./estado.js";
import { CUOTA, FECHA_LIMITE_PAGO, ADMIN_NOMBRE } from "./config.js";
import {
  esc, clp, fmtDia, fmtHora, fmtFirma, isLocked, pts, ahora, esEmpatePred,
  completa, predsCount, abiertasSinPred, restante, proximoCierre
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
    <p style="margin-top:8px"><b>El pozo completo es para el ganador</b> 🏆 — quien sume más puntos
    al término de los dieciseisavos se lo lleva todo.</p>
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
  const A = esc(ADMIN_NOMBRE);
  const Acap = esc(ADMIN_NOMBRE.charAt(0).toUpperCase() + ADMIN_NOMBRE.slice(1));

  let bases = `
  <div class="hero-bienvenida">
    <span class="hero-emoji" aria-hidden="true">🏆</span>
    <h2>¡Bienvenido a la polla!</h2>
    <p>Predice los <b>16 cruces de dieciseisavos</b> y compite con tus amigos por el pozo.</p>
  </div>

  <div class="eyebrow">Empezar es muy fácil</div>
  <ol class="pasos">
    <li class="paso">
      <span class="paso-num">1</span>
      <div class="paso-txt"><b>Únete</b><span>Pon tu nombre y crea un PIN de 4 dígitos.</span></div>
    </li>
    <li class="paso">
      <span class="paso-num">2</span>
      <div class="paso-txt"><b>Predice los marcadores</b><span>En la pestaña ⚽ Predicción, elige el resultado de cada cruce.</span></div>
    </li>
    <li class="paso">
      <span class="paso-num">3</span>
      <div class="paso-txt"><b>Sigue la tabla en vivo</b><span>En 🏆 Tabla ves los puntos y quién va ganando el pozo.</span></div>
    </li>
  </ol>

  <div class="eyebrow">Cómo se ganan puntos</div>
  <div class="puntaje">
    <div><b class="pz3">3</b><span>Resultado exacto</span></div>
    <div><b class="pz2">2</b><span>Diferencia de gol</span></div>
    <div><b class="pz1">1</b><span>Solo el ganador</span></div>
  </div>

  <div class="demo">
    <div class="demo-cap">Así se ve una predicción 👇</div>
    <div class="demo-match">
      <div class="demo-eq"><span class="demo-bandera">${T.BRA[1]}</span><span class="demo-nom">Brasil</span></div>
      <div class="demo-marc"><span class="demo-gol">2</span><span class="demo-guion">–</span><span class="demo-gol">1</span></div>
      <div class="demo-eq"><span class="demo-bandera">${T.JPN[1]}</span><span class="demo-nom">Japón</span></div>
    </div>
    <div class="demo-nota">Tocas <b>+</b> y <b>−</b> para poner el marcador que crees que pasará.</div>
  </div>

  <div class="regla-pen">
    <div class="regla-pen-ico" aria-hidden="true">⚖️</div>
    <div>
      <b>¿Empate? Hay un punto extra</b>
      <p>Como es eliminatoria, si predices un empate eliges además <b>quién avanza en los penales</b>.
      Si aciertas el clasificado, sumas <b>+1 punto</b> 🎯</p>
    </div>
  </div>

  <div class="eyebrow">Bueno saber</div>
  <div class="reglas-cards">
    <div class="rc"><span class="rc-ico">⏰</span><div><b>Cada cruce se cierra</b><span>a su hora de inicio. Hasta entonces puedes cambiar tu predicción.</span></div></div>
    <div class="rc"><span class="rc-ico">🔄</span><div><b>Tabla automática</b><span>${Acap} carga los resultados y todo se actualiza solo.</span></div></div>
    <div class="rc"><span class="rc-ico">🔒</span><div><b>Tu PIN te protege</b><span>nadie más puede tocar tus predicciones.</span></div></div>
    <div class="rc"><span class="rc-ico">🥇</span><div><b>Si hay empate de puntos</b><span>gana quien tenga más exactos; si persiste, quien confirmó primero.</span></div></div>
  </div>

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
    <label class="eti" for="reg-p">Inventa un PIN de 4 dígitos</label>
    ${campoPin_("reg-p")}
    <p class="parrafo" style="font-size:12px;margin:8px 0 0">Elige 4 números que recuerdes (ej: 1234).
    Es tu llave: lo necesitarás para entrar desde otro teléfono y para que nadie más toque tus
    predicciones. No uses tu clave del banco.</p>
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
        <small>${predsCount(u.preds || {})}/${TOTAL}</small></button>`;
    });
    comparece += `</div>`;
  } else {
    comparece += `<p class="vacio">Aún no hay jugadores.<br>¡Sé el primero en unirte!</p>`;
  }
  comparece += `<button class="btn violeta" style="margin-top:10px;width:100%" data-act="reg-on" type="button">
    Unirme a la polla</button>
  <footer class="pie">Polla entre amigos · Dieciseisavos · 🇨🇦 🇺🇸 🇲🇽</footer>`;

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
function stepper(mid, lado, val, cerrado, flash, equipo) {
  const q = equipo ? " de " + equipo : "";
  return `<div class="stepper">
    <button type="button" data-act="step" data-m="${mid}" data-s="${lado}" data-d="1"
      ${cerrado ? "disabled" : ""} aria-label="sumar gol${q}">+</button>
    <div class="gol${val != null ? " con" : ""}${flash ? " flip" : ""}" aria-live="off"
      aria-label="${val == null ? "sin marcador" : val + " goles" + q}">${val == null ? "·" : val}</div>
    <button type="button" data-act="step" data-m="${mid}" data-s="${lado}" data-d="-1"
      ${(cerrado || val == null || val === 0) ? "disabled" : ""} aria-label="restar gol${q}">−</button>
  </div>`;
}

export function vPred() {
  const yo = me();
  if (!yo) {
    return `<div class="vacio">Primero entra o únete en la pestaña
      <b>Inicio</b> para ingresar tus predicciones.</div>`;
  }
  const lista = M;
  const total = lista.length;
  const comp = predsCount(S.preds);
  const faltan = abiertasSinPred(S.preds);
  const listo = faltan === 0 && comp > 0;
  const now = ahora();
  const pendientes = lista.filter((m) => tienePendiente(m)).length;

  let h = `<div class="pred-wrap">`;

  h += `<div class="foja-info"><span class="gl">${RONDA_NOMBRE}</span>
    <span class="fj">${comp}/${total} predicciones</span></div>
  <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${comp}"
    aria-label="Predicciones completadas"><div style="width:${(comp / total) * 100}%"></div></div>`;

  /* Recordatorio accionable */
  if (faltan > 0) {
    h += `<div class="aviso-faltan">✍️ Te faltan <b>${faltan}</b> ${faltan === 1 ? "predicción" : "predicciones"}
      de partidos que aún puedes jugar.${pendientes ? ` Hay <b>${pendientes}</b> con rival por definir.` : ""}</div>`;
  } else if (comp === total) {
    h += `<div class="aviso-faltan completo">✅ ¡Tienes tus ${total} predicciones listas! Puedes ajustarlas
      hasta que cada partido empiece.</div>`;
  }

  const prox = proximoCierre();
  if (prox) {
    h += `<div class="cd-banner">⏱ Próximo cierre: ${T[prox.m.h][1]} <b>${esc(T[prox.m.h][0])}
      – ${esc(T[prox.m.a][0])}</b> ${T[prox.m.a][1]} · en <b>${restante(prox.t - now)}</b></div>`;
  }

  h += `<div class="foja">`;
  lista.forEach((m, i) => {
    const p = S.preds[m.id] || [null, null, null];
    const cerrado = isLocked(m);
    const tbd = tienePendiente(m);
    const real = S.results[m.id];
    const ppts = pts(p, real);
    const hecha = completa(p);
    const f0 = S.flash && S.flash[0] === m.id && S.flash[1] === 0;
    const f1 = S.flash && S.flash[0] === m.id && S.flash[1] === 1;
    const tCierre = m.ms - now;
    const chipCierre = !cerrado && !tbd && tCierre < 24 * 3600e3
      ? ` · <span class="cd">cierra en ${restante(tCierre)}</span>` : "";
    const bloqueado = cerrado || tbd;
    const pista = PISTAS[m.n] ? `<span class="pista">${PISTAS[m.n]}</span>` : "";

    h += `<div class="partido${hecha && !cerrado ? " ok" : ""}${cerrado ? " cerrado" : ""}${tbd ? " tbd" : ""}"
        style="animation-delay:${i * 0.05}s">
      <div class="meta"><span>Nº ${m.n} · ${esc(fmtDia(m.utc))} · ${esc(fmtHora(m.utc))}${chipCierre}</span>
        ${tbd
          ? `<span class="porded">Rival por definir</span>`
          : cerrado
            ? `<span class="cierre">${real ? "Jugado" : "En juego"}</span>`
            : hecha ? `<span class="enacta">Listo ✓</span>` : `<span>Pendiente</span>`}
      </div>
      <div class="versus">
        <div class="equipo"><div class="bandera" aria-hidden="true">${T[m.h][1]}</div>
          <div class="nombre">${esc(T[m.h][0])}</div></div>
        <div class="marcador">
          ${stepper(m.id, 0, p[0], bloqueado, f0, esc(T[m.h][0]))}<span class="guion" aria-hidden="true">–</span>${stepper(m.id, 1, p[1], bloqueado, f1, esc(T[m.a][0]))}
        </div>
        <div class="equipo"><div class="bandera" aria-hidden="true">${T[m.a][1]}</div>
          <div class="nombre">${esc(T[m.a][0])}</div></div>
      </div>`;

    /* Selector de penales: aparece cuando la predicción es un empate */
    if (esEmpatePred(p) && !tbd) {
      const sel = p[2];
      h += `<div class="penales${!sel && !bloqueado ? " pendiente" : ""}">
        <span class="pen-label" id="penlbl-${m.id}">⚖️ Empate: ¿quién avanza en penales?${!sel && !bloqueado ? " <em>elige uno</em>" : ""}</span>
        <div class="pen-ops" role="group" aria-labelledby="penlbl-${m.id}">
          <button type="button" class="pen-op${sel === "h" ? " act" : ""}" data-act="penal" data-m="${m.id}" data-w="h"
            aria-pressed="${sel === "h"}" ${bloqueado ? "disabled" : ""}>${T[m.h][1]} ${esc(T[m.h][0])}</button>
          <button type="button" class="pen-op${sel === "a" ? " act" : ""}" data-act="penal" data-m="${m.id}" data-w="a"
            aria-pressed="${sel === "a"}" ${bloqueado ? "disabled" : ""}>${T[m.a][1]} ${esc(T[m.a][0])}</button>
        </div>
      </div>`;
    }

    if (real && real[0] != null) {
      const penReal = real[0] === real[1] && real[2]
        ? ` · pasa ${esc(T[m[real[2] === "h" ? "h" : "a"]][0])} 🥅` : "";
      h += `<div class="resultado-real">Resultado: <b>${real[0]}–${real[1]}</b>${penReal}
        ${ppts != null ? `<span class="chip-pts p${ppts}">+${ppts} pts</span>` : ""}</div>`;
    }
    h += `</div>`;
  });
  h += `</div>`;

  h += `
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
    let total = 0, c3 = 0, c2 = 0, c1 = 0, pen = 0;
    M.forEach((m) => {
      const real = S.results[m.id];
      const p = pts((u.preds || {})[m.id], real);
      if (p == null) return;
      total += p;
      /* Clasificación del acierto base (sin el bonus) para mostrar y desempatar */
      const pred = (u.preds || {})[m.id];
      if (pred && real && pred[0] != null && real[0] != null) {
        const exacto = pred[0] === real[0] && pred[1] === real[1];
        const dif = pred[0] - pred[1] === real[0] - real[1];
        const gana = Math.sign(pred[0] - pred[1]) === Math.sign(real[0] - real[1]);
        if (exacto) c3++; else if (dif) c2++; else if (gana) c1++;
        if (pred[0] === pred[1] && real[0] === real[1] && pred[2] && pred[2] === real[2]) pen++;
      }
    });
    return { u, total, c3, c2, c1, pen };
  });
  /* Desempate: puntos → exactos → diferencias → aciertos de penales → confirmó primero → alfabético */
  filas.sort((a, b) =>
    b.total - a.total || b.c3 - a.c3 || b.c2 - a.c2 || b.pen - a.pen ||
    ((a.u.submittedAt || Infinity) - (b.u.submittedAt || Infinity)) ||
    (a.u.apellido + a.u.nombre).localeCompare(b.u.apellido + b.u.nombre));

  const pagados = S.users.filter((u) => u.paid).length;
  const pozo = pagados * CUOTA;
  const jugados = M.filter((m) => S.results[m.id] && S.results[m.id][0] != null).length;
  const medalla = ["oro", "plata", "bronce"];

  const lado = `
  <div class="pozo">
    <div class="titulo">Pozo para el ganador · ${pagados} cuota${pagados === 1 ? "" : "s"} pagada${pagados === 1 ? "" : "s"}</div>
    <div class="monto" id="pozo-monto" data-to="${pozo}" data-clp="${clp(pozo)}">${clp(0)}</div>
    <div class="pozo-pie">🏆 Se lo lleva completo quien sume más puntos en los dieciseisavos</div>
  </div>
  <p class="parrafo nota-cuota">Cuota ${clp(CUOTA)} — se recibe hasta el ${FECHA_LIMITE_PAGO}.
  El pozo es íntegro para el campeón. Desempate: más exactos, luego más diferencias, luego más
  aciertos de penales, y por último quien confirmó primero.</p>`;

  let listaH = `
  <div class="eyebrow">Tabla en vivo · ${jugados}/${TOTAL} cargados
    <button class="btn-mini" type="button" style="margin-left:auto" data-act="refresh">↻ Actualizar</button>
  </div>`;
  if (!filas.length) listaH += `<p class="vacio">🏁 La tabla está lista para arrancar.<br>
    Cuando se inscriban los jugadores y empiecen los partidos, aquí verás quién va ganando.</p>`;
  filas.forEach((f, i) => {
    const estado = f.u.submittedAt
      ? `✓ confirmadas`
      : `${predsCount(f.u.preds || {})}/${TOTAL} sin confirmar`;
    const esYo = f.u.id === S.meId;
    const detPen = f.pen > 0 ? ` · penales ${f.pen}` : "";
    listaH += `<div class="fila${i === 0 && f.total > 0 ? " lider" : ""}${esYo ? " yo" : ""}" style="animation-delay:${i * 0.045}s">
      <div class="pos ${f.total > 0 && i < 3 ? medalla[i] : ""}">${i + 1}</div>
      <div class="quien"><div class="nom">${esc(f.u.nombre)} ${esc(f.u.apellido)}
        ${f.u.paid ? `<span class="sello verde">Pagó</span>` : `<span class="sello gris">Pendiente</span>`}</div>
        <div class="det">exactos ${f.c3} · dif ${f.c2} · ganador ${f.c1}${detPen} · ${estado}</div></div>
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
    RONDA_NOMBRE.toUpperCase(),
    "Jugador: " + yo.nombre + " " + yo.apellido,
    "Confirmadas: " + fmtFirma(yo.submittedAt || Date.now()),
    "Predicciones: " + predsCount(yo.preds || {}) + "/" + TOTAL,
    "------------------------------"
  ];
  M.forEach((m) => {
    const p = (yo.preds || {})[m.id];
    const g0 = p && p[0] != null ? p[0] : "-";
    const g1 = p && p[1] != null ? p[1] : "-";
    let linea = T[m.h][0] + " " + g0 + ":" + g1 + " " + T[m.a][0];
    if (p && p[0] != null && p[0] === p[1] && p[2]) {
      linea += " (pasa " + T[m[p[2] === "h" ? "h" : "a"]][0] + ")";
    }
    L.push("Nº" + m.n + "  " + linea);
  });
  return L.join("\n");
}
