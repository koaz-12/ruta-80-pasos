// Generación del Grafo del Mapa (80 Pasos)

export function buildGraph() {
    const graph = {};
    const linkSequence = (start, end) => {
        for (let i = start; i < end; i++) graph[String(i)] = { next: String(i + 1) };
    };

    // ZONA 0: El Icono de Inicio -> Entrada (5062)
    graph['0'] = { next: '5062' };
    graph['5062'] = { next: '6057' };
    graph['6057'] = { next: '6055' };
    graph['6055'] = { next: '6056' };
    graph['6056'] = { next: '6053' };
    graph['6053'] = { next: '6054' };
    graph['6054'] = { next: '1' };

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

export const SAVED_LAYOUT = { "tiles": [{ "id": "0", "display": "0", "x": 44, "y": 684 }, { "id": "2", "display": "2", "x": 549, "y": 710 }, { "id": "5", "display": "5", "x": 739, "y": 643 }, { "id": "6", "display": "6", "x": 803, "y": 641 }, { "id": "7", "display": "7", "x": 869, "y": 640 }, { "id": "8", "display": "8", "x": 933, "y": 641 }, { "id": "2015", "display": "15", "x": 953, "y": 711 }, { "id": "2016", "display": "16", "x": 1125, "y": 716 }, { "id": "47", "display": "47", "x": 506, "y": 13 }, { "id": "49", "display": "49", "x": 445, "y": 71 }, { "id": "50", "display": "50", "x": 444, "y": 127 }, { "id": "5052", "display": "52", "x": 443, "y": 183 }, { "id": "5053", "display": "53", "x": 386, "y": 181 }, { "id": "5054", "display": "54", "x": 330, "y": 180 }, { "id": "5056", "display": "56", "x": 213, "y": 182 }, { "id": "5057", "display": "57", "x": 155, "y": 205 }, { "id": "5058", "display": "58", "x": 120, "y": 261 }, { "id": "5059", "display": "59", "x": 89, "y": 317 }, { "id": "5060", "display": "60", "x": 120, "y": 373 }, { "id": "5061", "display": "61", "x": 162, "y": 426 }, { "id": "5063", "display": "63", "x": 221, "y": 451 }, { "id": "6052", "display": "52", "x": 215, "y": 622 }, { "id": "5055", "display": "55", "x": 270, "y": 180 }, { "id": "48", "display": "48", "x": 446, "y": 15 }, { "id": "5051", "display": "51", "x": 271, "y": 48 }, { "id": "1012", "display": "12", "x": 738, "y": 777 }, { "id": "6057", "display": "57", "x": 186, "y": 710 }, { "id": "6055", "display": "55", "x": 246, "y": 711 }, { "id": "6056", "display": "56", "x": 305, "y": 710 }, { "id": "1", "display": "1", "x": 492, "y": 710 }, { "id": "6054", "display": "54", "x": 435, "y": 710 }, { "id": "6053", "display": "53", "x": 373, "y": 713 }, { "id": "3", "display": "3", "x": 606, "y": 710 }, { "id": "4", "display": "4", "x": 663, "y": 710 }, { "id": "2014", "display": "14", "x": 771, "y": 711 }, { "id": "2013", "display": "13", "x": 868, "y": 711 }, { "id": "5064", "display": "64", "x": 263, "y": 505 }, { "id": "6051", "display": "51", "x": 247, "y": 562 }, { "id": "9", "display": "9", "x": 1000, "y": 645 }, { "id": "10", "display": "10", "x": 828, "y": 779 }, { "id": "2012", "display": "12", "x": 1067, "y": 714 }, { "id": "1013", "display": "13", "x": 918, "y": 777 }, { "id": "1014", "display": "14", "x": 1005, "y": 780 }, { "id": "46", "display": "46", "x": 554, "y": 66 }, { "id": "44", "display": "44", "x": 600, "y": 9 }, { "id": "45", "display": "45", "x": 658, "y": 8 }, { "id": "36", "display": "36", "x": 718, "y": 8 }, { "id": "35", "display": "35", "x": 771, "y": 67 }, { "id": "37", "display": "37", "x": 816, "y": 3 }, { "id": "41", "display": "41", "x": 866, "y": 54 }, { "id": "42", "display": "42", "x": 967, "y": 56 }, { "id": "40", "display": "40", "x": 1014, "y": 5 }, { "id": "34", "display": "34", "x": 1069, "y": 55 }, { "id": "38", "display": "38", "x": 1229, "y": 6 }, { "id": "33", "display": "33", "x": 1179, "y": 58 }, { "id": "28", "display": "28", "x": 1272, "y": 67 }, { "id": "27", "display": "27", "x": 1264, "y": 125 }, { "id": "32", "display": "32", "x": 1260, "y": 185 }, { "id": "26", "display": "26", "x": 1259, "y": 247 }, { "id": "24", "display": "24", "x": 1301, "y": 4 }, { "id": "29", "display": "29", "x": 1341, "y": 85 }, { "id": "25", "display": "25", "x": 1258, "y": 314 }, { "id": "30", "display": "30", "x": 1342, "y": 159 }, { "id": "31", "display": "31", "x": 1339, "y": 230 }, { "id": "23", "display": "23", "x": 1340, "y": 306 }, { "id": "21", "display": "21", "x": 1314, "y": 387 }, { "id": "22", "display": "22", "x": 1311, "y": 445 }, { "id": "20", "display": "20", "x": 1309, "y": 500 }, { "id": "19", "display": "19", "x": 1308, "y": 557 }, { "id": "3014", "display": "14", "x": 1305, "y": 666 }, { "id": "18", "display": "18", "x": 1305, "y": 612 }, { "id": "3013", "display": "13", "x": 1303, "y": 721 }, { "id": "3012", "display": "12", "x": 1243, "y": 719 }, { "id": "2017", "display": "17", "x": 1184, "y": 716 }, { "id": "43", "display": "43", "x": 916, "y": 106 }, { "id": "39", "display": "39", "x": 1123, "y": 104 }, { "id": "6059", "display": "59", "x": 154, "y": 644 }, { "id": "5062", "display": "62", "x": 124, "y": 711 }, { "id": "6058", "display": "58", "x": 85, "y": 617 }], "edges": [[0, 5062], [5062, 6057], [6057, 6055], [6055, 6056], [6056, 6053], [6053, 6054], [6054, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [10, 1012], [1012, 1013], [1013, 1014], [2012, 2013], [2015, 2016], [2016, 2017], [3012, 3013], [3013, 3014], [25, 26], [35, 36], [42, 43], [47, 48], [48, 49], [49, 50], [5052, 5053], [5053, 5054], [5054, 5055], [5055, 5056], [5056, 5057], [5057, 5058], [5058, 5059], [5059, 5060], [5060, 5061], [5063, 5064], [6051, 6052], [6053, 6054], [6058, 6059], [5051, 5055], [5051, 48], [1012, 4], [6057, 5062], [6055, 6057], [6053, 6056], [6054, 1], [2014, 4], [2013, 2014], [2012, 9], [1014, 2012], [46, 47], [44, 46], [44, 45], [36, 45], [35, 37], [41, 37], [43, 41], [42, 40], [34, 40], [39, 34], [33, 39], [38, 33], [38, 24], [28, 24], [27, 28], [32, 27], [26, 32], [29, 24], [30, 29], [25, 21], [22, 21], [20, 22], [19, 20], [18, 19], [3014, 18], [2017, 3012], [31, 30], [23, 31], [21, 23], [5062, 6059]] };
