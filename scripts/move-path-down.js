// Script para mover todo el recorrido hacia la parte inferior del tablero
// Añade un offset a todas las coordenadas Y

const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('js/data/map-data.js', 'utf8');

// El tablero tiene 1400px de altura
// Las coordenadas actuales van aprox de 0 a 780
// Queremos que el inicio esté cerca de Y=1200-1300

const yOffset = 500; // Mover todo 500px hacia abajo

// Añadir offset a cada coordenada Y
content = content.replace(/"y": (\d+)/g, (match, y) => {
    const newY = parseInt(y) + yOffset;
    return `"y": ${newY}`;
});

// Guardar el archivo
fs.writeFileSync('js/data/map-data.js', content);

console.log(`✅ Todas las coordenadas Y movidas ${yOffset}px hacia abajo.`);
console.log('El inicio ahora está en la parte inferior del tablero.');
