// Configuración de RPG: Clases y Cartas

export const CLASSES = [
    // Curandero: +1 vida extra inicial
    { id: 'medic', name: 'Curandero', life: 6, food: 5, weapons: 0, shield: 0, bonus: 'Vida+', icon: '🧙', passive: '+1 vida inicial' },
    // Combatiente: Empieza con 1 arma
    { id: 'soldier', name: 'Combatiente', life: 5, food: 5, weapons: 1, shield: 0, bonus: 'Arma', icon: '⚔️', passive: 'Empieza con arma' },
    // Explorador: Balanced
    { id: 'scout', name: 'Explorador', life: 6, food: 6, weapons: 0, shield: 0, bonus: 'Balanced', icon: '🧭', passive: null },
    // Tanque (antes Escudero): Empieza con escudo
    { id: 'tank', name: 'Tanque', life: 5, food: 6, weapons: 0, shield: 1, bonus: 'Escudo', icon: '🛡️', passive: 'Empieza con escudo' },
    // Científico: Portal al inicio (salta 5 casillas, 1 sola vez)
    { id: 'scientist', name: 'Científico', life: 5, food: 6, weapons: 0, shield: 0, bonus: 'Portal', icon: '🔬', passive: 'Portal inicial', hasPortal: true },
    // Vendedor: Descuento en el mercado
    { id: 'vendor', name: 'Vendedor', life: 5, food: 6, weapons: 0, shield: 0, bonus: 'Descuento', icon: '🛒', passive: 'Descuento en mercado', marketDiscount: true }
];

// MAX_RESOURCES: Límite máximo de cada recurso
export const MAX_RESOURCES = {
    life: 6,
    food: 15,
    weapons: 5,
    shield: 5
};

// HUNGER_INTERVAL: Cada cuántos turnos se consume comida
export const HUNGER_INTERVAL = 3;

// Helper para aplicar límites
export const clampResource = (value, resource) => Math.max(0, Math.min(value, MAX_RESOURCES[resource]));

// Helper para efectos (se pasarán stats por referencia)
export const LUCK_CARDS = [
    { title: "Sopa en Lata", desc: "+2 Comida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 2, 'food'); } },
    { title: "Botiquín", desc: "+1 Vida", type: "loot", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Munición", desc: "+1 Arma", type: "loot", effect: (s) => { s.weapons = clampResource(s.weapons + 1, 'weapons'); } },
    { title: "Escudo Improvisado", desc: "+1 Escudo", type: "loot", effect: (s) => { s.shield = clampResource(s.shield + 1, 'shield'); } },
    { title: "Suministros", desc: "+1 Comida, +1 Vida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 1, 'food'); s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Armería Secreta", desc: "+2 Armas", type: "loot", effect: (s) => { s.weapons = clampResource(s.weapons + 2, 'weapons'); } },
    { title: "Almacén Oculto", desc: "+3 Comida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 3, 'food'); } },
    { title: "Kit Médico Militar", desc: "+2 Vida", type: "loot", effect: (s) => { s.life = clampResource(s.life + 2, 'life'); } },
    { title: "Armadura Táctica", desc: "+2 Escudos", type: "loot", effect: (s) => { s.shield = clampResource(s.shield + 2, 'shield'); } },
    {
        title: "Caja de Suministros", desc: "+1 de todo", type: "loot", effect: (s) => {
            s.food = clampResource(s.food + 1, 'food');
            s.life = clampResource(s.life + 1, 'life');
            s.weapons = clampResource(s.weapons + 1, 'weapons');
        }
    }
];

export const EVENT_CARDS = [
    { title: "Lluvia Ácida", desc: "-1 Vida", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 1); } },
    { title: "Comida Podrida", desc: "-1 Comida", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Mercenario", desc: "-1 Comida", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Descanso", desc: "+1 Vida", type: "event", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Trampa", desc: "-1 Vida", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 1); } },
    { title: "Zombie Errante", desc: "¡Combate!", type: "combat", enemyCount: 1, enemyType: "zombie" },
    { title: "Bandido", desc: "¡Combate!", type: "combat", enemyCount: 1, enemyType: "bandido" },
    { title: "Horda de Zombies", desc: "¡2 Zombies!", type: "combat", enemyCount: 2, enemyType: "zombie" },
    { title: "Emboscada", desc: "-1 Arma", type: "hazard", effect: (s) => { s.weapons = Math.max(0, s.weapons - 1); } },
    { title: "Ladrón Silencioso", desc: "-2 Comida", type: "hazard", effect: (s) => { s.food = Math.max(0, s.food - 2); } },
    {
        title: "Refugio Temporal", desc: "+1 Vida, +1 Comida", type: "event", effect: (s) => {
            s.life = clampResource(s.life + 1, 'life');
            s.food = clampResource(s.food + 1, 'food');
        }
    },
    { title: "Escudo Roto", desc: "-1 Escudo", type: "hazard", effect: (s) => { s.shield = Math.max(0, s.shield - 1); } }
];
