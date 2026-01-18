// Tipos de Casillas para el tablero
// Por ahora distribuidos aleatoriamente, después se pueden asignar específicamente

export const TILE_TYPES = {
    NORMAL: { id: 'normal', icon: '', color: '#f7f5e6', description: 'Casilla normal' },
    ZOMBIE: { id: 'zombie', icon: '🧟', color: '#4ade80', description: 'Casilla de Zombie - Combate automático' },
    EVENT: { id: 'event', icon: '❓', color: '#fbbf24', description: 'Casilla de Evento - Carta aleatoria' },
    LUCK: { id: 'luck', icon: '🍀', color: '#a78bfa', description: 'Casilla de Suerte - Carta de loot' },
    SAFE: { id: 'safe', icon: '🏠', color: '#60a5fa', description: 'Casilla Segura - Descanso' },
    MARKET: { id: 'market', icon: '🏪', color: '#f472b6', description: 'Mercado - Comprar/Vender recursos' }
};

// Distribución de tipos por defecto (se puede personalizar después)
// Key = tile ID, Value = tile type
export const TILE_TYPE_MAP = {
    '0': 'SAFE',      // Inicio
    '3': 'EVENT',     // Early event
    '5': 'LUCK',
    '7': 'ZOMBIE',    // First zombie
    '10': 'EVENT',    // Junction event
    '12': 'ZOMBIE',
    '14': 'LUCK',
    '15': 'MARKET',   // First market!
    '17': 'EVENT',
    '20': 'ZOMBIE',
    '22': 'LUCK',
    '25': 'SAFE',     // Safe zone
    '27': 'EVENT',
    '30': 'ZOMBIE',
    '33': 'LUCK',
    '35': 'EVENT',
    '38': 'ZOMBIE',
    '40': 'LUCK',
    '42': 'EVENT',
    '44': 'MARKET',   // Mid-game market
    '45': 'ZOMBIE',
    '48': 'SAFE',     // Safe zone
    '50': 'EVENT',    // Junction event
    '52': 'ZOMBIE',
    '55': 'LUCK',
    '58': 'EVENT',
    '60': 'ZOMBIE',
    '63': 'LUCK',
    '65': 'EVENT',
    '68': 'ZOMBIE',
    '70': 'LUCK',
    '72': 'EVENT',
    '73': 'MARKET',   // Last market before finale
    '75': 'ZOMBIE',   // Final stretch zombie
    '78': 'LUCK',     // Last loot chance
    '80': 'SAFE',     // Meta - Victory!
};

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
