// Mover todo el recorrido 50px a la izquierda
const fs = require('fs');
let content = fs.readFileSync('js/data/map-data.js', 'utf8');

content = content.replace(/"x": (\d+)/g, (match, x) => {
    const newX = Math.max(30, parseInt(x) - 50);
    return `"x": ${newX}`;
});

fs.writeFileSync('js/data/map-data.js', content);
console.log('✅ Movido 50px hacia la izquierda');
