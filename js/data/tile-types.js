// Tipos de Casillas para el tablero
// Por ahora distribuidos aleatoriamente, después se pueden asignar específicamente

export const TILE_TYPES = {
    NORMAL: { id: 'normal', icon: '', color: '#f7f5e6', description: 'Casilla normal' },
    ZOMBIE: { id: 'zombie', icon: '🧟', color: '#4ade80', description: 'Casilla de Zombie - Combate automático' },
    EVENT: { id: 'event', icon: '❓', color: '#fbbf24', description: 'Casilla de Evento - Carta aleatoria' },
    LUCK: { id: 'luck', icon: '🍀', color: '#a78bfa', description: 'Casilla de Suerte - Carta de loot' },
    SAFE: { id: 'safe', icon: '🏠', color: '#60a5fa', description: 'Casilla Segura - Descanso' }
};

// Distribución de tipos por defecto (se puede personalizar después)
// Key = tile ID, Value = tile type
export const TILE_TYPE_MAP = {
    '0': 'SAFE',      // Inicio
    '5': 'EVENT',
    '7': 'LUCK',
    '12': 'ZOMBIE',
    '15': 'EVENT',
    '20': 'LUCK',
    '22': 'ZOMBIE',
    '25': 'SAFE',
    '28': 'EVENT',
    '30': 'ZOMBIE',
    '35': 'LUCK',
    '40': 'ZOMBIE',
    '45': 'EVENT',
    '48': 'SAFE',
    '52': 'ZOMBIE',
    '55': 'LUCK',
    '60': 'EVENT',
    '65': 'ZOMBIE',
    '70': 'LUCK',
    '75': 'EVENT',
    '80': 'SAFE',     // Meta
};

// Helper para obtener tipo de casilla
export function getTileType(tileId) {
    const typeKey = TILE_TYPE_MAP[String(tileId)];
    return typeKey ? TILE_TYPES[typeKey] : TILE_TYPES.NORMAL;
}

// Helper para verificar si casilla tiene evento
export function hasTileEvent(tileId) {
    const type = getTileType(tileId);
    return type.id !== 'normal' && type.id !== 'safe';
}
