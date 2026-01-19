# Plan: Sistema de Dados Manuales en Combate

## Objetivo
El jugador puede elegir entre:
- **Tirar dados uno por uno** (cada click = 1 dado)
- **Tirar todos de una vez** (un botón lanza todos)

---

## UI Propuesta

```
╔═══════════════════════════════════════╗
║         ⚔️ COMBATE vs 🧟 x2          ║
╠═══════════════════════════════════════╣
║                                       ║
║   TÚ (3 armas = 4 dados)             ║
║   [?] [?] [?] [?]    = ?             ║
║                                       ║
║   ENEMIGOS (2 zombies)               ║
║   [?] [?]            = ?             ║
║                                       ║
╠═══════════════════════════════════════╣
║  [🎲 TIRAR DADO]  [⚡ TODOS A LA VEZ] ║
╚═══════════════════════════════════════╝
```

Al hacer click en "TIRAR DADO":
1. Primer dado revela: `[⚄] [?] [?] [?]`
2. Segundo dado: `[⚄] [⚂] [?] [?]`
3. etc.

Cuando todos los dados del jugador estén tirados:
- Se tiran automáticamente los dados del enemigo
- Se muestra el resultado

---

## Cambios Necesarios

### 1. [MODIFY] combat-manager.js
- Cambiar `rollCombat()` a sistema de dados individuales
- Añadir estado: `currentDiceIndex`, `playerDice[]`
- Nuevo método: `rollNextDie()` - tira un dado
- Nuevo método: `rollAllDice()` - tira todos los restantes

### 2. [MODIFY] ui-renderer.js
- Actualizar modal de combate con slots de dados
- Mostrar [?] para dados no tirados
- Mostrar emoji para dados tirados
- Dos botones: "Tirar Dado" y "Todos a la vez"

### 3. [MODIFY] index.html
- Actualizar estructura del modal de combate

---

## Flujo del Combate

1. Se inicia combate → Mostrar todos los dados como [?]
2. Jugador hace click en "Tirar Dado" → Se revela 1 dado
3. Repetir hasta tirar todos
4. (O) Jugador hace click en "Todos a la vez" → Se revelan todos
5. Se tiran los dados del enemigo automáticamente
6. Se calcula y muestra resultado

---

## Estado: PENDIENTE (guardado para implementar después)
