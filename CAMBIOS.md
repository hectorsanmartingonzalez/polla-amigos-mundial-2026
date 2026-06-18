# Historial de cambios — Polla Amigos

## v1.0 — Versión final

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
