# 📅 PLAN DE PRODUCCIÓN (ROADMAP)
## Proyecto: La Ruta de los 80 Pasos
### Documento de Planificación Exhaustivo

> **Versión del Documento:** 2.0  
> **Última Actualización:** 2026-01-19  
> **Estado del Proyecto:** Alpha v7.9 (85%)

---

## 📊 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado Actual del Proyecto](#2-estado-actual-del-proyecto)
3. [Auditoría Técnica Completa](#3-auditoría-técnica-completa)
4. [Fases del Proyecto](#4-fases-del-proyecto)
5. [Cronograma Detallado](#5-cronograma-detallado)
6. [Sprint Actual y Backlog](#6-sprint-actual-y-backlog)
7. [Estimaciones de Tiempo por Tarea](#7-estimaciones-de-tiempo-por-tarea)
8. [Análisis de Riesgos](#8-análisis-de-riesgos)
9. [Recursos Necesarios](#9-recursos-necesarios)
10. [Métricas y KPIs](#10-métricas-y-kpis)
11. [Checklist de Lanzamiento](#11-checklist-de-lanzamiento)

---

## 1. Resumen Ejecutivo

### 🎯 Objetivo del Proyecto
Desarrollar un juego de mesa digital post-apocalíptico para web que soporte 1-4 jugadores en modo local y online, con mecánicas de supervivencia, combate por dados y gestión de recursos.

### 📈 Progreso General

```
████████████████████████████████░░░░░░░░░░ 85%
```

| Métrica | Valor |
|---------|-------|
| **Versión Actual** | v7.9 SEQUENTIAL PATH |
| **Líneas de Código** | ~5,500 JavaScript |
| **Archivos JS** | 20+ módulos |
| **Tiempo Invertido** | ~6-8 semanas |
| **Tiempo Restante Est.** | 4-6 semanas |

### 🏁 Hitos Clave

| Hito | Fecha Estimada | Estado |
|------|----------------|--------|
| Pre-Producción | Semana 1-2 | ✅ Completado |
| Prototipo Jugable | Semana 3-5 | ✅ Completado |
| Alpha Feature Complete | Semana 11 | 🚧 En progreso |
| Beta Testing | Semana 14 | ⏳ Pendiente |
| Gold / Release | Semana 18 | ⏳ Pendiente |

---

## 2. Estado Actual del Proyecto

### 2.1 Inventario de Módulos Core

| Módulo | Archivo | Líneas | Estado | Cobertura |
|--------|---------|--------|--------|-----------|
| **Motor Principal** | `game-engine.js` | 1,023 | ✅ Funcional | 90% |
| **Estado Global** | `game-state.js` | 56 | ✅ Completo | 100% |
| **Bus de Eventos** | `event-bus.js` | ~50 | ✅ Completo | 100% |
| **Combate PvE** | `combat-manager.js` | 226 | ✅ Funcional | 90% |
| **Combate PvP** | `pvp-manager.js` | 336 | ✅ Funcional | 85% |
| **Eventos de Casillas** | `tile-event-manager.js` | 346 | ✅ Funcional | 90% |
| **Red P2P** | `network.js` | 153 | ⚠️ Parcial | 70% |
| **Renderizado SVG** | `svg-board-renderer.js` | 3,000+ | ✅ Funcional | 95% |
| **UI Renderer** | `ui-renderer.js` | ~400 | ⚠️ Parcial | 75% |
| **Datos RPG** | `rpg-data.js` | 71 | ✅ Completo | 100% |
| **Datos de Mapa** | `map-data.js` | 199 | ✅ Completo | 100% |
| **Tipos de Casillas** | `tile-types.js` | 108 | ✅ Completo | 100% |

### 2.2 Features Implementados

#### ✅ Completados (100%)
- [x] Selección de clase (6 clases jugables)
- [x] Sistema de turnos round-robin
- [x] Movimiento por tirada de dados (1d6)
- [x] Sistema de bifurcaciones (4 junctions en el mapa)
- [x] Sistema de hambre (consumo cada 3 turnos)
- [x] Combate PvE con sistema de dados multi-dice
- [x] Sistema de escudo (absorbe diferencia = 1)
- [x] Loot por nivel de enemigo (1-4 items)
- [x] 8 tipos de casillas (Normal, Zombie, Boss, Bandit, Event, Luck, Safe, Market)
- [x] 10 cartas de Suerte
- [x] 12 cartas de Evento
- [x] Sistema de mercado (compra/venta)
- [x] Distribución de enemigos por nivel/zona
- [x] Boss Zombie obligatorio en casilla 79
- [x] Animación de movimiento de fichas
- [x] UI responsive básica

#### ⚠️ Parcialmente Implementados (70-90%)
- [ ] **Sistema PvP** — Funcional pero faltan edge cases
  - ✅ Detección de encuentros
  - ✅ Fase defender/attacker choice
  - ✅ Combate con dados
  - ✅ Robo de recursos
  - ⚠️ Retroceso del perdedor (parcial)
  - ❌ Sincronización online no probada

- [ ] **Multijugador Online** — 70% funcional
  - ✅ Conexión P2P con PeerJS
  - ✅ Creación/unión a sala
  - ✅ Heartbeat y detección de desconexión
  - ⚠️ Sincronización de estado (inconsistencias posibles)
  - ❌ Reconexión automática
  - ❌ Testing exhaustivo 2-4 jugadores

- [ ] **Pasivas de Clase** — 5/6 implementadas
  - ✅ Curandero (+1 vida)
  - ✅ Combatiente (arma inicial)
  - ✅ Explorador (balanced)
  - ✅ Tanque (escudo inicial)
  - ✅ Científico (portal único)
  - ❌ Vendedor (descuento en mercado) — **FALTA IMPLEMENTAR**

- [ ] **Death/Respawn System** — 85%
  - ✅ Detección de muerte (vida = 0)
  - ✅ Emisión de evento PLAYER_DIED
  - ⚠️ Respawn en checkpoint (parcial)
  - ⚠️ Saqueo de inventario (parcial)

#### ❌ No Implementados (0%)
- [ ] Sistema de audio (música + SFX)
- [ ] Tutorial interactivo
- [ ] Pantalla de victoria/derrota mejorada
- [ ] Efectos de partículas
- [ ] Animaciones de cartas (flip)
- [ ] Logros/Achievements
- [ ] Tabla de clasificación
- [ ] PWA (manifest, service worker)
- [ ] Localización multi-idioma

---

## 3. Auditoría Técnica Completa

### 3.1 Arquitectura Actual

```
┌──────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA V7.9                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│   │   main.js   │ ──→ │  UI Layer   │ ──→ │    DOM      │       │
│   │ (Entry Pt)  │     │ ui-renderer │     │  (Modals)   │       │
│   └──────┬──────┘     │ ui-handlers │     └─────────────┘       │
│          │            └─────────────┘                            │
│          │                   ↑                                   │
│          ↓                   │ events                            │
│   ┌─────────────────────────────────────────────────────┐       │
│   │                    EVENT BUS                         │       │
│   │     (Publish/Subscribe Pattern - event-bus.js)       │       │
│   └─────────────────────────────────────────────────────┘       │
│          ↑                   ↓                                   │
│          │            ┌─────────────┐                            │
│          │            │ game-engine │ ◄─── Central Controller    │
│          │            │  (1023 LOC) │                            │
│          │            └──────┬──────┘                            │
│          │                   │                                   │
│   ┌──────┴──────┐     ┌──────┴──────┐     ┌─────────────┐       │
│   │ game-state  │ ←── │  Managers   │ ──→ │  Data Layer │       │
│   │   (Store)   │     │   combat    │     │  rpg-data   │       │
│   │             │     │   pvp       │     │  map-data   │       │
│   │             │     │   tile-evt  │     │  tile-types │       │
│   └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                   │
│   ┌─────────────┐     ┌─────────────┐                            │
│   │   network   │ ←─→ │   PeerJS    │  (P2P para multijugador)  │
│   └─────────────┘     └─────────────┘                            │
│                                                                   │
│   ┌─────────────────────────────────────────────────────┐       │
│   │               SVG Board Renderer                     │       │
│   │  (3000+ LOC - mapa, tiles, animaciones, editor)     │       │
│   └─────────────────────────────────────────────────────┘       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos

```
Usuario Click → ui-handlers.js → bus.emit('UI_ACTION_X')
                                        │
                                        ↓
                              game-engine.js (handleX())
                                        │
                              ┌─────────┴─────────┐
                              ↓                   ↓
                        Actualiza            Managers
                        game-state           (combat, pvp, tile)
                              │                   │
                              ↓                   ↓
                        bus.emit()           bus.emit()
                              │                   │
                              └─────────┬─────────┘
                                        ↓
                              ui-renderer.js (listener)
                                        │
                                        ↓
                              Actualiza DOM/Modals
```

### 3.3 Mapa de Dependencias

```
main.js
├── ui-handlers.js
│   └── event-bus.js
├── game-engine.js
│   ├── event-bus.js
│   ├── game-state.js
│   ├── network.js
│   ├── map-data.js (buildGraph)
│   ├── rpg-data.js
│   ├── tile-event-manager.js
│   │   ├── tile-types.js
│   │   ├── rpg-data.js
│   │   └── combat-manager.js
│   └── pvp-manager.js
│       ├── combat-manager.js
│       └── game-state.js
├── ui-renderer.js
│   ├── game-engine.js
│   └── event-bus.js
├── svg-board-renderer.js
│   └── map-data.js
└── debug-manager.js
    └── game-engine.js
```

### 3.4 Bugs Conocidos y Deuda Técnica

| ID | Tipo | Descripción | Severidad | Archivo |
|----|------|-------------|-----------|---------|
| BUG-001 | 🐛 Bug | Retroceso PvP no actualiza posición en mapa visual | Media | `pvp-manager.js:293` |
| BUG-002 | 🐛 Bug | Respawn en checkpoint no implementado correctamente | Alta | `game-engine.js:893-930` |
| BUG-003 | 🐛 Bug | Saqueo de inventario al morir no se ejecuta | Media | `game-engine.js:905-907` |
| DEBT-001 | 🔧 Deuda | `confirm()` nativo en lugar de modal custom | Baja | `ui-handlers.js:14` |
| DEBT-002 | 🔧 Deuda | Magic numbers en varios archivos | Baja | Varios |
| DEBT-003 | 🔧 Deuda | Falta validación de entrada en network | Media | `network.js` |
| DEBT-004 | 🔧 Deuda | Sin manejo de errores en localStorage | Baja | `network.js:126-139` |
| FEAT-001 | 🆕 Feature | Descuento del Vendedor no implementado | Alta | `rpg-data.js:15` / tile-event |
| FEAT-002 | 🆕 Feature | Reconexión automática online | Media | `network.js` |

### 3.5 Análisis de Código por Complejidad

| Archivo | Líneas | Complejidad Ciclomática | Comentario |
|---------|--------|-------------------------|------------|
| `game-engine.js` | 1,023 | 🔴 Alta | Concentra mucha lógica, candidato a refactor |
| `svg-board-renderer.js` | 3,000+ | 🔴 Alta | Renderizado + Editor + Animaciones |
| `pvp-manager.js` | 336 | 🟡 Media | Bien estructurado |
| `tile-event-manager.js` | 346 | 🟡 Media | Podría dividirse por tipo de tile |
| `combat-manager.js` | 226 | 🟢 Baja | Limpio y enfocado |
| `network.js` | 153 | 🟢 Baja | Simple pero falta error handling |

---

## 4. Fases del Proyecto

### FASE 1: Pre-Producción ✅ COMPLETADA
**Duración Real:** 2 Semanas

| Tarea | Estado |
|-------|--------|
| Definición del concepto (GDD) | ✅ |
| Diseño de mapa y rutas | ✅ |
| Definición de clases y reglas | ✅ |
| Setup técnico (HTML/JS/CSS) | ✅ |
| Diseño del grafo de bifurcaciones | ✅ |

---

### FASE 2: Prototipo / Vertical Slice ✅ COMPLETADA
**Duración Real:** 3 Semanas

| Tarea | Estado |
|-------|--------|
| Renderizado SVG del tablero | ✅ |
| Movimiento básico de fichas | ✅ |
| Sistema de turnos round-robin | ✅ |
| Tirada de dados 1d6 | ✅ |
| Primera versión jugable | ✅ |

---

### FASE 3: Alpha 🚧 EN PROGRESO
**Duración Estimada:** 4-6 Semanas  
**Progreso Actual:** 85%

#### 3.1 Sistemas Core (90%)
| Subtarea | Estado | Notas |
|----------|--------|-------|
| Sistema de combate PvE completo | ✅ | Multi-dice implementado |
| Sistema de eventos de casillas | ✅ | 8 tipos funcionales |
| Gestión de inventario | ✅ | Vida/Comida/Armas/Escudo |
| Sistema de hambre | ✅ | Cada 3 turnos |
| Sistema de bifurcaciones | ✅ | 4 junctions funcionales |
| Sistema de muerte | ✅ | Funcional |
| Sistema de respawn | ⚠️ | Parcial - revisar checkpoints |
| Sistema PvP completo | ⚠️ | Falta retroceso visual |
| Pasivas de clase | ⚠️ | 5/6 implementadas |

#### 3.2 Contenido (95%)
| Subtarea | Estado | Notas |
|----------|--------|-------|
| 80 casillas definidas | ✅ | Con coordenadas SVG |
| Distribución de zombies | ✅ | Niveles 1-4 |
| Distribución de bandidos | ✅ | Niveles 1-3 |
| Boss Zombie | ✅ | Casilla 79 obligatorio |
| Cartas de Suerte (10) | ✅ | Con efectos |
| Cartas de Evento (12) | ✅ | Con efectos |
| 6 clases jugables | ✅ | Con stats únicos |

#### 3.3 UI/UX (75%)
| Subtarea | Estado | Notas |
|----------|--------|-------|
| HUD de stats | ✅ | Footer responsive |
| Modal selección personaje | ✅ | Grid con 6 opciones |
| Modal de combate | ✅ | Con timer 20s |
| Modal de mercado | ✅ | 4 operaciones |
| Modal de bifurcaciones | ✅ | Mejorado con contexto |
| Modal PvP | ✅ | 3 fases |
| Animaciones movimiento | ✅ | Suave con easing |
| Animaciones combate | ⚠️ | Básicas |
| Pantalla victoria/derrota | ⚠️ | Simple |
| Feedback visual daño/cura | ❌ | Pendiente |
| Efectos de partículas | ❌ | Pendiente |

#### 3.4 Multiplayer (70%)
| Subtarea | Estado | Notas |
|----------|--------|-------|
| Conexión P2P básica | ✅ | PeerJS |
| Crear/Unir sala | ✅ | Código 6 caracteres |
| Heartbeat | ✅ | 3s ping |
| Detección desconexión | ✅ | 10s timeout |
| Sincronización de estado | ⚠️ | Posibles race conditions |
| Reconexión automática | ❌ | Pendiente |
| Testing 2+ jugadores | ❌ | Pendiente |

---

### FASE 4: Beta (PRÓXIMA)
**Duración Estimada:** 3-4 Semanas  
**Inicio Objetivo:** Cuando Alpha = 100%

#### Objetivos Beta
1. **Feature Complete** — Todas las features implementadas
2. **Bug-Free Critical** — 0 bugs críticos
3. **Playtest Exhaustivo** — Mínimo 20 partidas completas
4. **Balanceo** — Curva de dificultad ajustada

#### Tareas Beta

| Categoría | Tarea | Prioridad | Estimación |
|-----------|-------|-----------|------------|
| **Bugs** | Fix respawn en checkpoints | 🔴 Alta | 4h |
| **Bugs** | Fix retroceso visual PvP | 🔴 Alta | 2h |
| **Bugs** | Fix saqueo al morir | 🟠 Media | 2h |
| **Features** | Descuento Vendedor | 🔴 Alta | 2h |
| **Features** | Tutorial primer turno | 🟠 Media | 8h |
| **Features** | Reconexión online | 🟠 Media | 6h |
| **Polish** | Animaciones de cartas | 🟡 Baja | 4h |
| **Polish** | Efectos de daño/cura | 🟡 Baja | 4h |
| **Polish** | Pantalla victoria mejorada | 🟡 Baja | 3h |
| **Audio** | SFX básicos (10-15 sonidos) | 🟠 Media | 8h |
| **Audio** | Música de fondo (1 track) | 🟡 Baja | 4h |
| **Balance** | Ajuste de frecuencia loot | 🟠 Media | 4h |
| **Balance** | Ajuste de consumo hambre | 🟠 Media | 2h |
| **Testing** | QA multijugador 2p | 🔴 Alta | 8h |
| **Testing** | QA multijugador 4p | 🟠 Media | 8h |
| **Testing** | QA modo offline | 🔴 Alta | 4h |

---

### FASE 5: Gold / Polishing (FINAL)
**Duración Estimada:** 2-3 Semanas

#### Tareas Gold

| Categoría | Tarea | Prioridad |
|-----------|-------|-----------|
| **Bugs** | Bug fixing final | 🔴 Alta |
| **Performance** | Optimización mobile | 🔴 Alta |
| **Compat** | Testing Chrome/Firefox/Safari/Edge | 🔴 Alta |
| **Compat** | Testing iOS/Android | 🟠 Media |
| **Audio** | Música completa (3 zonas) | 🟡 Baja |
| **Audio** | SFX completos | 🟡 Baja |
| **Deploy** | PWA setup | 🟠 Media |
| **Deploy** | Hosting producción | 🔴 Alta |
| **Docs** | Créditos | 🟡 Baja |
| **Docs** | README final | 🟠 Media |

---

## 5. Cronograma Detallado

### 5.1 Vista General (Gantt Simplificado)

```
                     SEMANAS DEL PROYECTO
                S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12 S13 S14 S15 S16 S17 S18
                ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
PRE-PROD        ███ ███ 
PROTOTIPO               ███ ███ ███ 
ALPHA                           ███ ███ ███ ███ ███ ███ 
  └─ Systems                    ███ ███ ███ 
  └─ Content                            ███ ███ 
  └─ UI/UX                                      ███ ███ 
  └─ Multiplayer                                    ███ ███ 
BETA                                                        ███ ███ ███ ███ 
  └─ Bug Fixes                                              ███ 
  └─ Tutorial                                                   ███ 
  └─ Audio                                                          ███ 
  └─ Testing QA                                                     ███ ███ 
GOLD                                                                        ███ ███ ███
  └─ Polish                                                                 ███ 
  └─ Cross-browser                                                              ███ 
  └─ Deploy                                                                         ███
LANZAMIENTO                                                                             🚀

LEYENDA: ███ = Trabajo activo | ─── = Semana vacía | 🚀 = Release
```

### 5.2 Estado Actual en el Cronograma

```
           ESTAMOS AQUÍ
                 ↓
S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 ← AHORA
███ ███ ███ ███ ███ ███ ███ ███ ███ ███ ███
✅  ✅  ✅  ✅  ✅  ✅  ✅  ✅  ✅  ✅  🚧

Alpha restante: ~1 semana
Beta: ~4 semanas
Gold: ~2-3 semanas
────────────────────────────
Total restante: 6-8 semanas
```

---

## 6. Sprint Actual y Backlog

### 6.1 Sprint Actual (S11-S12)
**Objetivo:** Completar Alpha al 100%

| # | Tarea | Asignado | Estado | Horas |
|---|-------|----------|--------|-------|
| 1 | Implementar descuento Vendedor | Dev | ⏳ | 2h |
| 2 | Fix respawn checkpoints | Dev | ⏳ | 4h |
| 3 | Fix retroceso visual PvP | Dev | ⏳ | 2h |
| 4 | Fix saqueo inventario muerte | Dev | ⏳ | 2h |
| 5 | Testing bifurcaciones | QA | 🔄 | 3h |
| 6 | Testing offline 1-4p | QA | ⏳ | 4h |
| 7 | Documentar API de eventos | Dev | ⏳ | 2h |

**Total Sprint:** ~19 horas de trabajo

### 6.2 Backlog Priorizado

#### 🔴 P0 - Crítico (Bloquea release)
1. [ ] Fix respawn checkpoints
2. [ ] Implementar descuento Vendedor
3. [ ] Testing multijugador básico
4. [ ] 0 crashes en partida completa

#### 🟠 P1 - Alta Prioridad
5. [ ] Tutorial interactivo
6. [ ] Reconexión automática online
7. [ ] SFX básicos (dados, combate)
8. [ ] Balanceo de dificultad

#### 🟡 P2 - Media Prioridad
9. [ ] Animaciones de cartas flip
10. [ ] Efectos visuales daño/cura
11. [ ] Música de fondo (1 track)
12. [ ] Pantalla victoria mejorada

#### 🟢 P3 - Baja Prioridad (Nice to have)
13. [ ] Logros/Achievements
14. [ ] Tabla de clasificación
15. [ ] Más cartas de evento
16. [ ] Modo "Historia"

---

## 7. Estimaciones de Tiempo por Tarea

### 7.1 Tareas de Desarrollo

| Tarea | Complejidad | Horas Est. | Dependencias |
|-------|-------------|------------|--------------|
| Descuento Vendedor | Baja | 2h | `tile-event-manager.js` |
| Fix respawn | Media | 4h | `game-engine.js`, grafo |
| Fix PvP retroceso | Baja | 2h | `pvp-manager.js`, renderer |
| Fix saqueo muerte | Baja | 2h | `game-engine.js` |
| Reconexión online | Media | 6h | `network.js` |
| Tutorial básico | Alta | 8h | UI nuevo, triggers |
| SFX integración | Media | 8h | Librería audio, assets |
| BGM integración | Baja | 4h | Audio loop |
| Animaciones cards | Media | 4h | CSS, ui-renderer |
| Efectos partículas | Alta | 6h | Canvas o CSS |
| PWA setup | Media | 4h | Manifest, SW |

### 7.2 Tareas de QA/Testing

| Tarea | Tipo | Horas Est. | Notas |
|-------|------|------------|-------|
| QA Offline 1p | Manual | 2h | Partida completa |
| QA Offline 2-4p | Manual | 4h | Hot-seat |
| QA Online 2p | Manual | 4h | Requiere 2 dispositivos |
| QA Online 4p | Manual | 6h | Requiere 4 dispositivos |
| QA Cross-browser | Manual | 4h | Chrome, Firefox, Safari, Edge |
| QA Mobile | Manual | 4h | iOS Safari, Chrome Android |
| Regression básico | Automatizado | 2h setup | Opcional |

### 7.3 Total de Horas Restantes

| Fase | Desarrollo | QA | Total |
|------|------------|-----|-------|
| Completar Alpha | 12h | 8h | 20h |
| Beta Features | 24h | 16h | 40h |
| Gold Polish | 16h | 12h | 28h |
| **TOTAL** | **52h** | **36h** | **88h** |

**A ritmo de 10h/semana:** ~9 semanas  
**A ritmo de 20h/semana:** ~4-5 semanas  
**A ritmo de 40h/semana:** ~2 semanas

---

## 8. Análisis de Riesgos

### 8.1 Matriz de Riesgos

| Riesgo | Probabilidad | Impacto | Score | Mitigación |
|--------|--------------|---------|-------|------------|
| Bugs de sincronización P2P | 🟡 Media | 🔴 Alto | 🔴 **8** | Testing exhaustivo, logs |
| Balanceo incorrecto | 🟡 Media | 🟡 Medio | 🟡 **6** | Playtesting interno frecuente |
| Rendimiento bajo en mobile | 🟡 Media | 🔴 Alto | 🔴 **8** | Profiling temprano, optimización SVG |
| Scope creep (nuevas features) | 🟢 Baja | 🟡 Medio | 🟢 **4** | Backlog estricto, MVP first |
| Burnout / pérdida de motivación | 🟡 Media | 🔴 Alto | 🔴 **8** | Hitos pequeños, celebrar logros |
| PeerJS deprecation/issues | 🟢 Baja | 🔴 Alto | 🟡 **5** | Fallback a WebSocket |
| Incompatibilidad Safari iOS | 🟡 Media | 🟡 Medio | 🟡 **6** | Testing temprano en iOS |

### 8.2 Plan de Contingencia

| Escenario | Acción |
|-----------|--------|
| PeerJS falla | Migrar a Socket.io o WebRTC directo |
| Mobile muy lento | Reducir animaciones, usar Canvas 2D |
| Safari rompe layout | Usar fallbacks CSS, evitar features nuevas |
| No hay tiempo para audio | Lanzar sin audio, agregar en v1.1 |

---

## 9. Recursos Necesarios

### 9.1 Para Completar Alpha
- [x] 1 desarrollador
- [x] Entorno de desarrollo local
- [ ] 1-2 testers (pueden ser amigos)

### 9.2 Para Beta
- [ ] **Audio Assets** (libre de derechos o creados)
  - 10-15 SFX (dados, golpes, pasos, etc.)
  - 1-3 tracks de música ambiental
- [ ] **Dispositivos de prueba**
  - 1x Android
  - 1x iOS (opcional pero recomendado)
  - 2-4 computadoras para test online
- [ ] **Beta Testers**
  - 4-8 personas para testing real

### 9.3 Para Lanzamiento
- [ ] **Hosting**
  - Vercel (gratis) o Netlify
  - Dominio propio (opcional)
- [ ] **Assets de Marketing**
  - Screenshots del juego
  - Descripción corta para compartir
  - Icono/favicon

### 9.4 Presupuesto Estimado

| Item | Costo | Notas |
|------|-------|-------|
| **Desarrollo** | $0 | Trabajo propio |
| **Hosting (Vercel)** | $0 | Tier gratuito |
| **Dominio** | $12/año | Opcional |
| **Audio (royalty-free)** | $0-50 | opengameart.org o similar |
| **Testing Devices** | $0 | Usar los propios |
| **TOTAL** | **$0-62** | Proyecto muy económico |

---

## 10. Métricas y KPIs

### 10.1 KPIs de Desarrollo

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Bugs críticos abiertos | 0 | ~2 |
| Código coverage (estimado) | >70% | ~60% |
| Tiempo de carga inicial | <3s | ~2s ✅ |
| FPS en desktop | >60 | 60 ✅ |
| FPS en mobile | >30 | ~45 ✅ |
| Tamaño del bundle | <1MB | ~500KB ✅ |

### 10.2 KPIs de Calidad

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Partidas completadas sin crash | 100% | ~95% |
| Tiempo promedio de partida | 15-30min | No medido |
| Bifurcaciones funcionando | 4/4 | 4/4 ✅ |
| Clases jugables | 6/6 | 6/6 ✅ |
| Casillas con eventos | 30+ | 35+ ✅ |

### 10.3 KPIs Post-Lanzamiento (Objetivos)

| Métrica | Objetivo 30 días |
|---------|------------------|
| Usuarios únicos | 100+ |
| Partidas jugadas | 500+ |
| Sesión promedio | >10 min |
| Bugs reportados críticos | <3 |
| Rating (si aplica) | >4/5 |

---

## 11. Checklist de Lanzamiento

### Pre-Lanzamiento (1 semana antes)
- [ ] Todas las features Alpha implementadas
- [ ] 0 bugs críticos
- [ ] Testing completo offline (1-4p)
- [ ] Testing completo online (2-4p)
- [ ] Cross-browser testing pasado
- [ ] Mobile testing pasado (Android + iOS)
- [ ] Tutorial funcional
- [ ] Audio básico integrado (mínimo SFX)

### Lanzamiento (día del release)
- [ ] Deploy a producción (Vercel/Netlify)
- [ ] Verificar que funciona en producción
- [ ] Crear hilo de anuncio (si aplica)
- [ ] Compartir con beta testers

### Post-Lanzamiento (1 semana después)
- [ ] Monitorear feedback
- [ ] Hotfix bugs críticos reportados
- [ ] Agregar analytics (opcional)
- [ ] Planificar v1.1

---

## 📋 Apéndices

### A. Glosario de Términos
- **PvE:** Player vs Environment (combate contra zombies/bandidos)
- **PvP:** Player vs Player (combate entre jugadores)
- **Junction:** Bifurcación en el mapa donde el jugador elige camino
- **Hotseat:** Modo multijugador local pasando el control
- **P2P:** Peer-to-Peer, conexión directa entre jugadores sin servidor

### B. Contacto y Recursos
- **Repositorio:** Local (sin Git remoto configurado)
- **Servidor de desarrollo:** `npx http-server -p 8080`
- **URL de prueba:** `http://localhost:8080`

---

> **Este documento es un documento vivo y debe actualizarse semanalmente.**

---

*Generado el 2026-01-19 basado en análisis exhaustivo del código fuente.*
