# Puesta en marcha — Polla Amigos · Mundial 2026

**Solo la hace el administrador, una vez, ~15 minutos.** Tus amigos no instalan ni crean cuentas: solo abren el link.

Arquitectura: una **planilla de Google** es la base de datos (las predicciones llegan solas; tú anotas resultados y pagos ahí mismo). Este repositorio en **GitHub** alimenta un **sitio estático en Render** que se redespliega solo con cada cambio.

---

## Parte A — Planilla y API (Google)

1. Entra a `sheets.new` con tu cuenta Google y nombra la planilla **Polla Amigos 2026**.
2. Menú **Extensiones → Apps Script**. Borra el contenido de `Código.gs` y pega completo el archivo **`apps-script/Code.gs`** de este repo. Guarda (💾).
3. En la barra superior selecciona la función **configurar** y pulsa **▶ Ejecutar**. Autoriza: *Revisar permisos* → tu cuenta → **Avanzado** → *Ir a … (no seguro)* → **Permitir** (el aviso es estándar: es tu propio script sobre tu propia planilla).
4. Verifica en la planilla que aparecieron las pestañas **participantes**, **resultados** y **detalle**, con los 16 cruces de dieciseisavos cargados.
5. Botón azul **Implementar → Nueva implementación** → ⚙ tipo **Aplicación web** → *Ejecutar como:* **Yo** → *Quién tiene acceso:* **Cualquier persona** → **Implementar**.
6. **Copia la URL** de la aplicación web (termina en `/exec`).

## Parte B — Repositorio en GitHub

7. En GitHub: **New repository** → nómbralo `polla-amigos-mundial-2026` (público o privado, da igual) → créalo.
8. Sube el contenido de este proyecto. Dos caminos:
   - **Sin terminal:** en el repo vacío, *uploading an existing file* → arrastra TODAS las carpetas y archivos del proyecto → *Commit changes*.
   - **Con git:**
     ```bash
     git init && git add . && git commit -m "Polla Amigos Mundial 2026"
     git branch -M main
     git remote add origin https://github.com/TU-USUARIO/polla-amigos-mundial-2026.git
     git push -u origin main
     ```
9. Conecta la API: abre **`public/js/config.js`** en GitHub (lápiz ✏ para editar) y en `API_URL` pega tu URL `/exec`. Aprovecha de revisar `CUOTA` y `ADMIN_NOMBRE`. Haz *Commit*.

## Parte C — Despliegue en Render

10. En [dashboard.render.com](https://dashboard.render.com): **New + → Blueprint** → conecta tu cuenta de GitHub si te lo pide → elige el repositorio. Render lee `render.yaml` y crea el **Static Site** solo. → **Apply**.
    - *Alternativa manual:* **New + → Static Site** → repo → *Build Command* vacío → *Publish Directory* = `public`.
11. Al terminar tendrás una URL tipo `https://polla-amigos-mundial-2026.onrender.com`. En *Settings* puedes cambiar el nombre del sitio.
12. **Opcional (link bonito en WhatsApp):** edita `public/index.html` en GitHub y en la línea `og:image` reemplaza el dominio de ejemplo por tu dominio real de Render. Render redespliega solo.
13. Comparte el link al grupo. ¡Listo!

## Parte D — Prueba rápida (2 min)

14. Abre el link, inscríbete, predice el Grupo A y toca **Guardar avance**.
15. Revisa la planilla: tu fila en *participantes* y tu columna en *detalle*. Si aparecen, todo quedó conectado. 🎉

---

## Operación diaria (tu panel es la planilla)

- **Resultados:** pestaña *resultados*, llena `goles_local` y `goles_visita` (celdas amarillas). **Si un partido termina empatado y se define por penales**, escribe en la columna `pasa_penales` una `h` si avanzó el equipo LOCAL o una `a` si avanzó el VISITA (así se otorga el punto extra a quienes lo acertaron). La tabla del sitio se recalcula sola y se refresca cada minuto.
- **Pagos:** pestaña *participantes*, marca el **checkbox `pagado`**. El pozo y los sellos *Pagó* se actualizan al instante.
- **detalle:** matriz legible con todas las predicciones (una columna por participante) — ideal para auditar.
- **PIN olvidado:** cada participante tiene su PIN visible para ti en la columna `pin`; puedes dárselo o cambiarlo.
- **Eliminar a alguien:** borra su fila en *participantes* (y su columna en *detalle* si quieres limpiar).

## ⚠️ Si después modificas `Code.gs`

NO crees una implementación nueva (cambiaría la URL y el sitio quedaría desconectado). Usa: **Implementar → Administrar implementaciones → ✏ → Versión: "Nueva versión" → Implementar**. Así la URL `/exec` se mantiene.

## ⚠️ Si modificas el fixture

El calendario de los 16 cruces vive en DOS lugares que deben quedar idénticos: `public/js/datos.js` (const `FIX`) y `apps-script/Code.gs` (var `FIXTURE`). Son entornos separados y no comparten archivos: si cambias un horario o equipo en uno, cámbialo también en el otro. Los 6 cruces marcados como `TBD` ("Por definir") esperan que se confirmen los rivales (terceros lugares y disyuntivas): cuando se sepan, reemplaza el código `TBD` por el del equipo real en ambos archivos.

## Notas

- **Cierre por partido:** cada partido se bloquea a su hora de inicio y el servidor lo valida — no se aceptan cambios tardíos aunque alguien manipule el reloj del teléfono.
- **PIN por jugador:** cada quien protege sus predicciones con un PIN de 4 dígitos. Sin el PIN, nadie más puede tocar la jugada de otro.
- El botón **Compartir por WhatsApp** y **Copiar** quedan disponibles tras confirmar, por si quieren respaldo además de la planilla.
- Cambios futuros (textos, estilos, reglas): edita en GitHub → Render redespliega solo en ~1 minuto.

---

## Automatización de resultados (opcional)

El `Code.gs` incluye un módulo que consulta **football-data.org** cada 30 minutos y carga solo los marcadores de partidos **terminados**, sin pisar jamás lo que escribas a mano. Para activarlo: consigue tu token gratis en football-data.org, guárdalo en *Configuración del proyecto ⚙ → Propiedades del script* como `FD_TOKEN`, y ejecuta una vez la función `activarAutomatizacion`. El seguimiento queda en la pestaña *automatizacion* de la planilla. Para apagarla: `desactivarAutomatizacion`.
