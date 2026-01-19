# Game Design Document (GDD)
# Proyecto: La Ruta de los 80 Pasos

## 1. Ficha Técnica
*   **Título:** La Ruta de los 80 Pasos
*   **Género:** Juego de Mesa Digital / Supervivencia / RPG por Turnos
*   **Plataforma:** Web (Navegador Desktop/Móvil)
*   **Público Objetivo:** Jugadores casuales y mid-core que disfrutan de juegos de mesa y estrategia ligera.
*   **Motor/Tecnología:** HTML5, CSS3, Vanilla JavaScript (Sin motor externo).

## 2. Visión del Juego (High Concept)
Un juego de mesa digital post-apocalíptico donde los jugadores compiten por ser el primero en llegar al refugio (Casilla 80). No es solo una carrera; es una lucha por la supervivencia donde el hambre, los zombis y otros jugadores intentarán detenerte.

## 3. Jugabilidad (Gameplay)

### 3.1 Objetivo Principal
Llegar vivo a la **Casilla 80** con al menos 1 Punto de Vida.

### 3.2 Mecánicas Principales (Core Loop)
1.  **Inicio de Turno:** Consumir 1 Ración de Comida (o perder 1 Vida si no hay comida).
2.  **Movimiento:** Tirar dados para avanzar por el tablero.
3.  **Evento de Casilla:** Resolver lo que ocurra en la casilla de destino:
    *   **Combate:** Luchar contra Zombis o Bandidos.
    *   **Evento:** Robar una carta de evento o suerte.
    *   **PvP:** Si caes con otro jugador, combatir.
    *   **Loot:** Encontrar recursos.
4.  **Fin de Turno:** Pasar el control al siguiente jugador.

### 3.3 Sistemas de Juego
*   **Sistema de Hambre:** Recurso constante que disminuye cada turno. Obliga a buscar suministros.
*   **Sistema de Combate:** Basado en tiradas de dados (Jugador vs IA / Jugador vs Jugador). Comparación de resultados + modificadores de armas.
*   **Muerte y Respawn:** Perder toda la vida implica soltar el inventario y reaparecer en el último punto de control (Checkpoint) con penalización.

## 4. Personajes (Clases)
*   **Curandero:** +Vida máxima. Resistente.
*   **Combatiente:** Empieza con arma. Ofensivo.
*   **Negociante:** Habilidades de comercio/recursos.
*   **Escudero:** +Defensa inicial.
*   **Comerciante:** +Comida inicial.

## 5. Mundo y Niveles
El mapa es una ruta lineal con bifurcaciones, dividida en 3 zonas de dificultad creciente:
*   **Zona 1 (1-30):** "El Despertar". Recursos abundantes, enemigos débiles.
*   **Zona 2 (31-60):** "Zona de Conflicto". Escasez, bifurcaciones de camino, bandidos.
*   **Zona 3 (61-80):** "El Infierno". Hordas de zombis, jefes, supervivencia extrema.

## 6. Interfaz (UI/UX)
*   **Tablero:** Vista isométrica o cenital del camino.
*   **HUD:** Panel de jugador con Vida, Comida, Inventario y Dados.
*   **Feedback:** Animaciones de movimiento, pop-ups de cartas y combate.

## 7. Música y Sonido
*   **BGM:** Ambiente tenso, post-apocalíptico. Cambia según la zona.
*   **SFX:** Pasos, tirada de dados, golpes, gruñidos de zombis, comer.
