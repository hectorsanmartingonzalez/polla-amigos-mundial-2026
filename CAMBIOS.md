# Historial de cambios — Polla Amigos

## v2.1 — Inicio explicativo + pulido de accesibilidad

- Pantalla de Inicio rediseñada como onboarding: hero de bienvenida, pasos 1·2·3, mini-demo visual de cómo se predice, regla de penales destacada y reglas en tarjetas con íconos.
- Selector de penales: cuando el empate aún no tiene clasificado elegido, el bloque se resalta y dice "elige uno".
- Accesibilidad: aria-current en pestañas, role="progressbar" en la barra, aria-pressed y role="group" en penales, aria-labels descriptivos en los steppers (con nombre de equipo), banderas marcadas como decorativas.
- Todas las animaciones respetan prefers-reduced-motion.

## v2.0 — Fase eliminatoria: Dieciseisavos de final

- La app pasa de fase de grupos (72 partidos) a DIECISEISAVOS (16 cruces).
- Predicción de marcador exacto 3/2/1, igual que antes.
- NUEVO: si predices empate, eliges quién avanza en penales → +1 punto extra si aciertas.
- Pozo ÍNTEGRO para el ganador (ya no se divide en premio + fiesta).
- Borrón y cuenta nueva: nadie arrastra puntos de la fase de grupos.
- Horarios convertidos a hora de Chile (UTC-4); 6 cruces quedan "Por definir" hasta que se confirmen los rivales.
- Backend: nueva columna "pasa_penales (h/a)" en la pestaña resultados.
- Desempate: exactos → diferencias → aciertos de penales → quien confirmó primero.

## v1.1 — Rediseño minimalista + mejoras

- Nueva paleta minimalista premium: índigo · violeta (reemplaza magenta-naranja-ámbar).
- Color usado con más restricción; íconos, og.png, favicon y splash regenerados.
- Cold start de Render: aviso "Despertando la cancha…" si la primera carga tarda.
- Onboarding del PIN más claro (qué poner, no usar clave del banco).
- Recordatorio accionable de predicciones pendientes en la pestaña Predicción.
- Estado vacío de la tabla más cálido.

## v1.0 — Versión inicial

Adaptación de "Polla Judicial Mundial 2026" a **Polla Amigos**: una polla entre amigos con estética propia, limpia y festiva, manteniendo intacta la lógica de juego (puntaje, fixture, PIN, planilla de Google como backend).

### Identidad y estética
- Nueva identidad de marca: balón-firma (aro de gradiente con estrella central), gradiente magenta–naranja–ámbar, grano sutil de fondo.
- Tema **claro y luminoso** (fondo blanco cálido, tarjetas blancas con sombras suaves), dejando atrás el tema oscuro y todo el lenguaje judicial.
- Se quitaron los datos bancarios de la app: la cuota ($15.000) solo se indica para coordinar con el administrador.
- Íconos PWA, favicon y `og.png` regenerados con la marca.

### Animación y UX
- **Splash** de carga con la marca (balón girando + puntos saltando).
- **Cabecera colapsable** al hacer scroll (estilo app nativa).
- **Stepper de marcador** rediseñado: cápsulas de gradiente, microinteracciones, feedback háptico y salto del dígito al cambiar.
- **Transiciones deslizadas** entre pestañas y entre grupos.
- **Confeti** al confirmar las predicciones (reemplaza el antiguo "timbre").
- **Tabla en vivo**: tu posición destacada y fijada (sticky) al hacer scroll; medallas de podio con brillo; conteo animado del pozo (solo al entrar, no en cada refresco).
- Spinner en botones ocupados; chip de puntos con aparición animada.
- Curvas de movimiento equilibradas (elegante + leve overshoot). Todo respeta `prefers-reduced-motion`.

### Lógica, robustez y optimización
- Aviso `beforeunload` si cierras con cambios sin guardar.
- Reloj sincronizado con el servidor: el cierre de partidos no depende del reloj del teléfono.
- Timestamps del fixture precalculados (`m.ms`) en lugar de recrear fechas en cada render.
- Constante única `MAX_GOLES` compartida (validación coherente cliente/servidor).
- Estados separados: `verificando` (login) vs. `guardando` (predicciones).
- Re-render de cuentas regresivas cada 30 s solo si hay un cierre dentro de 24 h.
- Confeti optimizado (80 nodos vía `DocumentFragment`) y cartel de celebración accesible (`role="status"`).
- Variables CSS muertas eliminadas; comentarios de sincronía del fixture añadidos en `datos.js` y `Code.gs`.

### Pruebas
- `scripts/smoke.mjs` cubre puntaje (8 casos), fixture (72 partidos / 12 grupos / 48 selecciones), formato, escape HTML, y render de las tres vistas con desempates. Todas pasan.
