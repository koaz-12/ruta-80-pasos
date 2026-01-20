# 📱 Protocolo de Comunicación y Estructura de Comunidad (WhatsApp)

> **Proyecto:** La Ruta de los 80 Pasos  
> **Objetivo:** Optimizar el flujo de información, evitar el ruido y asegurar que nada se pierda.

---

## 🏗️ 1. Estructura de la Comunidad

Para mantener el orden, utilizaremos la función **"Comunidades"** de WhatsApp. Todos los grupos estarán bajo la comunidad **"Antigravity Devs"** (o nombre del estudio).

### 🔴 Zona Crítica (Solo Lectura / Alta Importancia)

#### 📢 **R80P - Anuncios Oficiales**
*   **Permisos:** Solo Admins envían mensajes.
*   **Contenido:**
    *   Fechas de entrega (Milestones).
    *   Cambios críticos en el diseño ("Se cancela el modo PvP por ahora").
    *   Avisos de reuniones importantes.
*   **Regla:** Activar notificaciones SIEMPRE.

#### 📦 **R80P - Builds & Versiones**
*   **Permisos:** Todos pueden enviar, pero RESTRINGIDO a archivos/enlaces.
*   **Contenido:**
    *   Archivos `.apk`, `.zip` o enlaces a Vercel/TestFlight.
    *   Changelog BREVE (lista de 3-5 cambios principales).
*   **Formato Obligatorio:**
    > **Versión:** Alpha v0.8.2
    > **Link:** [url]
    > **Notas:** Se arregló el salto.

---

### 🟡 Zona de Desarrollo (El Taller)

#### 🐛 **R80P - Reporte de Bugs**
*   **Propósito:** Base de datos rápida de errores.
*   **Contenido:** Videos cortos, capturas, audios explicando el error.
*   **Regla de Oro:** **NO CHARLAR.** Se reporta, se confirma recibido, se avisa cuando está arreglado.
*   **Flujo:**
    1. Tester envía video del bug.
    2. Dev responde citando el mensaje: "👀 Revisando".
    3. Dev arregla y responde: "✅ Corregido en v0.8.3".

#### 💻 **R80P - Dev & Tech**
*   **Propósito:** Discusión técnica profunda.
*   **Contenido:** "El servidor se cayó", "No entiendo este código", "Necesito acceso al repo".
*   **Audiencia:** Programadores y Técnicos.

---

### 🟢 Zona Creativa (La Pizarra)

#### 🎨 **R80P - Arte & Assets**
*   **Propósito:** Compartir y aprobar recursos visuales/sonoros.
*   **Contenido:** Sprites, bocetos, pruebas de animación, efectos de sonido.
*   **Feedback:** Usar reacciones (👍/👎) para aprobación rápida. Comentarios detallados en texto.

#### 💡 **R80P - Ideas & Diseño**
*   **Propósito:** Lluvia de ideas y mecánicas.
*   **Contenido:** "¿Y si metemos un zombie gigante?", Referencias de otros juegos, cambios en el balance.
*   **Nota:** Aquí es donde vale "soñar". Nada es definitivo hasta que pasa a **Anuncios**.

---

### 🔵 Zona Social (La Cafetería)

#### 💬 **R80P - Chat General**
*   **Propósito:** Todo lo que no encaje en los otros grupos.
*   **Contenido:** Coordinación rápida ("Llego 10 min tarde"), memes, motivación, charla off-topic.

---

## 🏷️ 2. Sistema de Etiquetas (Tags)

Si por urgencia debes escribir en un grupo general o para resaltar algo importante, usa estas etiquetas al inicio del mensaje:

*   `[CRITICO]` 🛑 Algo rompió el juego por completo.
*   `[BUG]` Reporte de error.
*   `[IDEA]` Sugerencia nueva.
*   `[DUDA]` Pregunta que bloquea tu trabajo.
*   `[REF]` Referencia (imagen/video de otro juego).

---

## 🤝 3. Buenas Prácticas y Reglas Generales

1.  **Audios:**
    *   Máximo **1 minuto**. Si es más largo, mejor una llamada o texto.
    *   Si reportas un bug por audio, **acompáñalo de foto/video** siempre que sea posible.

2.  **Citas (Reply):**
    *   Siempre usa "Responder" al mensaje específico del que estás hablando para no perder el hilo.

3.  **Horarios:**
    *   Si envías mensajes de madrugada, usa **"Mensaje silencioso"** si tu colega tiene iPhone, o asume que no responderá hasta la mañana.
    *   Respetar los fines de semana (salvo el grupo de **General** o **Urgencias**).

4.  **Limpieza:**
    *   Si una discusión técnica en **Reporte de Bugs** se alarga más de 5 mensajes, **MUEVANLA** a **Dev & Tech**. Mantengan el canal de bugs limpio.

---

## 🔄 4. Flujo de Trabajo Recomendado

**Escenario A: Encuentro un Bug**
1. Grabo pantalla o tomo captura.
2. Lo envío a **🐛 Reporte de Bugs**.
3. Texto: "Al saltar en la esquina X, el personaje se traba."

**Escenario B: Tengo una idea genial**
1. La escribo en **💡 Ideas & Diseño**.
2. Colegas discuten y refinan.
3. Si se aprueba, Líder de Proyecto lo pasa al documento de tareas y avisa en **📢 Anuncios** si es un cambio grande.

**Escenario C: Terminé una nueva versión**
1. Subo el build a la nube.
2. Pego el link en **📦 Builds & Versiones**.
3. Aviso en **💬 Chat General**: "Ya está la nueva versión chicos, prueben el nivel 2."
