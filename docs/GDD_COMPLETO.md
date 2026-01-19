# 📋 LA RUTA DE LOS 80 PASOS
## Documentación Completa del Proyecto

> Este documento contiene el **Game Design Document (GDD)** completo y el **Plan de Producción (Roadmap)** detallado para el proyecto.

---

# 🎮 GAME DESIGN DOCUMENT (GDD)

## 1. Ficha Técnica

| Campo | Valor |
|-------|-------|
| **Título** | La Ruta de los 80 Pasos |
| **Género** | Juego de Mesa Digital / Supervivencia / RPG por Turnos |
| **Plataforma Actual** | Web (Navegador Desktop/Móvil) |
| **Plataformas Objetivo** | Web, PWA (iOS/Android), Desktop (Electron) |
| **Público Objetivo** | Jugadores casuales y mid-core (13+) |
| **Motor/Tecnología** | HTML5, CSS3, Vanilla JavaScript (Sin motor externo) |
| **Modo de Juego** | 1-4 Jugadores (Local/Online via PeerJS) |
| **Duración Estimada** | 15-45 minutos por partida |
| **Versión Actual** | v7.9 |

---

## 2. Visión del Juego (High Concept)

### 2.1 Resumen Ejecutivo (Elevator Pitch)
> "Un juego de mesa digital post-apocalíptico donde 1-4 supervivientes compiten por ser el primero en llegar al refugio. No es solo una carrera; es una lucha brutal donde el hambre, los zombis, los bandidos y otros jugadores intentarán detenerte. Gestiona tus recursos, elige sabiamente tus rutas y sobrevive."

### 2.2 Pilares del Diseño
1. **Supervivencia Constante** — El hambre y los recursos son el núcleo del juego.
2. **Riesgo vs Recompensa** — Cada decisión tiene consecuencias.
3. **Competencia Tensa** — PvP opcional que eleva la tensión.
4. **Accesibilidad** — Reglas simples, profundidad estratégica.

### 2.3 Experiencia Objetivo
El jugador debe sentir:
- 😰 **Tensión** al gestionar recursos escasos
- 🎲 **Emoción** al tirar los dados en combate
- 🤔 **Decisiones significativas** en bifurcaciones
- 🏆 **Satisfacción** al llegar al refugio

---

## 3. Mecánicas de Juego (Gameplay)

### 3.1 Objetivo Principal
> Llegar vivo a la **Casilla 80 (El Refugio)** con al menos **1 Punto de Vida**.

**Condición de Victoria:**
- Alcanzar la casilla 80
- Derrotar al **Boss Zombie (Nivel 4)** en la casilla 79 (obligatorio)
- Tener ≥1 vida al finalizar el turno

### 3.2 Core Game Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOOP PRINCIPAL DE TURNO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐                                              │
│   │ 1. INICIO    │  Consumir 1 Comida (cada 3 turnos)           │
│   │    TURNO     │  Si no hay comida → -1 Vida                  │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │ 2. TIRAR     │  Dados 1d6 (+ dados extra por armas)         │
│   │    DADOS     │  Científico: Opción de usar Portal           │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │ 3. MOVERSE   │  Avanzar casillas según dados                │
│   │              │  Decisión en bifurcaciones                   │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │ 4. EVENTO    │  Resolver evento de la casilla destino:      │
│   │    CASILLA   │  - ZOMBIE: Pelear o Retroceder               │
│   │              │  - BANDIDO: Pelear o Retroceder              │
│   │              │  - EVENTO: Carta aleatoria                   │
│   │              │  - SUERTE: Loot garantizado                  │
│   │              │  - MERCADO: Comerciar                        │
│   │              │  - SEGURA: Descanso                          │
│   │              │  - PvP: Si hay otro jugador                  │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │ 5. FIN       │  Pasar control al siguiente jugador          │
│   │    TURNO     │  Verificar victoria/muerte                   │
│   └──────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Sistema de Recursos

| Recurso | Icono | Límite Máximo | Función |
|---------|-------|---------------|---------|
| **Vida** | ❤️ | 6 | Si llega a 0, mueres |
| **Comida** | 🍗 | 15 | Se consume cada 3 turnos |
| **Armas** | ⚔️ | 5 | +1 dado por arma en combate |
| **Escudo** | 🛡️ | 5 | Absorbe 1 daño si diferencia = 1 |

### 3.4 Sistema de Hambre (Hunger)

```
┌─────────────────────────────────────────────────────┐
│              MECÁNICA DE HAMBRE                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│   Intervalo de Consumo: Cada 3 turnos                │
│                                                      │
│   Turno 1: (no consume)                              │
│   Turno 2: (no consume)                              │
│   Turno 3: -1 🍗 Comida                              │
│   Turno 4: (no consume)                              │
│   ...y así sucesivamente                             │
│                                                      │
│   ⚠️ Si Comida = 0 cuando toca consumir:            │
│      → Pierdes 1 ❤️ Vida                            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 3.5 Sistema de Combate (PvE)

#### Mecánica de Dados
- **Jugador tira:** `(Armas + 1)` dados × 1d6
  - 0 armas = 1 dado
  - 1 arma = 2 dados
  - 2 armas = 3 dados (máx útil)
- **Enemigo tira:** `(Cantidad de enemigos)` dados × 1d6
  - 1 zombie = 1 dado
  - 2 zombies = 2 dados

#### Resultados del Combate

| Resultado | Consecuencia |
|-----------|--------------|
| **Jugador > Enemigo** | ✅ Victoria: Obtiene loot según nivel enemigo |
| **Jugador = Enemigo** | 🔄 Empate: Re-roll obligatorio (timer 20s) |
| **Jugador < Enemigo** | ❌ Derrota: -1 vida, posible pérdida de arma |

#### Sistema de Escudo en Combate
- Si diferencia = 1 y tienes escudo → Escudo se rompe, no recibes daño
- Si diferencia > 1 → Escudo no protege

#### Loot por Nivel de Enemigo

| Nivel Enemigo | Items Obtenidos | Ubicación en Mapa |
|---------------|-----------------|-------------------|
| Nivel 1 | 1 item aleatorio | Casillas 1-19 |
| Nivel 2 | 2 items aleatorios | Casillas 20-44 |
| Nivel 3 | 3 items aleatorios | Casillas 45-78 |
| Nivel 4 (Boss) | 4 items aleatorios | Casilla 79 |

### 3.6 Sistema de Combate PvP

> **Trigger:** Cuando un jugador termina su turno en la misma casilla que otro jugador.

#### Opciones del Encuentro
1. **🕊️ Paz** — Ambos continúan (requiere acuerdo mutuo)
2. **⚔️ Combate** — Duelo de dados
3. **🚶 Retirarse** — Retroceder a casilla vacía

#### Resultado del Combate PvP
- **Ganador:** Roba 1 recurso aleatorio del perdedor
- **Perdedor:** -1 vida + retrocede 1 casilla

---

## 4. Tipos de Casillas

### Mapa Visual de Tipos

| Tipo | Icono | Color | Descripción |
|------|-------|-------|-------------|
| **NORMAL** | — | `#f7f5e6` | Sin evento |
| **ZOMBIE** | 🧟 | `#4ade80` | Combate obligatorio o retroceso |
| **ZOMBIE_BOSS** | 💀 | `#dc2626` | Boss final obligatorio |
| **BANDIT** | 🗡️ | `#f59e0b` | Combate contra bandidos |
| **EVENT** | ❓ | `#fbbf24` | Carta de evento aleatoria |
| **LUCK** | 🍀 | `#a78bfa` | Loot garantizado |
| **SAFE** | 🏠 | `#60a5fa` | Descanso, +1 vida |
| **MARKET** | 🏪 | `#f472b6` | Comercio de recursos |

### Distribución en el Mapa (Bitácora)

```
Casilla 0:  🏠 SAFE (Inicio)
Casilla 3:  ❓ EVENT
Casilla 5:  🍀 LUCK
Casilla 7:  🧟 ZOMBIE (Lvl 1)
Casilla 11: 🗡️ BANDIT (Lvl 1)
Casilla 12: 🧟 ZOMBIE (Lvl 1)
Casilla 14: 🍀 LUCK
Casilla 15: 🏪 MARKET (Primer mercado)
Casilla 17: ❓ EVENT
Casilla 22: 🍀 LUCK
Casilla 24: 🗡️ BANDIT (Lvl 2)
Casilla 25: 🏠 SAFE
Casilla 27: ❓ EVENT
Casilla 30: 🧟 ZOMBIE (Lvl 2)
Casilla 33: 🍀 LUCK
Casilla 35: ❓ EVENT
Casilla 37: 🗡️ BANDIT (Lvl 3)
Casilla 40: 🍀 LUCK
Casilla 42: ❓ EVENT
Casilla 44: 🏪 MARKET (Mid-game)
Casilla 47: 🧟 ZOMBIE (Lvl 3)
Casilla 48: 🏠 SAFE
Casilla 50: ❓ EVENT (Bifurcación)
Casilla 52: 🧟 ZOMBIE (Lvl 3)
Casilla 55: 🍀 LUCK
Casilla 57: 🗡️ BANDIT (Lvl 3)
Casilla 58: ❓ EVENT
Casilla 62: 🧟 ZOMBIE (Lvl 3)
Casilla 63: 🍀 LUCK
Casilla 65: ❓ EVENT
Casilla 68: 🧟 ZOMBIE (Lvl 3)
Casilla 70: 🍀 LUCK
Casilla 72: ❓ EVENT
Casilla 73: 🏪 MARKET (Último mercado)
Casilla 75: 🍀 LUCK
Casilla 78: 🍀 LUCK (Última oportunidad de loot)
Casilla 79: 💀 ZOMBIE_BOSS (Obligatorio)
Casilla 80: 🏠 SAFE (Victoria!)
```

---

## 5. Sistema de Personajes (Clases)

### 5.1 Tabla de Clases

| Clase | Icono | Vida | Comida | Armas | Escudo | Pasiva |
|-------|-------|------|--------|-------|--------|--------|
| **Curandero** | 🧙 | 6 | 5 | 0 | 0 | +1 vida inicial |
| **Combatiente** | ⚔️ | 5 | 5 | 1 | 0 | Empieza con arma |
| **Explorador** | 🧭 | 6 | 6 | 0 | 0 | Balanced (sin pasiva) |
| **Tanque** | 🛡️ | 5 | 6 | 0 | 1 | Empieza con escudo |
| **Científico** | 🔬 | 5 | 6 | 0 | 0 | Portal inicial (salta 5 casillas, 1 uso) |
| **Vendedor** | 🛒 | 5 | 6 | 0 | 0 | Descuento en mercado |

### 5.2 Estrategias Recomendadas

| Clase | Estrategia Óptima |
|-------|-------------------|
| **Curandero** | Aguantar daño, rutas arriesgadas, sobrevivir eventos |
| **Combatiente** | Rush inicial, farmear zombies tempranos para loot |
| **Explorador** | Juego equilibrado, adaptarse a la situación |
| **Tanque** | Absorber hits críticos, combate seguro |
| **Científico** | Usar portal para evitar tramo peligroso o alcanzar mercado |
| **Vendedor** | Acumular comida, comerciar agresivamente |

---

## 6. Sistema de Cartas

### 6.1 Cartas de Suerte (Loot)

| Carta | Efecto |
|-------|--------|
| **Sopa en Lata** | +2 🍗 Comida |
| **Botiquín** | +1 ❤️ Vida |
| **Munición** | +1 ⚔️ Arma |
| **Escudo Improvisado** | +1 🛡️ Escudo |
| **Suministros** | +1 🍗, +1 ❤️ |
| **Armería Secreta** | +2 ⚔️ Armas |
| **Almacén Oculto** | +3 🍗 Comida |
| **Kit Médico Militar** | +2 ❤️ Vida |
| **Armadura Táctica** | +2 🛡️ Escudos |
| **Caja de Suministros** | +1 de todo (vida, comida, armas) |

### 6.2 Cartas de Evento

| Carta | Tipo | Efecto |
|-------|------|--------|
| **Lluvia Ácida** | ⚠️ Hazard | -1 ❤️ Vida |
| **Comida Podrida** | 📋 Event | -1 🍗 Comida |
| **Mercenario** | 📋 Event | -1 🍗 Comida |
| **Descanso** | 📋 Event | +1 ❤️ Vida |
| **Trampa** | ⚠️ Hazard | -1 ❤️ Vida |
| **Zombie Errante** | ⚔️ Combat | Combate vs 1 Zombie |
| **Bandido** | ⚔️ Combat | Combate vs 1 Bandido |
| **Horda de Zombies** | ⚔️ Combat | Combate vs 2 Zombies |
| **Emboscada** | ⚠️ Hazard | -1 ⚔️ Arma |
| **Ladrón Silencioso** | ⚠️ Hazard | -2 🍗 Comida |
| **Refugio Temporal** | 📋 Event | +1 ❤️, +1 🍗 |
| **Escudo Roto** | ⚠️ Hazard | -1 🛡️ Escudo |

---

## 7. Sistema de Comercio (Mercado)

### 7.1 Operaciones Disponibles

| Operación | Costo | Resultado |
|-----------|-------|-----------|
| **Comprar Arma** | 2 🍗 | +1 ⚔️ |
| **Vender Arma** | 1 ⚔️ | +2 🍗 |
| **Curarse** | 1 🍗 | +1 ❤️ |
| **Comprar Escudo** | 3 🍗 | +1 🛡️ |

### 7.2 Pasiva del Vendedor
El **Vendedor** tiene descuento en todos los precios (implementación pendiente).

---

## 8. Curva de Dificultad

### Zonas del Mapa

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRESIÓN DE DIFICULTAD                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ZONA 1: "EL DESPERTAR" (Casillas 0-30)                        │
│   ├── Enemigos: Zombies Lvl 1, Bandidos Lvl 1                   │
│   ├── Frecuencia: 1 combate cada 4-5 casillas                   │
│   ├── Recursos: Abundantes                                       │
│   └── Objetivo: Recolectar, prepararse                          │
│                                                                  │
│   ZONA 2: "ZONA DE CONFLICTO" (Casillas 31-60)                  │
│   ├── Enemigos: Zombies Lvl 2-3, Bandidos Lvl 2-3               │
│   ├── Frecuencia: 1 combate cada 3 casillas                     │
│   ├── Recursos: Escasos                                         │
│   └── Objetivo: Gestionar, comerciar, sobrevivir                │
│                                                                  │
│   ZONA 3: "EL INFIERNO" (Casillas 61-80)                        │
│   ├── Enemigos: Zombies Lvl 3-4, Boss en casilla 79             │
│   ├── Frecuencia: Casi cada casilla                             │
│   ├── Recursos: Inexistentes (depende de reservas)              │
│   └── Objetivo: Gastar reservas, sobrevivir, victoria           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Interfaz de Usuario (UI/UX)

### 9.1 Pantallas Principales

1. **Lobby/Menú Principal**
   - Crear sala online
   - Unirse a sala
   - Jugar offline (1-4 jugadores)
   - Modo editor
   - Modo debug

2. **Tablero de Juego**
   - Mapa SVG interactivo
   - Fichas de jugadores animadas
   - Zoom/Pan con gestos

3. **HUD (Footer)**
   - Stats: ❤️ 🍗 ⚔️ 🛡️
   - Botón de dados
   - Posición actual

4. **Header**
   - Jugador actual
   - Número de turno
   - Código de sala (online)

### 9.2 Modales

| Modal | Función |
|-------|---------|
| **character-modal** | Selección de clase |
| **decision-modal** | Bifurcaciones del camino |
| **card-modal** | Visualización de cartas |
| **combat-modal** | Interfaz de combate PvE |
| **pvp-modal** | Encuentro con otro jugador |
| **pvp-combat-modal** | Duelo PvP |
| **market-modal** | Tienda de recursos |
| **gameover-modal** | Pantalla de fin de juego |
| **settings-modal** | Ajustes y herramientas |
| **debug-panel** | Panel de testing |

---

## 10. Arquitectura Técnica

### 10.1 Estructura de Archivos

```
La Ruta de los 80 Pasos/
├── index.html              # Entry point
├── css/
│   ├── base.css            # Variables, reset, utilidades
│   ├── lobby.css           # Estilos del lobby
│   ├── board.css           # Estilos del tablero SVG
│   └── components.css      # Modales, botones, HUD
├── js/
│   ├── main.js             # Entry point JS
│   ├── svg-board-renderer.js # Renderizado del mapa SVG
│   ├── core/
│   │   ├── game-engine.js      # Motor principal del juego
│   │   ├── game-state.js       # Estado global (store)
│   │   ├── event-bus.js        # Sistema de eventos
│   │   ├── combat-manager.js   # Sistema de combate PvE
│   │   ├── pvp-manager.js      # Sistema de combate PvP
│   │   ├── tile-event-manager.js # Eventos de casillas
│   │   └── network.js          # Conexión P2P (PeerJS)
│   ├── data/
│   │   ├── rpg-data.js         # Clases, cartas, constantes
│   │   ├── tile-types.js       # Tipos de casillas
│   │   ├── map-data.js         # Grafo del tablero
│   │   └── id-mapping.js       # Mapeo de IDs
│   └── ui/
│       ├── ui-handlers.js      # Event listeners de UI
│       └── ui-renderer.js      # Renderizado dinámico
├── docs/                   # Documentación adicional
└── map.png                 # Imagen del mapa base
```

### 10.2 Patrones de Diseño

| Patrón | Uso |
|--------|-----|
| **Event Bus** | Comunicación desacoplada entre módulos |
| **Singleton Store** | Estado global del juego |
| **Manager Pattern** | CombatManager, TileEventManager, PvPManager |
| **Module Pattern** | ES Modules para separación de concerns |

### 10.3 Flujo de Eventos

```
Usuario presiona "Tirar Dados"
    ↓
ui-handlers.js → bus.emit('ROLL_REQUEST')
    ↓
game-engine.js → handleRoll() → ejecuta movimiento
    ↓
bus.emit('PLAYER_MOVED', { player, path })
    ↓
svg-board-renderer.js → animación de ficha
    ↓
tile-event-manager.js → checkTileEvent()
    ↓
(Si zombi) → combat-manager.js → startCombat()
    ↓
bus.emit('COMBAT_START') → ui-renderer.js → mostrar modal
```

---

## 11. Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **HTML5** | — | Estructura |
| **CSS3** | — | Estilos, animaciones |
| **JavaScript ES6+** | — | Lógica, módulos |
| **PeerJS** | 1.5.2 | Conexión P2P para multijugador |
| **Google Fonts** | Outfit, Roboto Mono | Tipografía |
| **SVG** | — | Renderizado del mapa |

---

## 12. Audio y Música (Planificado)

### 12.1 Música de Fondo (BGM)
- **Lobby:** Ambiente tenso, guitarra acústica post-apocalíptica
- **Zona 1:** Ritmo lento, esperanzador
- **Zona 2:** Tensión creciente, percusión
- **Zona 3:** Épico, urgente, coros

### 12.2 Efectos de Sonido (SFX)

| Evento | Sonido |
|--------|--------|
| Tirar dados | Dados rodando |
| Movimiento | Pasos en tierra |
| Combate inicio | Gruñido zombie / grito bandido |
| Victoria | Fanfarria corta |
| Derrota | Golpe, quejido |
| Muerte | Sonido dramático |
| Mercado | Campana de tienda |
| Carta | Flip de carta |

---

---

# 📅 PLAN DE PRODUCCIÓN (ROADMAP)

## 1. Estado Actual del Proyecto

### Versión: v7.9 SEQUENTIAL PATH

| Componente | Estado | Progreso |
|------------|--------|----------|
| **Core Engine** | ✅ Funcional | 90% |
| **Tablero SVG** | ✅ Funcional | 95% |
| **Sistema de Turnos** | ✅ Funcional | 100% |
| **Movimiento + Bifurcaciones** | ✅ Funcional | 100% |
| **Sistema de Combate PvE** | ✅ Funcional | 90% |
| **Sistema de Combate PvP** | ✅ Funcional | 85% |
| **Tipos de Casillas** | ✅ Funcional | 100% |
| **Cartas de Evento/Suerte** | ✅ Funcional | 100% |
| **Mercado** | ✅ Funcional | 90% |
| **Sistema de Muerte/Respawn** | ✅ Funcional | 85% |
| **Multijugador Online** | ⚠️ Parcial | 70% |
| **UI/UX** | ⚠️ Parcial | 75% |
| **Audio/Música** | ❌ Pendiente | 0% |
| **Tutorial** | ❌ Pendiente | 0% |
| **Balanceo Final** | ❌ Pendiente | 20% |

---

## 2. Fases del Proyecto

### FASE 1: Pre-Producción ✅ COMPLETADA
**Duración:** 1-2 Semanas

- [x] Definición del concepto (GDD inicial)
- [x] Diseño de mapa y rutas
- [x] Definición de clases y reglas básicas
- [x] Setup del proyecto (HTML/JS/CSS)
- [x] Creación del tablero SVG base

---

### FASE 2: Prototipo / Vertical Slice ✅ COMPLETADA
**Duración:** 2-3 Semanas

- [x] Renderizado del tablero interactivo
- [x] Movimiento básico de fichas
- [x] Sistema de turnos simple
- [x] Mecánica de dados básica
- [x] Primera versión jugable

---

### FASE 3: Alpha 🚧 EN PROGRESO (85%)
**Duración Estimada Original:** 4-6 Semanas
**Tiempo Invertido:** ~6 semanas

#### Sistemas Core (90% Completado)
- [x] Sistema de combate PvE con múltiples dados
- [x] Sistema de eventos de casillas
- [x] Gestión de inventario (Comida/Armas/Escudo)
- [x] Sistema de hambre cada 3 turnos
- [x] Sistema de bifurcaciones funcional
- [x] Sistema de muerte y respawn
- [x] Sistema PvP (encuentros)
- [ ] Habilidades especiales de clase (Vendedor descuento - pendiente)

#### Contenido (90% Completado)
- [x] Todas las 80 casillas definidas
- [x] Distribución de zombies por niveles 1-4
- [x] Distribución de bandidos por niveles 1-3
- [x] Boss Zombie obligatorio en casilla 79
- [x] 10 cartas de Suerte implementadas
- [x] 12 cartas de Evento implementadas
- [x] 6 clases jugables

#### UI/UX (75% Completado)
- [x] HUD básico con stats
- [x] Modal de selección de personaje
- [x] Modal de combate con timer
- [x] Modal de mercado
- [x] Modal de bifurcaciones mejorado
- [x] Modal de PvP
- [x] Animaciones de movimiento
- [ ] Animaciones de combate pulidas
- [ ] Pantallas de Victoria/Derrota mejoradas
- [ ] Feedback visual de daño/curación

---

### FASE 4: Beta (PRÓXIMAMENTE)
**Objetivo:** Feature Complete
**Duración Estimada:** 3-4 Semanas

#### Tareas Principales

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Implementar descuento del Vendedor | Alta | 2 horas |
| Balanceo de combate (daño/loot) | Alta | 1 semana |
| Sincronización multijugador (testing) | Alta | 1 semana |
| Feedback visual (partículas, efectos) | Media | 3 días |
| Animaciones de cards flip | Media | 2 días |
| Tutorial interactivo | Media | 1 semana |
| Sonidos y música | Media | 1 semana |
| Testing QA exhaustivo | Alta | Continuo |

#### Checklist Beta
- [ ] Sistema de descuento del Vendedor
- [ ] Balanceo de recursos (comida, frecuencia de mercados)
- [ ] Balanceo de dificultad Zona 3
- [ ] Pulir animaciones de combate
- [ ] Agregar efectos de partículas (daño, curación, loot)
- [ ] Implementar sonidos básicos (dados, combate, cartas)
- [ ] Tutorial de primer turno
- [ ] Testing multijugador online (2-4 jugadores)
- [ ] Pantalla de carga con tips
- [ ] Indicadores visuales de turno actual

---

### FASE 5: Gold / Polishing (FINAL)
**Duración Estimada:** 2-3 Semanas

#### Tareas de Pulido
- [ ] Bug fixing intensivo
- [ ] Optimización de rendimiento (Mobile)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Testing en dispositivos reales (iOS, Android)
- [ ] Música de fondo completa (3 tracks por zona)
- [ ] Efectos de sonido completos
- [ ] Pantalla de créditos
- [ ] Localización (español completo)
- [ ] PWA setup (manifest, service worker)
- [ ] Deploy a producción

---

## 3. Cronograma Detallado (Roadmap Visual)

```
┌────────────────────────────────────────────────────────────────────┐
│                        TIMELINE DEL PROYECTO                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SEMANA 1-2    ████████████ Pre-Producción ✅                       │
│                                                                     │
│  SEMANA 3-5    ████████████████████ Prototipo ✅                    │
│                                                                     │
│  SEMANA 6-11   ███████████████████████████████ Alpha 🚧            │
│                [█████████████████████████░░░░░] 85%                │
│                                                                     │
│  SEMANA 12-15  ░░░░░░░░░░░░░░░░░░░░░░░░ Beta                        │
│                                                                     │
│  SEMANA 16-18  ░░░░░░░░░░░░░░░░ Gold/Polish                         │
│                                                                     │
│  SEMANA 19     ░░░░ Lanzamiento v1.0 🚀                             │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Próximos Pasos Inmediatos

### Sprint Actual (1-2 Semanas)

| # | Tarea | Prioridad | Tiempo Est. | Estado |
|---|-------|-----------|-------------|--------|
| 1 | Completar testing de bifurcaciones | Alta | 2 días | 🔄 En curso |
| 2 | Implementar pasiva del Vendedor | Alta | 2 horas | ⏳ Pendiente |
| 3 | Pulir animaciones de movimiento | Media | 1 día | ⏳ Pendiente |
| 4 | Agregar feedback visual de combate | Media | 2 días | ⏳ Pendiente |
| 5 | Testing multijugador 2 jugadores | Alta | 3 días | ⏳ Pendiente |

### Backlog Priorizado

1. 🔴 **CRÍTICO:** Testing completo de flujo de juego sin bugs
2. 🟠 **ALTO:** Sistema de audio básico
3. 🟠 **ALTO:** Tutorial para nuevos jugadores
4. 🟡 **MEDIO:** Efectos de partículas
5. 🟡 **MEDIO:** Optimización mobile
6. 🟢 **BAJO:** Logros/Achievements
7. 🟢 **BAJO:** Tabla de clasificación

---

## 5. Métricas de Éxito

### KPIs del Proyecto

| Métrica | Objetivo | Estado Actual |
|---------|----------|---------------|
| Bugs críticos | 0 | ~2-3 conocidos |
| Partida completa sin crashes | Sí | Sí (offline) |
| Tiempo de carga | < 3s | ~2s |
| FPS en mobile | > 30 | ~40-50 |
| Tasa de finalización de partida | > 80% | Por medir |

---

## 6. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Bugs de sincronización online | Alta | Alto | Testing exhaustivo con logs |
| Balanceo incorrecto | Media | Medio | Playtesting interno |
| Rendimiento en mobile | Media | Alto | Optimización progresiva |
| Pérdida de motivación | Baja | Alto | Hitos pequeños y celebrables |

---

## 7. Recursos Necesarios

### Para Beta
- [ ] 2-4 beta testers
- [ ] Dispositivos de prueba (Android, iOS)
- [ ] Biblioteca de sonidos (libre de derechos)
- [ ] Música ambiental (3-5 tracks)

### Para Lanzamiento
- [ ] Dominio web
- [ ] Hosting (Vercel/Netlify)
- [ ] Iconos/Assets de marketing
- [ ] Descripción para stores (si aplica)

---

> **Última actualización:** 2026-01-19
> **Autor:** Documentación generada con análisis completo del código fuente

---

*Este documento debe actualizarse semanalmente para reflejar el progreso real del proyecto.*
