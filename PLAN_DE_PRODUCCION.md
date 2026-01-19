# Plan de Producción (Roadmap)
# Proyecto: La Ruta de los 80 Pasos

Este documento detalla las fases de desarrollo, hitos y estimación de tiempos para completar el proyecto.
*Nota: Tiempos estimados basados en un equipo pequeño o desarrollador indie.*

## Fases del Proyecto

### 1. Pre-Producción (✅ Completado)
**Duración:** 1-2 Semanas
*   [x] Definición del concepto (GDD).
*   [x] Diseño de mapa y rutas.
*   [x] Definición de clases y reglas básicas.
*   [x] Setup del proyecto (HTML/JS/CSS).

### 2. Prototipo / Vertical Slice (✅ Completado)
**Duración:** 2-3 Semanas
*   [x] Renderizado del tablero.
*   [x] Movimiento básico de fichas.
*   [x] Sistema de turnos simple.
*   [x] Mecánica de dados básica.

### 3. Producción - Fase Alpha (🚧 En Progreso)
**Estado Actual:** Desarrollo de sistemas core y contenido.
**Duración Estimada:** 4-6 Semanas

#### Hitos Alpha:
*   **Sistemas Core (80% Completado)**
    *   [x] Sistema de combate (PvE).
    *   [x] Sistema de eventos de casillas.
    *   [x] Gestión de inventario básico (Comida/Armas).
    *   [ ] Habilidades especiales de clase (Falta integrar 100%).
*   **Contenido (50% Completado)**
    *   [x] Datos de Zombis (niveles básicos).
    *   [ ] Implementación total de las 80 casillas con eventos únicos.
    *   [ ] Integración de todas las Cartas de Evento y Suerte.
*   **UI/UX (60% Completado)**
    *   [x] HUD básico.
    *   [ ] Animaciones de combate pulidas.
    *   [ ] Pantallas de Victoria/Derrota.

### 4. Producción - Fase Beta (Próximamente)
**Objetivo:** Feature Complete (Todo el contenido está, falta pulir).
**Duración Estimada:** 3-4 Semanas

#### Tareas Beta:
*   [ ] **Equilibrio (Balancing):** Ajustar daño de enemigos, frecuencia de loot y consumo de hambre.
*   [ ] **Multijugador/Red:** Pulir la sincronización si hay juego online o "Hotseat" local.
*   [ ] **Feedback Visual:** Efectos de partículas, sonidos, feedback de daño.
*   [ ] **Tutorial:** Implementar una guía para el primer turno.

### 5. Gold / Polishing (Final)
**Duración Estimada:** 2 Semanas
*   [ ] Bug fixing intensivo.
*   [ ] Optimización de rendimiento (Mobile).
*   [ ] Cross-browser testing.
*   [ ] Lanzamiento v1.0.

---

## Cronograma Estimado (Roadmap)

| Fase | Tarea Principal | Tiempo Estimado | Estado |
| :--- | :--- | :--- | :--- |
| **Paso 1** | Refactor y Limpieza de Código | 3-5 Días | 🔄 En curso |
| **Paso 2** | Completar Contenido (Todas las Cartas/Enemigos) | 1-2 Semanas | ⏳ Pendiente |
| **Paso 3** | Implementar "Mecánicas Futuras" (PvP, Trampas) | 1 Semana | ⏳ Pendiente |
| **Paso 4** | UI Polish & Animaciones | 1 Semana | ⏳ Pendiente |
| **Paso 5** | Testing & Balancing (Jugar muchas partidas) | 1 Semana | ⏳ Pendiente |

## Backlog (Lista de Pendientes Clave)
1.  Implementar la "Mecánica de Hambre Estricta" (Perder turno si comida = 0).
2.  Añadir sistema de "Casillas Azules/Moradas" (Ruleta vs Combate Fijo).
3.  Refinar el Combate PvP (Trigger al caer en misma casilla).
4.  Crear pantalla de "Selección de Personaje" visualmente atractiva.
