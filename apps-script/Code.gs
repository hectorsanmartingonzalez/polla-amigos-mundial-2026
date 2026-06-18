/******************************************************
 * POLLA AMIGOS · MUNDIAL 2026 — API (v2 con PIN)
 * Google Apps Script vinculado a la planilla.
 *
 * Pestañas que crea solo:
 *  - participantes : una fila por persona (pago = checkbox, PIN visible para el admin)
 *  - resultados    : aquí anotas los marcadores reales
 *  - detalle       : matriz legible con todas las predicciones
 *
 * Seguridad: cada participante elige un PIN de 4 dígitos al
 * inscribirse. Para entrar desde otro dispositivo y para
 * guardar predicciones se exige ese PIN. El administrador
 * puede verlo o cambiarlo en la columna "pin" de la planilla.
 *
 * ⚠️ El FIXTURE de abajo debe ser idéntico al de
 * public/js/datos.js (const FIX). Si cambias un horario o
 * equipo en un lado, cámbialo también en el otro.
 ******************************************************/

var HOJA_P = 'participantes';
var HOJA_R = 'resultados';
var HOJA_D = 'detalle';

var FIXTURE = [[1,"A","MEX","RSA","2026-06-11T19:00:00Z"],[2,"A","KOR","CZE","2026-06-12T02:00:00Z"],[3,"B","CAN","BIH","2026-06-12T19:00:00Z"],[4,"D","USA","PAR","2026-06-13T01:00:00Z"],[5,"B","QAT","SUI","2026-06-13T19:00:00Z"],[6,"C","BRA","MAR","2026-06-13T22:00:00Z"],[7,"C","HAI","SCO","2026-06-14T01:00:00Z"],[8,"D","AUS","TUR","2026-06-14T04:00:00Z"],[9,"E","GER","CUW","2026-06-14T17:00:00Z"],[10,"F","NED","JPN","2026-06-14T20:00:00Z"],[11,"E","CIV","ECU","2026-06-14T23:00:00Z"],[12,"F","SWE","TUN","2026-06-15T02:00:00Z"],[13,"H","ESP","CPV","2026-06-15T16:00:00Z"],[14,"G","BEL","EGY","2026-06-15T19:00:00Z"],[15,"H","KSA","URU","2026-06-15T22:00:00Z"],[16,"G","IRN","NZL","2026-06-16T01:00:00Z"],[17,"I","FRA","SEN","2026-06-16T19:00:00Z"],[18,"I","IRQ","NOR","2026-06-16T22:00:00Z"],[19,"J","ARG","ALG","2026-06-17T01:00:00Z"],[20,"J","AUT","JOR","2026-06-17T04:00:00Z"],[21,"K","POR","COD","2026-06-17T17:00:00Z"],[22,"L","ENG","CRO","2026-06-17T20:00:00Z"],[23,"L","GHA","PAN","2026-06-17T23:00:00Z"],[24,"K","UZB","COL","2026-06-18T02:00:00Z"],[25,"A","CZE","RSA","2026-06-18T16:00:00Z"],[26,"B","SUI","BIH","2026-06-18T19:00:00Z"],[27,"B","CAN","QAT","2026-06-18T22:00:00Z"],[28,"A","MEX","KOR","2026-06-19T01:00:00Z"],[29,"D","USA","AUS","2026-06-19T19:00:00Z"],[30,"C","SCO","MAR","2026-06-19T22:00:00Z"],[31,"C","BRA","HAI","2026-06-20T00:30:00Z"],[32,"D","TUR","PAR","2026-06-20T03:00:00Z"],[33,"F","NED","SWE","2026-06-20T17:00:00Z"],[34,"E","GER","CIV","2026-06-20T20:00:00Z"],[35,"E","ECU","CUW","2026-06-21T00:00:00Z"],[36,"F","TUN","JPN","2026-06-21T04:00:00Z"],[37,"H","ESP","KSA","2026-06-21T16:00:00Z"],[38,"G","BEL","IRN","2026-06-21T19:00:00Z"],[39,"H","URU","CPV","2026-06-21T22:00:00Z"],[40,"G","NZL","EGY","2026-06-22T01:00:00Z"],[41,"J","ARG","AUT","2026-06-22T17:00:00Z"],[42,"I","FRA","IRQ","2026-06-22T21:00:00Z"],[43,"I","NOR","SEN","2026-06-23T00:00:00Z"],[44,"J","JOR","ALG","2026-06-23T03:00:00Z"],[45,"K","POR","UZB","2026-06-23T17:00:00Z"],[46,"L","ENG","GHA","2026-06-23T20:00:00Z"],[47,"L","PAN","CRO","2026-06-23T23:00:00Z"],[48,"K","COL","COD","2026-06-24T02:00:00Z"],[49,"B","SUI","CAN","2026-06-24T19:00:00Z"],[50,"B","BIH","QAT","2026-06-24T19:00:00Z"],[51,"C","MAR","HAI","2026-06-24T22:00:00Z"],[52,"C","SCO","BRA","2026-06-24T22:00:00Z"],[53,"A","RSA","KOR","2026-06-25T01:00:00Z"],[54,"A","CZE","MEX","2026-06-25T01:00:00Z"],[55,"E","CUW","CIV","2026-06-25T20:00:00Z"],[56,"E","ECU","GER","2026-06-25T20:00:00Z"],[57,"F","TUN","NED","2026-06-25T23:00:00Z"],[58,"F","JPN","SWE","2026-06-25T23:00:00Z"],[59,"D","TUR","USA","2026-06-26T02:00:00Z"],[60,"D","PAR","AUS","2026-06-26T02:00:00Z"],[61,"I","NOR","FRA","2026-06-26T19:00:00Z"],[62,"I","SEN","IRQ","2026-06-26T19:00:00Z"],[63,"H","CPV","KSA","2026-06-27T00:00:00Z"],[64,"H","URU","ESP","2026-06-27T00:00:00Z"],[65,"G","NZL","BEL","2026-06-27T03:00:00Z"],[66,"G","EGY","IRN","2026-06-27T03:00:00Z"],[67,"L","PAN","ENG","2026-06-27T21:00:00Z"],[68,"L","CRO","GHA","2026-06-27T21:00:00Z"],[69,"K","COL","POR","2026-06-27T23:30:00Z"],[70,"K","COD","UZB","2026-06-27T23:30:00Z"],[71,"J","ALG","AUT","2026-06-28T02:00:00Z"],[72,"J","JOR","ARG","2026-06-28T02:00:00Z"]];

/* Ejecutar UNA VEZ a mano para crear las pestañas y autorizar permisos */
function configurar() {
  ensure_();
  SpreadsheetApp.getActiveSpreadsheet().toast('Pestañas listas: participantes, resultados y detalle ✓', 'Polla Mundial');
}

function doGet() {
  ensure_();
  return out_(snapshot_());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    ensure_();
    var b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var r;
    if (b.action === 'register') r = register_(b);
    else if (b.action === 'login') r = login_(b);
    else if (b.action === 'save_preds') r = savePreds_(b);
    else r = { ok: false, error: 'Acción desconocida' };
    return out_(r);
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ----------------- internos ----------------- */

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function ensure_() {
  var ss = ss_();
  var p = ss.getSheetByName(HOJA_P);
  if (!p) {
    p = ss.insertSheet(HOJA_P);
    p.getRange(1, 1, 1, 8).setValues([[
      'id', 'nombre', 'apellido', 'pagado', 'firmada', 'actualizado', 'predicciones_json', 'pin'
    ]]).setFontWeight('bold');
    p.setFrozenRows(1);
    p.getRange('D2:D300').insertCheckboxes();
    p.setColumnWidth(7, 320);
  }
  /* Migración: planillas creadas antes del PIN */
  if (String(p.getRange(1, 8).getValue()) !== 'pin') {
    p.getRange(1, 8).setValue('pin').setFontWeight('bold');
  }
  var r = ss.getSheetByName(HOJA_R);
  if (!r) {
    r = ss.insertSheet(HOJA_R);
    r.getRange(1, 1, 1, 7).setValues([[
      'nº', 'grupo', 'local', 'visita', 'inicio (UTC)', 'goles_local', 'goles_visita'
    ]]).setFontWeight('bold');
    r.setFrozenRows(1);
    var filas = FIXTURE.map(function (f) { return [f[0], f[1], f[2], f[3], f[4]]; });
    r.getRange(2, 1, filas.length, 5).setValues(filas);
    r.getRange(2, 6, filas.length, 2).setBackground('#FFF8E1');
  }
  var d = ss.getSheetByName(HOJA_D);
  if (!d) {
    d = ss.insertSheet(HOJA_D);
    d.getRange(1, 1, 1, 4).setValues([['nº', 'grupo', 'local', 'visita']]).setFontWeight('bold');
    d.setFrozenRows(1);
    d.setFrozenColumns(4);
    var base = FIXTURE.map(function (f) { return [f[0], f[1], f[2], f[3]]; });
    d.getRange(2, 1, base.length, 4).setValues(base);
  }
}

function snapshot_() {
  var ss = ss_();
  var p = ss.getSheetByName(HOJA_P);
  var r = ss.getSheetByName(HOJA_R);
  var users = [];
  var pv = p.getDataRange().getValues();
  for (var i = 1; i < pv.length; i++) {
    var fila = pv[i];
    if (!fila[0]) continue;
    users.push(userDe_(fila)); // nunca incluye el PIN
  }
  var results = {};
  var rv = r.getDataRange().getValues();
  for (var j = 1; j < rv.length; j++) {
    var n = rv[j][0], gl = rv[j][5], gv = rv[j][6];
    if (n !== '' && gl !== '' && gv !== '' && !isNaN(gl) && !isNaN(gv)) {
      results['m' + n] = [Number(gl), Number(gv)];
    }
  }
  return { ok: true, users: users, results: results, now: Date.now() };
}

/* Construye el objeto público de un participante (SIN pin) */
function userDe_(fila) {
  var preds = {};
  try { preds = JSON.parse(fila[6] || '{}'); } catch (_) {}
  return {
    id: String(fila[0]),
    nombre: String(fila[1]),
    apellido: String(fila[2]),
    paid: fila[3] === true || fila[3] === 'TRUE',
    submittedAt: fila[4] ? new Date(fila[4]).getTime() : null,
    preds: preds
  };
}

function slug_(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function pinValido_(pin) { return /^[0-9]{4}$/.test(String(pin || '')); }

function pinIgual_(guardado, recibido) {
  var a = String(guardado == null ? '' : guardado).trim();
  var b = String(recibido == null ? '' : recibido).trim();
  if (a === b) return true;
  /* tolerancia: si el admin reescribió el PIN a mano y Sheets le quitó ceros a la izquierda */
  if (a !== '' && b !== '' && !isNaN(a) && !isNaN(b)) return Number(a) === Number(b);
  return false;
}

function filaDe_(vals, id) {
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

function register_(b) {
  var nombre = String(b.nombre || '').trim();
  var apellido = String(b.apellido || '').trim();
  if (!nombre || !apellido) return { ok: false, error: 'Nombre y apellido son obligatorios' };
  if (nombre.length > 40 || apellido.length > 40) return { ok: false, error: 'Nombre demasiado largo' };
  if (!pinValido_(b.pin)) return { ok: false, error: 'El PIN debe ser de 4 dígitos' };
  var p = ss_().getSheetByName(HOJA_P);
  /* Nombre duplicado: evitar dos filas iguales en la lista */
  var firma = slug_(nombre) + '|' + slug_(apellido);
  var vals = p.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (!vals[i][0]) continue;
    if (slug_(vals[i][1]) + '|' + slug_(vals[i][2]) === firma) {
      return { ok: false, error: 'Ya existe "' + vals[i][1] + ' ' + vals[i][2] + '" en la polla. Si eres tú, vuelve y entra con tu PIN; si es otra persona, agrega una inicial o segundo apellido.' };
    }
  }
  var id = slug_(nombre + '-' + apellido) + '-' + Math.random().toString(36).slice(2, 6);
  p.appendRow([id, nombre, apellido, false, '', new Date(), '{}', "'" + String(b.pin)]);
  p.getRange(p.getLastRow(), 4).insertCheckboxes();
  return { ok: true, user: { id: id, nombre: nombre, apellido: apellido, paid: false, submittedAt: null, preds: {} } };
}

/* Entrar desde un dispositivo: valida el PIN.
   Si la fila aún no tiene PIN (cuentas antiguas), el primer
   PIN que llegue queda registrado como suyo. */
function login_(b) {
  if (!pinValido_(b.pin)) return { ok: false, error: 'El PIN debe ser de 4 dígitos' };
  var p = ss_().getSheetByName(HOJA_P);
  var vals = p.getDataRange().getValues();
  var row = filaDe_(vals, b.id);
  if (row < 0) return { ok: false, error: 'Participante no encontrado' };
  var guardado = vals[row - 1][7];
  if (guardado === '' || guardado == null) {
    p.getRange(row, 8).setValue("'" + String(b.pin));
  } else if (!pinIgual_(guardado, b.pin)) {
    return { ok: false, error: 'PIN incorrecto' };
  }
  return { ok: true, user: userDe_(vals[row - 1]) };
}

function lockedSet_() {
  var now = Date.now();
  var s = {};
  FIXTURE.forEach(function (f) {
    if (now >= new Date(f[4]).getTime()) s['m' + f[0]] = true;
  });
  return s;
}

function savePreds_(b) {
  var id = String(b.id || '');
  var p = ss_().getSheetByName(HOJA_P);
  var vals = p.getDataRange().getValues();
  var row = filaDe_(vals, id);
  if (row < 0) return { ok: false, error: 'Participante no encontrado' };

  /* Verificación de identidad por PIN */
  if (!pinValido_(b.pin)) return { ok: false, error: 'PIN incorrecto' };
  var guardado = vals[row - 1][7];
  if (guardado === '' || guardado == null) {
    p.getRange(row, 8).setValue("'" + String(b.pin)); // reclamo de cuenta antigua
  } else if (!pinIgual_(guardado, b.pin)) {
    return { ok: false, error: 'PIN incorrecto' };
  }

  var prev = {};
  try { prev = JSON.parse(vals[row - 1][6] || '{}'); } catch (_) {}
  var locked = lockedSet_();
  var incoming = b.preds || {};
  var merged = {};
  for (var k in prev) merged[k] = prev[k];

  FIXTURE.forEach(function (f) {
    var key = 'm' + f[0];
    if (locked[key]) return; // partido ya iniciado: se conserva lo anterior
    var v = incoming[key];
    if (v === null) { delete merged[key]; return; }
    if (Object.prototype.toString.call(v) === '[object Array]' && v.length === 2 &&
        v[0] === Math.floor(v[0]) && v[1] === Math.floor(v[1]) &&
        v[0] >= 0 && v[0] <= 15 && v[1] >= 0 && v[1] <= 15) {
      merged[key] = [v[0], v[1]];
    }
  });

  var firmada = b.firmar ? new Date() : (vals[row - 1][4] || '');
  p.getRange(row, 5, 1, 3).setValues([[firmada, new Date(), JSON.stringify(merged)]]);
  detalle_(id, vals[row - 1][1] + ' ' + vals[row - 1][2], merged);

  return {
    ok: true,
    user: {
      id: id,
      nombre: String(vals[row - 1][1]),
      apellido: String(vals[row - 1][2]),
      paid: vals[row - 1][3] === true,
      submittedAt: firmada ? new Date(firmada).getTime() : null,
      preds: merged
    }
  };
}

function detalle_(id, nombreLegible, preds) {
  var d = ss_().getSheetByName(HOJA_D);
  var lastCol = Math.max(4, d.getLastColumn());
  var notas = d.getRange(1, 1, 1, lastCol).getNotes()[0];
  var col = -1;
  for (var c = 4; c < lastCol; c++) {
    if (notas[c] === id) { col = c + 1; break; }
  }
  if (col < 0) {
    col = lastCol + 1;
    d.getRange(1, col).setNote(id).setFontWeight('bold');
  }
  d.getRange(1, col).setValue(nombreLegible);
  var colVals = FIXTURE.map(function (f) {
    var v = preds['m' + f[0]];
    return [v ? v[0] + '-' + v[1] : ''];
  });
  d.getRange(2, col, colVals.length, 1).setValues(colVals);
}


/******************************************************
 * AUTOMATIZACIÓN DE RESULTADOS — football-data.org
 *
 * Cada 30 minutos consulta los partidos TERMINADOS del
 * Mundial y escribe el marcador en la pestaña "resultados"
 * SOLO si las celdas de goles están vacías: lo que tú
 * escribas a mano siempre manda y nunca se sobreescribe.
 *
 * Puesta en marcha (una vez):
 *  1. Consigue tu token gratis en football-data.org
 *  2. Guárdalo en Configuración del proyecto ⚙ →
 *     Propiedades del script → FD_TOKEN = tu token
 *     (o pégalo abajo en TOKEN_RESPALDO)
 *  3. Ejecuta una vez: activarAutomatizacion
 *
 * Seguimiento: pestaña "automatizacion" (estado y bitácora).
 * Para apagarla: ejecuta desactivarAutomatizacion.
 ******************************************************/

var HOJA_A = 'automatizacion';
var TOKEN_RESPALDO = ''; // ← alternativa simple: pega tu token entre las comillas

var FD_BASE = 'https://api.football-data.org/v4/competitions/WC/matches';

/* Nombres en inglés que usa la API → código del fixture */
var NOMBRES_API = {
  'mexico':'MEX','south africa':'RSA','korea republic':'KOR','south korea':'KOR',
  'czechia':'CZE','czech republic':'CZE',
  'canada':'CAN','bosnia and herzegovina':'BIH','bosnia herzegovina':'BIH','qatar':'QAT','switzerland':'SUI',
  'brazil':'BRA','morocco':'MAR','haiti':'HAI','scotland':'SCO',
  'united states':'USA','usa':'USA','paraguay':'PAR','australia':'AUS','turkey':'TUR','turkiye':'TUR',
  'germany':'GER','curacao':'CUW','ivory coast':'CIV','cote d ivoire':'CIV','ecuador':'ECU',
  'netherlands':'NED','japan':'JPN','sweden':'SWE','tunisia':'TUN',
  'belgium':'BEL','egypt':'EGY','iran':'IRN','ir iran':'IRN','new zealand':'NZL',
  'spain':'ESP','cape verde':'CPV','cabo verde':'CPV','saudi arabia':'KSA','uruguay':'URU',
  'france':'FRA','senegal':'SEN','iraq':'IRQ','norway':'NOR',
  'argentina':'ARG','algeria':'ALG','austria':'AUT','jordan':'JOR',
  'portugal':'POR','dr congo':'COD','congo dr':'COD','democratic republic of the congo':'COD',
  'uzbekistan':'UZB','colombia':'COL',
  'england':'ENG','croatia':'CRO','ghana':'GHA','panama':'PAN'
};

var CODIGOS_FIXTURE = (function () {
  var s = {};
  FIXTURE.forEach(function (f) { s[f[2]] = true; s[f[3]] = true; });
  return s;
})();

/* ---------- Activar / desactivar ---------- */

function activarAutomatizacion() {
  desactivarAutomatizacion();
  ScriptApp.newTrigger('actualizarResultados').timeBased().everyMinutes(30).create();
  actualizarResultados(); // primera pasada inmediata para que veas el estado
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('Activada: cada 30 min. Revisa la pestaña "automatizacion".', 'Resultados automáticos');
}

function desactivarAutomatizacion() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'actualizarResultados') ScriptApp.deleteTrigger(t);
  });
}

/* ---------- Ciclo principal ---------- */

function actualizarResultados() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    ensure_();
    ensureAuto_();

    var token = PropertiesService.getScriptProperties().getProperty('FD_TOKEN') || TOKEN_RESPALDO;
    if (!token) {
      marcaRevision_('⚠ Falta el token. Agrégalo en Configuración del proyecto → Propiedades del script (FD_TOKEN).');
      return;
    }

    var resp = fdFetch_(FD_BASE + '?season=2026&status=FINISHED', token);
    if (resp.code === 400) resp = fdFetch_(FD_BASE + '?status=FINISHED', token); // por si el filtro de temporada no aplica
    if (resp.code === 429) { marcaRevision_('La API pidió esperar (límite de consultas). Se reintenta en el próximo ciclo.'); return; }
    if (resp.code === 403 || resp.code === 401) { logAuto_('Token rechazado por la API (HTTP ' + resp.code + '). Revisa FD_TOKEN.', true); return; }
    if (resp.code !== 200) { logAuto_('Error de la API (HTTP ' + resp.code + ').', true); return; }

    var partidos = (JSON.parse(resp.body).matches) || [];

    /* Mapa par de equipos → fila de la pestaña resultados */
    var hoja = ss_().getSheetByName(HOJA_R);
    var vals = hoja.getDataRange().getValues();
    var porPar = {};
    for (var i = 1; i < vals.length; i++) {
      if (vals[i][0] === '') continue;
      porPar[vals[i][2] + '|' + vals[i][3]] = {
        fila: i + 1,
        inicio: new Date(vals[i][4]).getTime(),
        gl: vals[i][5],
        gv: vals[i][6]
      };
    }

    var escritos = [], sinCalce = [], respetados = 0;

    partidos.forEach(function (m) {
      if (!m || m.status !== 'FINISHED') return;
      var h = codigoEquipo_(m.homeTeam), a = codigoEquipo_(m.awayTeam);
      if (!h || !a) {
        sinCalce.push(((m.homeTeam && m.homeTeam.name) || '?') + ' vs ' + ((m.awayTeam && m.awayTeam.name) || '?'));
        return;
      }
      var r = porPar[h + '|' + a];
      if (!r) return; // no es un partido de la fase de grupos del fixture
      /* Guardia de fecha: el mismo par podría repetirse en eliminatorias */
      if (Math.abs(new Date(m.utcDate).getTime() - r.inicio) > 2 * 24 * 3600 * 1000) return;
      /* Respeto absoluto a lo manual: si hay CUALQUIER dato, no se toca */
      if (r.gl !== '' || r.gv !== '') { respetados++; return; }
      var ft = m.score && m.score.fullTime;
      if (!ft || ft.home == null || ft.away == null) return;
      hoja.getRange(r.fila, 6, 1, 2).setValues([[ft.home, ft.away]]);
      escritos.push(h + ' ' + ft.home + '–' + ft.away + ' ' + a);
    });

    var msg = escritos.length
      ? 'Cargó ' + escritos.length + ' resultado(s): ' + escritos.join(' · ')
      : 'Sin partidos nuevos por cargar.';
    if (respetados) msg += ' · ' + respetados + ' ya tenían marcador (no se tocan).';
    marcaRevision_(msg);
    if (escritos.length) logAuto_(msg, false);
    if (sinCalce.length) logAuto_('Equipos sin calce con el fixture: ' + sinCalce.join(' · '), true);

  } catch (err) {
    try { logAuto_('Error: ' + String(err), true); } catch (_) {}
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ---------- Apoyo ---------- */

function fdFetch_(url, token) {
  var r = UrlFetchApp.fetch(url, {
    headers: { 'X-Auth-Token': token },
    muteHttpExceptions: true
  });
  return { code: r.getResponseCode(), body: r.getContentText() };
}

function norm_(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]+/g, ' ').replace(/^ +| +$/g, '');
}

function codigoEquipo_(team) {
  if (!team) return null;
  var tla = String(team.tla || '').toUpperCase();
  if (CODIGOS_FIXTURE[tla]) return tla;
  var porNombre = NOMBRES_API[norm_(team.name)];
  if (porNombre) return porNombre;
  var porCorto = NOMBRES_API[norm_(team.shortName)];
  if (porCorto) return porCorto;
  return null;
}

function ensureAuto_() {
  var ss = ss_();
  var a = ss.getSheetByName(HOJA_A);
  if (!a) a = ss.insertSheet(HOJA_A);
  if (String(a.getRange(1, 1).getValue()) === '') {
    a.getRange(1, 1, 1, 2).setValues([['ÚLTIMA REVISIÓN', 'ESTADO']]).setFontWeight('bold');
    a.getRange(4, 1).setValue('BITÁCORA (solo eventos: cargas, avisos y errores)').setFontWeight('bold');
    a.setColumnWidth(2, 560);
    a.setFrozenRows(1);
  }
  return a;
}

function marcaRevision_(msg) {
  var a = ensureAuto_();
  a.getRange(2, 1).setValue(new Date());
  a.getRange(2, 2).setValue(msg);
}

function logAuto_(msg, esError) {
  var a = ensureAuto_();
  a.appendRow([new Date(), (esError ? '⚠ ' : '✓ ') + msg]);
  var ultima = a.getLastRow();
  if (ultima > 240) a.deleteRows(5, ultima - 240); // bitácora acotada
}
