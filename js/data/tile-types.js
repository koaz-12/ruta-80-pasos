// Tipos de Casillas para el tablero
// Por ahora distribuidos aleatoriamente, después se pueden asignar específicamente

export const TILE_TYPES = {
    NORMAL: { id: 'normal', icon: '', color: '#f7f5e6', description: 'Casilla normal' },
    ZOMBIE: { id: 'zombie', icon: '🧟', color: '#4ade80', description: 'Casilla de Zombie - Combate automático' },
    ZOMBIE_BOSS: { id: 'zombie_boss', icon: '💀', color: '#dc2626', description: 'BOSS ZOMBIE - Obligatorio vencer para ganar' },
    EVENT: { id: 'event', icon: '❓', color: '#fbbf24', description: 'Casilla de Evento - Carta aleatoria' },
    LUCK: { id: 'luck', icon: '🍀', color: '#a78bfa', description: 'Casilla de Suerte - Carta de loot' },
    SAFE: { id: 'safe', icon: '🏠', color: '#60a5fa', description: 'Casilla Segura - Descanso' },
    MARKET: { id: 'market', icon: '🏪', color: '#f472b6', description: 'Mercado - Comprar/Vender recursos' }
};

// Distribución de tipos por defecto
// Zombies distribuidos por nivel según posición en tablero
export const TILE_TYPE_MAP = {
    '0': 'SAFE',      // Inicio
    '3': 'EVENT',
    '5': 'LUCK',
    // === ZONA 1-15: Zombies Nivel 1 ===
    '7': 'ZOMBIE',    // Zombie Lvl 1
    '10': 'EVENT',    // Junction event
    '12': 'ZOMBIE',   // Zombie Lvl 1
    '14': 'LUCK',
    '15': 'MARKET',   // First market!
    '17': 'EVENT',
    // === ZONA 20-35: Zombies Nivel 2 ===
    '22': 'LUCK',
    '23': 'ZOMBIE',   // Zombie Lvl 2
    '25': 'SAFE',     // Safe zone
    '27': 'EVENT',
    '30': 'ZOMBIE',   // Zombie Lvl 2
    '33': 'LUCK',
    '35': 'EVENT',
    '38': 'LUCK',
    '40': 'LUCK',
    '42': 'EVENT',
    '44': 'MARKET',   // Mid-game market
    // === ZONA 45-55: Zombies Nivel 3 ===
    '47': 'ZOMBIE',   // Zombie Lvl 3
    '48': 'SAFE',     // Safe zone
    '50': 'EVENT',    // Junction event
    '52': 'ZOMBIE',   // Zombie Lvl 3
    '55': 'LUCK',
    '58': 'EVENT',
    // === ZONA 60-70: Zombies Nivel 3 ===
    '62': 'ZOMBIE',   // Zombie Lvl 3
    '63': 'LUCK',
    '65': 'EVENT',
    '68': 'ZOMBIE',   // Zombie Lvl 3
    '70': 'LUCK',
    '72': 'EVENT',
    '73': 'MARKET',   // Last market before finale
    '75': 'LUCK',
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
