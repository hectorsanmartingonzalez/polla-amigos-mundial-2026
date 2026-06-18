/* Pruebas rápidas de lógica y vistas (node scripts/smoke.mjs). */
import { M, GROUPS, T } from "../public/js/datos.js";
import { pts, restante, predsCount, esc, clp } from "../public/js/util.js";
import { S } from "../public/js/estado.js";
import { vInicio, vPred, vTabla, cuerpoCorreo } from "../public/js/vistas.js";

let fallos = 0;
const ok = (cond, nombre) => { if (!cond) { fallos++; console.error("✗", nombre); } else console.log("✓", nombre); };

ok(M.length === 72, "fixture: 72 partidos");
ok(GROUPS.length === 12 && Object.keys(T).length === 48, "12 grupos · 48 selecciones");

const casos = [
  [[2,1],[2,1],3], [[3,2],[2,1],2], [[1,1],[2,2],2], [[2,0],[1,0],1],
  [[1,0],[0,1],0], [[0,0],[1,0],0], [null,[1,0],null], [[1,0],null,null]
];
ok(casos.every(([p,r,e]) => pts(p,r) === e), "puntaje: 8/8 casos (3·2·1·0·null)");

ok(restante(2*24*3600e3 + 3*3600e3) === "2 d 3 h" && restante(3*3600e3 + 12*60e3) === "3 h 12 m"
   && restante(12*60e3) === "12 m" && restante(30e3) === "<1 m", "cuenta regresiva formatea bien");

ok(esc('<b>"x"&\'') === "&lt;b&gt;&quot;x&quot;&amp;&#39;", "escape HTML");
ok(clp(10000).includes("10") && clp(10000).startsWith("$"), "formato CLP");

S.users = [
  { id:"a", nombre:"Franco", apellido:"Carranza", paid:true,  submittedAt:Date.now(), preds:{ m1:[2,1], m2:[1,1] } },
  { id:"b", nombre:"Marcelo", apellido:"Soto",    paid:false, submittedAt:null,       preds:{ m1:[1,0] } }
];
S.results = { m1:[2,1] };
S.meId = "a"; S.preds = JSON.parse(JSON.stringify(S.users[0].preds)); S.cargando = false;

const i = vInicio(), p = vPred(), t = vTabla();
ok(i.includes("Jugadores") && i.includes("Franco") && i.includes("PIN"), "vInicio renderiza lista de jugadores y PIN");
ok(i.includes("La cuota") && i.includes("confirmó primero"), "bloque de cuota y regla de desempate visibles");
S.registrando = true;
ok(vInicio().includes("Inventa un PIN"), "inscripción pide crear PIN");
S.registrando = false; S.pidiendoPin = "a";
ok(vInicio().includes("Ingresa tu PIN"), "vista de ingreso de PIN");
S.pidiendoPin = null;
ok(p.includes("Grupo A") && p.includes("Confirmadas") && p.includes("chip-pts p3"), "vPred renderiza con chips de puntaje");
ok(t.includes("Pozo") && t.indexOf("Franco") < t.indexOf("Marcelo") && t.includes('pos oro'), "vTabla ordena y premia al líder");
ok(t.includes("Pagó") && t.includes("Pendiente"), "sellos de pago presentes");
ok(t.includes("confirmadas") && t.includes("sin confirmar"), "tabla muestra estado de predicciones");
/* desempate por firma: mismo puntaje, gana quien firmó antes */
const usersOriginales = S.users;
S.users = [
 {id:"x",nombre:"Zoe",apellido:"Zúñiga",paid:true,submittedAt:2000,preds:{m1:[2,1]}},
 {id:"y",nombre:"Ana",apellido:"Ávila",paid:true,submittedAt:1000,preds:{m1:[2,1]}}
];
const t2 = vTabla();
ok(t2.indexOf("Ana") < t2.indexOf("Zoe"), "desempate: firmó primero va arriba");
S.users = usersOriginales;
ok(predsCount(S.users[0].preds) === 2, "conteo de predicciones");

const correo = cuerpoCorreo().split("\n");
ok(correo.length === 5 + 12 + 72 + 12 && correo.some(l => l.startsWith("GRUPO L")), "correo de respaldo: 101 líneas");

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodas las pruebas pasaron ✓");
process.exit(fallos ? 1 : 0);
