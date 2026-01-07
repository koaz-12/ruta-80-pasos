// Generación del Grafo del Mapa (80 Pasos)

export function buildGraph() {
    const graph = {};
    const linkSequence = (start, end) => {
        for (let i = start; i < end; i++) graph[String(i)] = { next: String(i + 1) };
    };

    // ZONA 1: El Inicio (1-10)
    linkSequence(1, 10);
    graph['10'] = { next: ['11', '11b', '11c'], branchInfo: [{ id: '11', label: 'Alto', hazard: 'Normal' }, { id: '11b', label: 'Medio', hazard: 'Eventos' }, { id: '11c', label: 'Bajo', hazard: 'Rápido' }] };

    // ZONA 2: La Triple Vía (11-25)
    linkSequence(11, 18); // A
    linkSequence(11, 12); graph['11b'] = { next: '12b' }; linkSequence(12, 18, 'b');
    ['b', 'c'].forEach(suffix => {
        graph[`11${suffix}`] = { next: `12${suffix}` };
        graph[`12${suffix}`] = { next: `13${suffix}` };
        graph[`13${suffix}`] = { next: `14${suffix}` };
        graph[`14${suffix}`] = { next: `15${suffix}` };
        if (suffix === 'c') graph[`15${suffix}`] = { next: '18' };
        else { graph[`15${suffix}`] = { next: `16${suffix}` }; graph[`16${suffix}`] = { next: `17${suffix}` }; graph[`17${suffix}`] = { next: '18' }; }
    });

    // Convergencia en 18
    linkSequence(18, 25);
    graph['25'] = { next: ['26', '26b'], branchInfo: [{ id: '26', label: 'Cuesta Arriba', hazard: 'Difícil' }, { id: '26b', label: 'Túnel', hazard: 'Seguro?' }] };

    // ZONAS 3-6
    linkSequence(26, 31); graph['31'] = { next: '34' };
    const bPath = [26, 27, 28, 29, 30, 31, 32, 33];
    bPath.forEach(n => graph[`${n}b`] = { next: `${n + 1}b` });
    graph['33b'] = { next: '34' };

    linkSequence(34, 50);
    graph['50'] = { next: ['51', '51b'], branchInfo: [{ id: '51', label: 'Ruta Segura', hazard: 'Largo' }, { id: '51b', label: 'Atajo Mortal', hazard: 'Combate' }] };
    linkSequence(51, 65);
    for (let i = 51; i < 60; i++) graph[`${i}b`] = { next: `${i + 1}b` };
    graph['60b'] = { next: '65' };
    linkSequence(65, 80);
    graph['80'] = { next: null };

    return graph;
}
