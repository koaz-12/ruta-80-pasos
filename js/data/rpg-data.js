// Configuración de RPG: Clases y Cartas

export const CLASSES = [
    { id: 'medic', name: 'Curandero', life: 4, food: 2, weapons: 0, bonus: 'Vida+' },
    { id: 'soldier', name: 'Combatiente', life: 3, food: 2, weapons: 1, bonus: 'Doble Dado' },
    { id: 'scout', name: 'Explorador', life: 3, food: 3, weapons: 0, bonus: 'Comida+' },
    { id: 'tank', name: 'Escudero', life: 3, food: 2, weapons: 0, bonus: 'Defensa' }
];

// Helper para efectos (se pasarán stats por referencia)
// Nota: En arquitectura pura, los efectos podrían ser IDs procesados por el motor,
// pero mantenemos funciones simples por el prototipo.
export const LUCK_CARDS = [
    { title: "Sopa en Lata", desc: "Encuentras comida en buen estado. (+2 Comida)", type: "loot", effect: (s) => { s.food += 2; } },
    { title: "Botiquín", desc: "Un kit de primeros auxilios básico. (+1 Vida)", type: "loot", effect: (s) => { s.life = Math.min(s.life + 1, 5); } },
    { title: "Munición", desc: "Encuentras un arma mejor. (+1 Dado permanente)", type: "loot", effect: (s) => { s.weapons += 1; } },
    { title: "Adrenalina", desc: "Te sientes imparable. (Recupera aliento)", type: "loot", effect: (s) => { s.food += 1; } },
    { title: "Mochila", desc: "Mejoras tu equipo. (+1 Comida)", type: "loot", effect: (s) => { s.food += 1; } }
];

export const EVENT_CARDS = [
    { title: "Lluvia Ácida", desc: "El cielo se oscurece y quema. (-1 Vida)", type: "hazard", id: 'DAMAGE_1' },
    { title: "Comida Podrida", desc: "Te sentó mal la cena. (-1 Comida)", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Mercenario", desc: "Te roba suministros. (-1 Comida)", type: "event", effect: (s) => { s.food = Math.max(0, s.food - 1); } },
    { title: "Descanso", desc: "Un momento de paz. (+1 Vida)", type: "event", effect: (s) => { s.life = Math.min(s.life + 1, 5); } },
    { title: "Trampa", desc: "Caes en un hoyo. (-1 Vida)", type: "hazard", id: 'DAMAGE_1' }
];
