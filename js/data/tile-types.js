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

// Distribución de tipos para las 80 casillas
// Zombies y Bandidos distribuidos por nivel según posición en tablero
// Balance: ~15 ZOMBIE, 5 BANDIT, 12 EVENT, 12 LUCK, 8 FOOD, 4 MARKET, 5 SAFE, 1 BOSS, resto NORMAL
export const TILE_TYPE_MAP = {
    // === INICIO ===
    '0': 'SAFE',      // Inicio - Zona segura

    // === ZONA 1-15: Tutorial / Nivel 1 ===
    '1': 'NORMAL',
    '2': 'LUCK',      // Primer loot
    '3': 'EVENT',
    '4': 'NORMAL',
    '5': 'FOOD',      // Primera comida
    '6': 'NORMAL',
    '7': 'ZOMBIE',    // Primer zombie (Lvl 1)
    '8': 'LUCK',
    '9': 'EVENT',
    '10': 'NORMAL',
    '11': 'BANDIT',   // Primer bandido (Lvl 1)
    '12': 'ZOMBIE',   // Zombie Lvl 1
    '13': 'LUCK',
    '14': 'FOOD',
    '15': 'MARKET',   // Primer mercado

    // === ZONA 16-30: Nivel 2 ===
    '16': 'NORMAL',
    '17': 'EVENT',
    '18': 'ZOMBIE',   // Zombie Lvl 2
    '19': 'LUCK',
    '20': 'SAFE',     // Checkpoint
    '21': 'NORMAL',
    '22': 'EVENT',
    '23': 'ZOMBIE',   // Zombie Lvl 2
    '24': 'BANDIT',   // Bandido Lvl 2
    '25': 'LUCK',
    '26': 'FOOD',
    '27': 'EVENT',
    '28': 'NORMAL',
    '29': 'ZOMBIE',   // Zombie Lvl 2
    '30': 'MARKET',   // Segundo mercado

    // === ZONA 31-45: Nivel 2-3 Transición ===
    '31': 'LUCK',
    '32': 'NORMAL',
    '33': 'EVENT',
    '34': 'ZOMBIE',   // Zombie Lvl 2
    '35': 'FOOD',
    '36': 'NORMAL',
    '37': 'BANDIT',   // Bandido Lvl 3
    '38': 'LUCK',
    '39': 'EVENT',
    '40': 'SAFE',     // Checkpoint
    '41': 'NORMAL',
    '42': 'ZOMBIE',   // Zombie Lvl 3
    '43': 'EVENT',
    '44': 'LUCK',
    '45': 'MARKET',   // Tercer mercado (mid-game)

    // === ZONA 46-60: Nivel 3 ===
    '46': 'FOOD',
    '47': 'ZOMBIE',   // Zombie Lvl 3
    '48': 'NORMAL',
    '49': 'EVENT',
    '50': 'LUCK',
    '51': 'ZOMBIE',   // Zombie Lvl 3
    '52': 'NORMAL',
    '53': 'EVENT',
    '54': 'FOOD',
    '55': 'BANDIT',   // Bandido Lvl 3
    '56': 'LUCK',
    '57': 'ZOMBIE',   // Zombie Lvl 3
    '58': 'EVENT',
    '59': 'NORMAL',
    '60': 'SAFE',     // Último checkpoint

    // === ZONA 61-78: Zona Final ===
    '61': 'LUCK',
    '62': 'ZOMBIE',   // Zombie Lvl 3
    '63': 'EVENT',
    '64': 'FOOD',
    '65': 'ZOMBIE',   // Zombie Lvl 3
    '66': 'LUCK',
    '67': 'NORMAL',
    '68': 'EVENT',
    '69': 'ZOMBIE',   // Zombie Lvl 3
    '70': 'FOOD',
    '71': 'BANDIT',   // Último bandido (Lvl 3)
    '72': 'LUCK',
    '73': 'MARKET',   // Último mercado
    '74': 'EVENT',
    '75': 'ZOMBIE',   // Zombie Lvl 3
    '76': 'LUCK',
    '77': 'FOOD',     // Última comida antes del boss
    '78': 'LUCK',     // Último loot

    // === BOSS Y META ===
    '79': 'ZOMBIE_BOSS',  // BOSS - Obligatorio vencer
    '80': 'SAFE'          // META - Victoria!
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
