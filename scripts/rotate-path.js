// Script para rotar el recorrido 90 grados y moverlo a la esquina inferior derecha
// Intercambia X e Y, y ajusta para que quede en la posición correcta

const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('js/data/map-data.js', 'utf8');

// Dimensiones del tablero
const boardWidth = 850;
const boardHeight = 1400;

// Primero, extraer todos los tiles
const tilesMatch = content.match(/"tiles": \[([\s\S]*?)\]/);
if (!tilesMatch) {
    console.log('Error: No se encontraron tiles');
    process.exit(1);
}

// Rotar 90 grados: newX = oldY, newY = boardWidth - oldX
// Luego ajustar para posicionar en la parte inferior derecha
content = content.replace(/"x": (\d+), "y": (\d+)/g, (match, x, y) => {
    const oldX = parseInt(x);
    const oldY = parseInt(y);

    // Rotar 90 grados clockwise
    let newX = oldY;
    let newY = boardWidth - oldX;

    // Ajustar escala para que quepa verticalmente
    // El rango original de Y era ~0-780, ahora será X
    // Escalar para que use más del ancho del tablero
    newX = Math.round(newX * 0.6) + 200;  // Escalar y centrar

    // Ajustar Y para que esté en la parte inferior pero con espacio para subir
    newY = Math.round(newY * 1.5) + 100;

    return `"x": ${newX}, "y": ${newY}`;
});

// Guardar el archivo
fs.writeFileSync('js/data/map-data.js', content);

console.log('✅ Recorrido rotado 90 grados y posicionado verticalmente.');
console.log('Ahora el inicio está en la parte inferior derecha y sube hacia arriba.');
