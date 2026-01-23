// Script para rotar el recorrido 90 grados correctamente
// Mantiene todo dentro del tablero 850x1400

const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('js/data/map-data.js', 'utf8');

// Dimensiones del tablero
const boardWidth = 850;
const boardHeight = 1400;

// Extraer todas las coordenadas para analizar el rango
const coords = [];
const regex = /"x": (\d+), "y": (\d+)/g;
let match;
while ((match = regex.exec(content)) !== null) {
    coords.push({ x: parseInt(match[1]), y: parseInt(match[2]) });
}

// Calcular rangos
const minX = Math.min(...coords.map(c => c.x));
const maxX = Math.max(...coords.map(c => c.x));
const minY = Math.min(...coords.map(c => c.y));
const maxY = Math.max(...coords.map(c => c.y));

console.log(`Rango original: X=[${minX}, ${maxX}], Y=[${minY}, ${maxY}]`);

const rangoX = maxX - minX;
const rangoY = maxY - minY;

// Rotar 90 grados: 
// - El ancho original (rangoX) se convierte en altura
// - La altura original (rangoY) se convierte en ancho
// Escalar para que quepa

const escalaX = (boardWidth - 100) / rangoY;   // Y original -> X nuevo
const escalaY = (boardHeight - 200) / rangoX;  // X original -> Y nuevo

console.log(`Escalas: X=${escalaX.toFixed(2)}, Y=${escalaY.toFixed(2)}`);

// Aplicar rotación y escalado
content = content.replace(/"x": (\d+), "y": (\d+)/g, (match, x, y) => {
    const oldX = parseInt(x);
    const oldY = parseInt(y);

    // Rotar 90 grados clockwise y escalar
    // newX basado en oldY (invertido para que inicio quede a la derecha)
    // newY basado en oldX (invertido para que inicio quede abajo)
    let newX = Math.round((maxY - oldY) * escalaX) + 50;
    let newY = Math.round((oldX - minX) * escalaY) + 100;

    // Asegurar que esté dentro del tablero
    newX = Math.max(30, Math.min(boardWidth - 30, newX));
    newY = Math.max(30, Math.min(boardHeight - 30, newY));

    return `"x": ${newX}, "y": ${newY}`;
});

// Guardar el archivo
fs.writeFileSync('js/data/map-data.js', content);

console.log('✅ Recorrido rotado 90 grados correctamente.');
console.log('Todo cabe dentro del tablero 850x1400.');
