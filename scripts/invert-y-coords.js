// Script para invertir coordenadas Y del mapa
// El recorrido irá de abajo hacia arriba

const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('js/data/map-data.js', 'utf8');

// Altura del tablero (para invertir Y)
const boardHeight = 750;

// Invertir cada coordenada Y
// Formato: "y": número
content = content.replace(/"y": (\d+)/g, (match, y) => {
    const newY = boardHeight - parseInt(y);
    return `"y": ${newY}`;
});

// Guardar el archivo
fs.writeFileSync('js/data/map-data.js', content);

console.log('✅ Coordenadas Y invertidas! El recorrido ahora va de abajo hacia arriba.');
