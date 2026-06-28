/* Pruebas rápidas de lógica y vistas (node scripts/smoke.mjs). */
import { M, GROUPS, T, TOTAL, tienePendiente } from "../public/js/datos.js";
import { pts, restante, predsCount, esc, clp, completa, esEmpatePred } from "../public/js/util.js";
import { S } from "../public/js/estado.js";
import { vInicio, vPred, vTabla, cuerpoCorreo } from "../public/js/vistas.js";

let fallos = 0;
const ok = (cond, nombre) => { if (!cond) { fallos++; console.error("✗", nombre); } else console.log("✓", nombre); };

ok(M.length === 16 && TOTAL === 16, "fixture: 16 dieciseisavos");
ok(GROUPS.length === 1 && Object.keys(T).length === 49, "1 ronda · 48 selecciones + TBD");
ok(M.filter(tienePendiente).length === 6, "6 cruces con rival por definir (TBD)");

/* Puntaje básico (sin penales) */
const casos = [
  [[2,1],[2,1],3], [[3,2],[2,1],2], [[1,1],[2,2],2], [[2,0],[1,0],1],
  [[1,0],[0,1],0], [[0,0],[1,0],0], [null,[1,0],null], [[1,0],null,null]
];
ok(casos.every(([p,r,e]) => pts(p,r) === e), "puntaje base: 8/8 casos");

/* Puntaje con bonus de penales */
ok(pts([1,1,"h"],[1,1,"h"]) === 4, "empate + clasificado correcto = 3+1 = 4");
ok(pts([1,1,"h"],[1,1,"a"]) === 3, "empate exacto pero penal errado = 3");
ok(pts([0,0,"a"],[2,2,"a"]) === 3, "empate por diferencia + penal ok = 2+1 = 3");
ok(pts([1,1],[1,1]) === 3, "empate sin elegir clasificado = 3 (sin bonus)");
ok(pts([2,1,"h"],[2,1]) === 3, "no empate ignora el clasificado");

/* Completitud: empate exige clasificado */
ok(completa([2,1]) === true, "marcador no-empate está completo sin clasificado");
ok(completa([1,1]) === false, "empate sin clasificado está incompleto");
ok(completa([1,1,"h"]) === true, "empate con clasificado está completo");
ok(esEmpatePred([0,0]) === true && esEmpatePred([1,0]) === false, "detecta empate en predicción");

ok(restante(2*24*3600e3 + 3*3600e3) === "2 d 3 h" && restante(12*60e3) === "12 m", "cuenta regresiva formatea");
ok(esc('<b>"x"&\'') === "&lt;b&gt;&quot;x&quot;&amp;&#39;", "escape HTML");
ok(clp(10000).startsWith("$"), "formato CLP");

S.users = [
  { id:"a", nombre:"Franco", apellido:"Carranza", paid:true,  submittedAt:Date.now(), preds:{ m73:[2,1], m74:[1,1,"h"] } },
  { id:"b", nombre:"Marcelo", apellido:"Soto",    paid:false, submittedAt:null,       preds:{ m73:[1,0] } }
];
S.results = { m73:[2,1], m74:[1,1,"h"] };
S.meId = "a"; S.preds = JSON.parse(JSON.stringify(S.users[0].preds)); S.cargando = false;

const i = vInicio(), p = vPred(), t = vTabla();
ok(i.includes("Jugadores") && i.includes("Franco") && i.includes("PIN"), "vInicio: jugadores y PIN");
ok(i.includes("dieciseisavos") && i.includes("penales"), "reglas mencionan dieciseisavos y penales");
ok(i.includes("pozo completo") || i.includes("Pozo") || i.includes("ganador"), "pozo íntegro mencionado");
S.registrando = true;
ok(vInicio().includes("Inventa un PIN"), "inscripción pide crear PIN");
S.registrando = false; S.pidiendoPin = "a";
ok(vInicio().includes("Ingresa tu PIN"), "vista de ingreso de PIN");
S.pidiendoPin = null;
ok(p.includes("Dieciseisavos") && p.includes("chip-pts"), "vPred renderiza ronda y chips");
ok(p.includes("penales") || p.includes("Empate"), "vPred muestra selector de penales en empate");
ok(t.includes("Pozo") && t.indexOf("Franco") < t.indexOf("Marcelo") && t.includes('pos oro'), "vTabla ordena y premia líder");
ok(t.includes("Pagó") && t.includes("Pendiente"), "sellos de pago presentes");

/* Franco: m73 exacto (3) + m74 empate con penal correcto (4) = 7 pts */
ok(t.includes("7"), "puntaje total con bonus penales correcto (7 pts)");

/* Desempate por firma */
S.users = [
 {id:"x",nombre:"Zoe",apellido:"Zúñiga",paid:true,submittedAt:2000,preds:{m73:[2,1]}},
 {id:"y",nombre:"Ana",apellido:"Ávila",paid:true,submittedAt:1000,preds:{m73:[2,1]}}
];
const t2 = vTabla();
ok(t2.indexOf("Ana") < t2.indexOf("Zoe"), "desempate: firmó primero va arriba");

S.users[0] = { id:"a", nombre:"Franco", apellido:"Carranza", submittedAt:Date.now(), preds:{m73:[2,1],m74:[1,1,"h"]} };
S.meId="a"; S.preds=JSON.parse(JSON.stringify(S.users[0].preds));
ok(predsCount(S.preds) === 2, "conteo de predicciones");
ok(cuerpoCorreo().includes("DIECISEISAVOS") && cuerpoCorreo().includes("pasa"), "respaldo incluye ronda y penales");

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodas las pruebas pasaron ✓");
process.exit(fallos ? 1 : 0);
