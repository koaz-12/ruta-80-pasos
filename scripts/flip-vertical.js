// Script para invertir verticalmente (flip) el recorrido
// Lo que está abajo va arriba y viceversa

const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('js/data/map-data.js', 'utf8');

// Altura del tablero
const boardHeight = 1400;

// Invertir Y: newY = boardHeight - oldY
content = content.replace(/"y": (\d+)/g, (match, y) => {
    const oldY = parseInt(y);
    const newY = boardHeight - oldY;
    return `"y": ${newY}`;
});

// Guardar el archivo
fs.writeFileSync('js/data/map-data.js', content);

console.log('✅ Recorrido invertido verticalmente.');
console.log('Lo que estaba abajo ahora está arriba y viceversa.');
