// Configuración de RPG: Clases y Cartas

export const CLASSES = [
    { id: 'medic', name: 'Curandero', life: 4, food: 2, weapons: 0, shield: 0, bonus: 'Vida+', icon: '🧙' },
    { id: 'soldier', name: 'Combatiente', life: 3, food: 2, weapons: 1, shield: 0, bonus: 'Doble Dado', icon: '⚔️' },
    { id: 'scout', name: 'Explorador', life: 3, food: 3, weapons: 0, shield: 0, bonus: 'Comida+', icon: '🧭' },
    { id: 'tank', name: 'Escudero', life: 3, food: 2, weapons: 0, shield: 1, bonus: 'Defensa', icon: '🛡️' }
];

// MAX_RESOURCES: Límite máximo de cada recurso
export const MAX_RESOURCES = {
    life: 5,
    food: 5,
    weapons: 5,
    shield: 5
};

// HUNGER_INTERVAL: Cada cuántos turnos se consume comida
export const HUNGER_INTERVAL = 3;

// Helper para aplicar límites
export const clampResource = (value, resource) => Math.max(0, Math.min(value, MAX_RESOURCES[resource]));

// Helper para efectos (se pasarán stats por referencia)
export const LUCK_CARDS = [
    { title: "Sopa en Lata", desc: "Encuentras comida en buen estado. (+2 Comida)", type: "loot", effect: (s) => { s.food = clampResource(s.food + 2, 'food'); } },
    { title: "Botiquín", desc: "Un kit de primeros auxilios básico. (+1 Vida)", type: "loot", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Munición", desc: "Encuentras un arma. (+1 Arma)", type: "loot", effect: (s) => { s.weapons = clampResource(s.weapons + 1, 'weapons'); } },
    { title: "Escudo Improvisado", desc: "Fabricas protección básica. (+1 Escudo)", type: "loot", effect: (s) => { s.shield = clampResource(s.shield + 1, 'shield'); } },
    { title: "Suministros", desc: "Una mochila con recursos. (+1 Comida, +1 Vida)", type: "loot", effect: (s) => { s.food = clampResource(s.food + 1, 'food'); s.life = clampResource(s.life + 1, 'life'); } }
];

export const EVENT_CARDS = [
    { title: "Lluvia Ácida", desc: "El cielo se oscurece y quema. (-1 Vida)", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 1); } },
    { title: "Comida Podrida", desc: "Te sentó mal la cena. (-1 Comida)", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Mercenario", desc: "Te roba suministros. (-1 Comida)", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Descanso", desc: "Un momento de paz. (+1 Vida)", type: "event", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Trampa", desc: "Caes en un hoyo. (-1 Vida)", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 1); } },
    { title: "Zombie Errante", desc: "¡Un zombie te ataca!", type: "combat", enemyCount: 1, enemyType: "zombie" },
    { title: "Bandido", desc: "¡Un bandido te bloquea el paso!", type: "combat", enemyCount: 1, enemyType: "bandido" }
];
