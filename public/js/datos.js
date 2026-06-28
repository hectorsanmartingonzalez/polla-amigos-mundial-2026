/* Selecciones y fixture de la FASE ELIMINATORIA — Dieciseisavos de final.
   Horas en UTC; la app las muestra en la hora local de cada usuario.
   ⚠️ IMPORTANTE: este FIXTURE debe mantenerse idéntico al de
   apps-script/Code.gs (var FIXTURE). Son dos entornos separados
   (navegador y Google Apps Script) y no comparten archivos: si
   cambias un horario o equipo aquí, cámbialo también allá.

   Equipos "TBD" = Por definir (cruces que dependían de 3ros lugares o
   disyuntivas aún no resueltas). Cuando se confirmen, reemplaza el
   código TBD del partido por el código real del equipo, aquí y en Code.gs. */
export const T = {
  TBD:["Por definir","🏳️"],
  MEX:["México","🇲🇽"], RSA:["Sudáfrica","🇿🇦"], KOR:["Corea del Sur","🇰🇷"], CZE:["R. Checa","🇨🇿"],
  CAN:["Canadá","🇨🇦"], BIH:["Bosnia y H.","🇧🇦"], QAT:["Qatar","🇶🇦"], SUI:["Suiza","🇨🇭"],
  BRA:["Brasil","🇧🇷"], MAR:["Marruecos","🇲🇦"], HAI:["Haití","🇭🇹"], SCO:["Escocia","🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
  USA:["EE. UU.","🇺🇸"], PAR:["Paraguay","🇵🇾"], AUS:["Australia","🇦🇺"], TUR:["Turquía","🇹🇷"],
  GER:["Alemania","🇩🇪"], CUW:["Curazao","🇨🇼"], CIV:["C. de Marfil","🇨🇮"], ECU:["Ecuador","🇪🇨"],
  NED:["P. Bajos","🇳🇱"], JPN:["Japón","🇯🇵"], SWE:["Suecia","🇸🇪"], TUN:["Túnez","🇹🇳"],
  BEL:["Bélgica","🇧🇪"], EGY:["Egipto","🇪🇬"], IRN:["Irán","🇮🇷"], NZL:["N. Zelanda","🇳🇿"],
  ESP:["España","🇪🇸"], CPV:["Cabo Verde","🇨🇻"], KSA:["A. Saudita","🇸🇦"], URU:["Uruguay","🇺🇾"],
  FRA:["Francia","🇫🇷"], SEN:["Senegal","🇸🇳"], IRQ:["Irak","🇮🇶"], NOR:["Noruega","🇳🇴"],
  ARG:["Argentina","🇦🇷"], ALG:["Argelia","🇩🇿"], AUT:["Austria","🇦🇹"], JOR:["Jordania","🇯🇴"],
  POR:["Portugal","🇵🇹"], COD:["RD Congo","🇨🇩"], UZB:["Uzbekistán","🇺🇿"], COL:["Colombia","🇨🇴"],
  ENG:["Inglaterra","🏴󠁧󠁢󠁥󠁮󠁧󠁿"], CRO:["Croacia","🇭🇷"], GHA:["Ghana","🇬🇭"], PAN:["Panamá","🇵🇦"]
};

/* Etiqueta de la ronda actual. Los "grupos" del modelo anterior pasan a
   ser una sola ronda. Mantenemos el nombre GROUPS por compatibilidad de
   la lógica existente, pero ahora contiene una única ronda. */
export const GROUPS = ["16"];
export const RONDA_NOMBRE = "Dieciseisavos de final";

/* Pistas de cada cruce (sub-rótulo opcional bajo el partido). Por número de partido. */
export const PISTAS = {
  73:"2°A vs 2°B", 74:"1°C vs 2°F", 75:"1°E vs 3°D", 76:"1°F vs 2°C",
  77:"2°E vs 2°I", 78:"1°I vs 3°F", 79:"1°A vs 3°E", 80:"1°L vs 3°",
  81:"1°G vs 3°", 82:"1°D vs 3°B", 83:"1°H vs 2°J", 84:"2°K vs 2°L",
  85:"1°B vs 3°", 86:"2°D vs 2°G", 87:"1°J vs 2°H", 88:"1°K vs 3°L"
};

/* [nº, ronda, local, visita, fechaUTC] — Dieciseisavos (16 partidos).
   Convertidos a UTC desde hora de Argentina (UTC-3). */
const FIX = [
  [73,"16","RSA","CAN","2026-06-28T19:00:00Z"],
  [74,"16","BRA","JPN","2026-06-29T17:00:00Z"],
  [75,"16","GER","PAR","2026-06-29T20:30:00Z"],
  [76,"16","NED","MAR","2026-06-30T01:00:00Z"],
  [77,"16","CIV","NOR","2026-06-30T17:00:00Z"],
  [78,"16","FRA","SWE","2026-06-30T21:00:00Z"],
  [79,"16","MEX","ECU","2026-07-01T01:00:00Z"],
  [80,"16","ENG","COD","2026-07-01T16:00:00Z"],
  [81,"16","BEL","SEN","2026-07-01T20:00:00Z"],
  [82,"16","USA","BIH","2026-07-02T00:00:00Z"],
  [83,"16","ESP","AUT","2026-07-02T19:00:00Z"],
  [84,"16","POR","CRO","2026-07-02T23:00:00Z"],
  [85,"16","SUI","ALG","2026-07-03T03:00:00Z"],
  [86,"16","AUS","EGY","2026-07-03T18:00:00Z"],
  [87,"16","ARG","CPV","2026-07-03T22:00:00Z"],
  [88,"16","COL","GHA","2026-07-04T01:30:00Z"]
];

export const M = FIX.map((f) => ({ id: "m" + f[0], n: f[0], g: f[1], h: f[2], a: f[3], utc: f[4], ms: new Date(f[4]).getTime() }));
export const matchesOf = (g) => M.filter((m) => m.g === g);

/* ¿El partido tiene algún equipo aún por definir? */
export const tienePendiente = (m) => m.h === "TBD" || m.a === "TBD";

/* Total de partidos de la ronda (para barras de progreso y contadores). */
export const TOTAL = M.length;

/* Goles máximos por marcador (debe coincidir con la validación del Apps Script). */
export const MAX_GOLES = 15;
