/* Selecciones y fixture oficial de la fase de grupos (hora UTC).
   ⚠️ IMPORTANTE: este FIXTURE debe mantenerse idéntico al de
   apps-script/Code.gs (var FIXTURE). Son dos entornos separados
   (navegador y Google Apps Script) y no comparten archivos: si
   cambias un horario o equipo aquí, cámbialo también allá. */
export const T = {
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

export const GROUPS = "ABCDEFGHIJKL".split("");

const FIX = [[1,"A","MEX","RSA","2026-06-11T19:00:00Z"],[2,"A","KOR","CZE","2026-06-12T02:00:00Z"],[3,"B","CAN","BIH","2026-06-12T19:00:00Z"],[4,"D","USA","PAR","2026-06-13T01:00:00Z"],[5,"B","QAT","SUI","2026-06-13T19:00:00Z"],[6,"C","BRA","MAR","2026-06-13T22:00:00Z"],[7,"C","HAI","SCO","2026-06-14T01:00:00Z"],[8,"D","AUS","TUR","2026-06-14T04:00:00Z"],[9,"E","GER","CUW","2026-06-14T17:00:00Z"],[10,"F","NED","JPN","2026-06-14T20:00:00Z"],[11,"E","CIV","ECU","2026-06-14T23:00:00Z"],[12,"F","SWE","TUN","2026-06-15T02:00:00Z"],[13,"H","ESP","CPV","2026-06-15T16:00:00Z"],[14,"G","BEL","EGY","2026-06-15T19:00:00Z"],[15,"H","KSA","URU","2026-06-15T22:00:00Z"],[16,"G","IRN","NZL","2026-06-16T01:00:00Z"],[17,"I","FRA","SEN","2026-06-16T19:00:00Z"],[18,"I","IRQ","NOR","2026-06-16T22:00:00Z"],[19,"J","ARG","ALG","2026-06-17T01:00:00Z"],[20,"J","AUT","JOR","2026-06-17T04:00:00Z"],[21,"K","POR","COD","2026-06-17T17:00:00Z"],[22,"L","ENG","CRO","2026-06-17T20:00:00Z"],[23,"L","GHA","PAN","2026-06-17T23:00:00Z"],[24,"K","UZB","COL","2026-06-18T02:00:00Z"],[25,"A","CZE","RSA","2026-06-18T16:00:00Z"],[26,"B","SUI","BIH","2026-06-18T19:00:00Z"],[27,"B","CAN","QAT","2026-06-18T22:00:00Z"],[28,"A","MEX","KOR","2026-06-19T01:00:00Z"],[29,"D","USA","AUS","2026-06-19T19:00:00Z"],[30,"C","SCO","MAR","2026-06-19T22:00:00Z"],[31,"C","BRA","HAI","2026-06-20T00:30:00Z"],[32,"D","TUR","PAR","2026-06-20T03:00:00Z"],[33,"F","NED","SWE","2026-06-20T17:00:00Z"],[34,"E","GER","CIV","2026-06-20T20:00:00Z"],[35,"E","ECU","CUW","2026-06-21T00:00:00Z"],[36,"F","TUN","JPN","2026-06-21T04:00:00Z"],[37,"H","ESP","KSA","2026-06-21T16:00:00Z"],[38,"G","BEL","IRN","2026-06-21T19:00:00Z"],[39,"H","URU","CPV","2026-06-21T22:00:00Z"],[40,"G","NZL","EGY","2026-06-22T01:00:00Z"],[41,"J","ARG","AUT","2026-06-22T17:00:00Z"],[42,"I","FRA","IRQ","2026-06-22T21:00:00Z"],[43,"I","NOR","SEN","2026-06-23T00:00:00Z"],[44,"J","JOR","ALG","2026-06-23T03:00:00Z"],[45,"K","POR","UZB","2026-06-23T17:00:00Z"],[46,"L","ENG","GHA","2026-06-23T20:00:00Z"],[47,"L","PAN","CRO","2026-06-23T23:00:00Z"],[48,"K","COL","COD","2026-06-24T02:00:00Z"],[49,"B","SUI","CAN","2026-06-24T19:00:00Z"],[50,"B","BIH","QAT","2026-06-24T19:00:00Z"],[51,"C","MAR","HAI","2026-06-24T22:00:00Z"],[52,"C","SCO","BRA","2026-06-24T22:00:00Z"],[53,"A","RSA","KOR","2026-06-25T01:00:00Z"],[54,"A","CZE","MEX","2026-06-25T01:00:00Z"],[55,"E","CUW","CIV","2026-06-25T20:00:00Z"],[56,"E","ECU","GER","2026-06-25T20:00:00Z"],[57,"F","TUN","NED","2026-06-25T23:00:00Z"],[58,"F","JPN","SWE","2026-06-25T23:00:00Z"],[59,"D","TUR","USA","2026-06-26T02:00:00Z"],[60,"D","PAR","AUS","2026-06-26T02:00:00Z"],[61,"I","NOR","FRA","2026-06-26T19:00:00Z"],[62,"I","SEN","IRQ","2026-06-26T19:00:00Z"],[63,"H","CPV","KSA","2026-06-27T00:00:00Z"],[64,"H","URU","ESP","2026-06-27T00:00:00Z"],[65,"G","NZL","BEL","2026-06-27T03:00:00Z"],[66,"G","EGY","IRN","2026-06-27T03:00:00Z"],[67,"L","PAN","ENG","2026-06-27T21:00:00Z"],[68,"L","CRO","GHA","2026-06-27T21:00:00Z"],[69,"K","COL","POR","2026-06-27T23:30:00Z"],[70,"K","COD","UZB","2026-06-27T23:30:00Z"],[71,"J","ALG","AUT","2026-06-28T02:00:00Z"],[72,"J","JOR","ARG","2026-06-28T02:00:00Z"]];

export const M = FIX.map((f) => ({ id: "m" + f[0], n: f[0], g: f[1], h: f[2], a: f[3], utc: f[4], ms: new Date(f[4]).getTime() }));
export const matchesOf = (g) => M.filter((m) => m.g === g);

/* Goles máximos por marcador (debe coincidir con la validación del Apps Script). */
export const MAX_GOLES = 15;
