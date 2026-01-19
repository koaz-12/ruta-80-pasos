// Tipos de Casillas para el tablero
// Por ahora distribuidos aleatoriamente, después se pueden asignar específicamente

export const TILE_TYPES = {
    NORMAL: { id: 'normal', icon: '', color: '#f7f5e6', description: 'Casilla normal' },
    ZOMBIE: { id: 'zombie', icon: '🧟', color: '#4ade80', description: 'Casilla de Zombie - Combate automático' },
    ZOMBIE_BOSS: { id: 'zombie_boss', icon: '💀', color: '#dc2626', description: 'BOSS ZOMBIE - Obligatorio vencer para ganar' },
    BANDIT: { id: 'bandit', icon: '🗡️', color: '#f59e0b', description: 'Casilla de Bandido - Combate contra bandidos' },
    EVENT: { id: 'event', icon: '❓', color: '#fbbf24', description: 'Casilla de Evento - Carta aleatoria' },
    LUCK: { id: 'luck', icon: '🍀', color: '#a78bfa', description: 'Casilla de Suerte - Carta de loot' },
    SAFE: { id: 'safe', icon: '🏠', color: '#60a5fa', description: 'Casilla Segura - Descanso' },
    MARKET: { id: 'market', icon: '🏪', color: '#f472b6', description: 'Mercado - Comprar/Vender recursos' },
    FOOD: { id: 'food', icon: '🍗', color: '#84cc16', description: 'Casilla de Comida - Obtén 4 🍗' }
};

// Distribución de tipos por defecto
// Zombies y Bandidos distribuidos por nivel según posición en tablero
export const TILE_TYPE_MAP = {
    '0': 'SAFE',      // Inicio
    '3': 'EVENT',
    '5': 'LUCK',
    // === ZONA 1-15: Zombies Nivel 1 ===
    '7': 'ZOMBIE',    // Zombie Lvl 1
    '9': 'FOOD',      // Comida +4 🍗
    // === Bandido Nivel 1 (10-15) ===
    '11': 'BANDIT',   // Bandido Lvl 1
    '12': 'ZOMBIE',   // Zombie Lvl 1
    '14': 'LUCK',
    '15': 'MARKET',   // First market!
    '17': 'EVENT',
    // === ZONA 20-35: Zombies Nivel 2 ===
    '22': 'LUCK',
    // === Bandido Nivel 2 (21-25) ===
    '24': 'BANDIT',   // Bandido Lvl 2
    '25': 'SAFE',     // Safe zone
    '27': 'EVENT',
    '29': 'FOOD',     // Comida +4 🍗
    '30': 'ZOMBIE',   // Zombie Lvl 2
    '33': 'LUCK',
    '35': 'EVENT',
    // === Bandido Nivel 3 (35-40) ===
    '37': 'BANDIT',   // Bandido Lvl 3
    '40': 'LUCK',
    '42': 'EVENT',
    '44': 'MARKET',   // Mid-game market
    // === ZONA 45-55: Zombies Nivel 3 ===
    '46': 'FOOD',     // Comida +4 🍗
    '47': 'ZOMBIE',   // Zombie Lvl 3
    '48': 'SAFE',     // Safe zone
    '50': 'EVENT',    // Junction event
    '52': 'ZOMBIE',   // Zombie Lvl 3
    '55': 'LUCK',
    // === Bandido Nivel 3 (55-60) ===
    '57': 'BANDIT',   // Bandido Lvl 3
    '58': 'EVENT',
    // === ZONA 60-70: Zombies Nivel 3 ===
    '62': 'ZOMBIE',   // Zombie Lvl 3
    '63': 'LUCK',
    '65': 'EVENT',
    '68': 'ZOMBIE',   // Zombie Lvl 3
    '70': 'LUCK',
    '71': 'FOOD',     // Comida +4 🍗
    '72': 'EVENT',
    '73': 'MARKET',   // Last market before finale
    '75': 'LUCK',
    '77': 'FOOD',     // Comida +4 🍗 (última antes del boss)
    '78': 'LUCK',     // Last loot chance
    // === CASILLA 79: BOSS ZOMBIE Nivel 4 (obligatorio) ===
    '79': 'ZOMBIE_BOSS',
    '80': 'SAFE',     // Meta - Victory!
};

// Nivel de zombie según casilla
// Casillas 1-15: Nivel 1, 20-35: Nivel 2, 45-70: Nivel 3, 79: Nivel 4 (Boss)
export function getZombieLevel(tileId) {
    const id = parseInt(String(tileId).replace(/[^\d]/g, '')) || 0;

    if (id === 79) return 4; // Boss zombie
    if (id >= 60) return 3;
    if (id >= 45) return 3;
    if (id >= 20) return 2;
    return 1;
}

// Nivel de bandido según casilla
// 10-15: Nivel 1, 21-25: Nivel 2, 35-40 y 55-60: Nivel 3
export function getBanditLevel(tileId) {
    const id = parseInt(String(tileId).replace(/[^\d]/g, '')) || 0;

    if (id >= 55 && id <= 60) return 3;
    if (id >= 35 && id <= 40) return 3;
    if (id >= 21 && id <= 25) return 2;
    if (id >= 10 && id <= 15) return 1;
    return 1; // Default
}

// Helper para obtener tipo de casilla
export function getTileType(tileId) {
    const typeKey = TILE_TYPE_MAP[String(tileId)];
    return typeKey ? TILE_TYPES[typeKey] : TILE_TYPES.NORMAL;
}

// Helper para verificar si casilla tiene evento
export function hasTileEvent(tileId) {
    const type = getTileType(tileId);
    // All special tiles have events (except normal)
    return type.id !== 'normal';
}

// Check if tile is boss zombie (must defeat to win)
export function isBossZombie(tileId) {
    return getTileType(tileId).id === 'zombie_boss';
}
