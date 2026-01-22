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
    // === COMIDA ===
    { title: "Sopa en Lata", desc: "+2 Comida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 2, 'food'); } },
    { title: "Almacén Oculto", desc: "+3 Comida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 3, 'food'); } },
    { title: "Ración de Emergencia", desc: "+4 Comida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 4, 'food'); } },

    // === VIDA ===
    { title: "Botiquín", desc: "+1 Vida", type: "loot", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Kit Médico Militar", desc: "+2 Vida", type: "loot", effect: (s) => { s.life = clampResource(s.life + 2, 'life'); } },
    { title: "Antídoto", desc: "+1 Vida, cura veneno", type: "loot", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },

    // === ARMAS ===
    { title: "Munición", desc: "+1 Arma", type: "loot", effect: (s) => { s.weapons = clampResource(s.weapons + 1, 'weapons'); } },
    { title: "Armería Secreta", desc: "+2 Armas", type: "loot", effect: (s) => { s.weapons = clampResource(s.weapons + 2, 'weapons'); } },
    { title: "Cargador Extra", desc: "+1 Arma", type: "loot", effect: (s) => { s.weapons = clampResource(s.weapons + 1, 'weapons'); } },

    // === ESCUDO ===
    { title: "Escudo Improvisado", desc: "+1 Escudo", type: "loot", effect: (s) => { s.shield = clampResource(s.shield + 1, 'shield'); } },
    { title: "Armadura Táctica", desc: "+2 Escudos", type: "loot", effect: (s) => { s.shield = clampResource(s.shield + 2, 'shield'); } },
    { title: "Chaleco Antibalas", desc: "+1 Escudo", type: "loot", effect: (s) => { s.shield = clampResource(s.shield + 1, 'shield'); } },

    // === COMBINADOS ===
    { title: "Suministros", desc: "+1 Comida, +1 Vida", type: "loot", effect: (s) => { s.food = clampResource(s.food + 1, 'food'); s.life = clampResource(s.life + 1, 'life'); } },
    {
        title: "Caja de Suministros", desc: "+1 de todo", type: "loot", effect: (s) => {
            s.food = clampResource(s.food + 1, 'food');
            s.life = clampResource(s.life + 1, 'life');
            s.weapons = clampResource(s.weapons + 1, 'weapons');
        }
    },
    {
        title: "Jackpot Militar", desc: "+2 de todo", type: "loot", effect: (s) => {
            s.food = clampResource(s.food + 2, 'food');
            s.life = clampResource(s.life + 2, 'life');
            s.weapons = clampResource(s.weapons + 2, 'weapons');
            s.shield = clampResource(s.shield + 1, 'shield');
        }
    }
];

export const EVENT_CARDS = [
    // === PELIGROS (Hazards) ===
    { title: "Lluvia Ácida", desc: "-1 Vida", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 1); } },
    { title: "Trampa", desc: "-1 Vida", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 1); } },
    { title: "Mina Enterrada", desc: "-2 Vida", type: "hazard", effect: (s) => { s.life = Math.max(0, s.life - 2); } },
    { title: "Emboscada", desc: "-1 Arma", type: "hazard", effect: (s) => { s.weapons = Math.max(0, s.weapons - 1); } },
    { title: "Escudo Roto", desc: "-1 Escudo", type: "hazard", effect: (s) => { s.shield = Math.max(0, s.shield - 1); } },
    { title: "Ladrón Silencioso", desc: "-2 Comida", type: "hazard", effect: (s) => { s.food = Math.max(0, s.food - 2); } },
    { title: "Comida Podrida", desc: "-1 Comida", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Rata Hambrienta", desc: "-1 Comida", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },

    // === EVENTOS POSITIVOS ===
    { title: "Descanso", desc: "+1 Vida", type: "event", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    { title: "Fuente de Agua", desc: "+1 Comida", type: "event", effect: (s) => { s.food = clampResource(s.food + 1, 'food'); } },
    { title: "Cartel de Ayuda", desc: "+1 Vida", type: "event", effect: (s) => { s.life = clampResource(s.life + 1, 'life'); } },
    {
        title: "Refugio Temporal", desc: "+1 Vida, +1 Comida", type: "event", effect: (s) => {
            s.life = clampResource(s.life + 1, 'life');
            s.food = clampResource(s.food + 1, 'food');
        }
    },
    {
        title: "Campamento Abandonado", desc: "+2 Comida", type: "event", effect: (s) => {
            s.food = clampResource(s.food + 2, 'food');
        }
    },

    // === COMBATE ===
    { title: "Zombie Errante", desc: "¡Combate!", type: "combat", enemyCount: 1, enemyType: "zombie" },
    { title: "Bandido", desc: "¡Combate!", type: "combat", enemyCount: 1, enemyType: "bandido" },
    { title: "Horda de Zombies", desc: "¡2 Zombies!", type: "combat", enemyCount: 2, enemyType: "zombie" },
    { title: "Patrulla de Bandidos", desc: "¡2 Bandidos!", type: "combat", enemyCount: 2, enemyType: "bandido" },

    // === EVENTOS ESPECIALES ===
    {
        title: "Mercenario", desc: "Ofrece ayuda por comida", type: "choice", options: [
            { text: "Aceptar (-2 🍗, +1 ⚔️)", effect: (s) => { s.food = Math.max(0, s.food - 2); s.weapons = clampResource(s.weapons + 1, 'weapons'); } },
            { text: "Rechazar", effect: () => { } }
        ]
    },
    {
        title: "Superviviente Herido", desc: "Pide ayuda", type: "choice", options: [
            { text: "Ayudar (-1 🍗, +1 ❤️)", effect: (s) => { s.food = Math.max(0, s.food - 1); s.life = clampResource(s.life + 1, 'life'); } },
            { text: "Ignorar", effect: () => { } }
        ]
    }
];
