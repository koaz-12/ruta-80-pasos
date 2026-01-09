// v7.0: CLEAN Sequential Graph 1-80
// Junction at position 10, 25, 50, 79

export function buildGraph() {
    const graph = {};

    // Start
    graph['0'] = { next: '1' };

    // Main path 1-9
    for (let i = 1; i < 10; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // ✅ JUNCTION 1: Position 10 (3 paths)
    graph['10'] = {
        next: ['11', '10a', '10b'],
        branchInfo: [
            { id: '11', label: 'Alto', hazard: 'Normal' },
            { id: '10a', label: 'Medio', hazard: 'Eventos' },
            { id: '10b', label: 'Bajo', hazard: 'Rápido' }
        ]
    };

    // Alto path: 11-17 (main path continues)
    for (let i = 11; i < 18; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Medio path: 10a → 11a → 12a → converge at 17
    // Solo existen 10a, 11a, 12a en el tablero
    graph['10a'] = { next: '11a' };
    graph['11a'] = { next: '12a' };
    graph['12a'] = { next: '17' }; // Converge a 17 (no 18)

    // Bajo path: 10b → 11b → 12b → converge at 17
    // Solo existen 10b, 11b, 12b en el tablero
    graph['10b'] = { next: '11b' };
    graph['11b'] = { next: '12b' };
    graph['12b'] = { next: '17' }; // Converge a 17 (no 18)

    // Main continues: 17-24 (convergence point is 17)
    for (let i = 17; i < 25; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // ✅ JUNCTION 2: Position 25 (2 paths)
    graph['25'] = {
        next: ['26', '25a'],
        branchInfo: [
            { id: '26', label: 'Cuesta Arriba', hazard: 'Difícil' },
            { id: '25a', label: 'Túnel', hazard: 'Seguro' }
        ]
    };

    // Main path: 26-33
    for (let i = 26; i < 34; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Tunnel path: 25a-33a → converge at 34
    graph['25a'] = { next: '26a' };
    for (let i = 26; i < 34; i++) {
        graph[`${i}a`] = { next: i < 33 ? `${i + 1}a` : '34' };
    }

    // Main continues: 34-49
    for (let i = 34; i < 50; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // ✅ JUNCTION 3: Position 50 (2 paths)
    graph['50'] = {
        next: ['51', '50a'],
        branchInfo: [
            { id: '51', label: 'Ruta Segura', hazard: 'Largo' },
            { id: '50a', label: 'Atajo Mortal', hazard: 'Combate' }
        ]
    };

    // Safe path: 51-64
    for (let i = 51; i < 65; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Shortcut path: 50a-60a → converge at 65
    graph['50a'] = { next: '51a' };
    for (let i = 51; i < 61; i++) {
        graph[`${i}a`] = { next: i < 60 ? `${i + 1}a` : '65' };
    }

    // Main continues: 65-78
    for (let i = 65; i < 79; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // ✅ JUNCTION 4: Position 79 (loop or end)
    graph['79'] = {
        next: ['80', '10'],
        branchInfo: [
            { id: '80', label: 'Llegar al Final', hazard: 'Victoria' },
            { id: '10', label: 'Dar la Vuelta', hazard: 'Repetir' }
        ]
    };

    graph['80'] = { next: null };

    return graph;
}

export const SAVED_LAYOUT = {
    "tiles": [
        { "id": "0", "display": "0", "x": 44, "y": 684 },
        { "id": "8", "display": "8", "x": 549, "y": 710 },
        { "id": "11", "display": "11", "x": 739, "y": 643 },
        { "id": "12", "display": "12", "x": 803, "y": 641 },
        { "id": "13", "display": "13", "x": 869, "y": 640 },
        { "id": "14", "display": "14", "x": 933, "y": 641 },
        { "id": "10a", "display": "10a", "x": 953, "y": 711 },
        { "id": "11a", "display": "11a", "x": 1125, "y": 716 },
        { "id": "46", "display": "46", "x": 506, "y": 13 },
        { "id": "48", "display": "48", "x": 445, "y": 71 },
        { "id": "50", "display": "50", "x": 444, "y": 127 },
        { "id": "51a", "display": "51a", "x": 443, "y": 183 },
        { "id": "52a", "display": "52a", "x": 386, "y": 181 },
        { "id": "53a", "display": "53a", "x": 330, "y": 180 },
        { "id": "55a", "display": "55a", "x": 213, "y": 182 },
        { "id": "56a", "display": "56a", "x": 155, "y": 205 },
        { "id": "57a", "display": "57a", "x": 120, "y": 261 },
        { "id": "58a", "display": "58a", "x": 89, "y": 317 },
        { "id": "59a", "display": "59a", "x": 120, "y": 373 },
        { "id": "60a", "display": "60a", "x": 162, "y": 426 },
        { "id": "61a", "display": "61a", "x": 221, "y": 451 },
        { "id": "64", "display": "64", "x": 215, "y": 622 },
        { "id": "54a", "display": "54a", "x": 270, "y": 180 },
        { "id": "47", "display": "47", "x": 446, "y": 15 },
        { "id": "50a", "display": "50a", "x": 271, "y": 48 },
        { "id": "11", "display": "11", "x": 738, "y": 777 },
        { "id": "2", "display": "2", "x": 186, "y": 710 },
        { "id": "3", "display": "3", "x": 246, "y": 711 },
        { "id": "4", "display": "4", "x": 305, "y": 710 },
        { "id": "7", "display": "7", "x": 492, "y": 710 },
        { "id": "6", "display": "6", "x": 435, "y": 710 },
        { "id": "5", "display": "5", "x": 373, "y": 713 },
        { "id": "9", "display": "9", "x": 606, "y": 710 },
        { "id": "10", "display": "10", "x": 663, "y": 710 },
        { "id": "14", "display": "14", "x": 771, "y": 711 },
        { "id": "15", "display": "15", "x": 868, "y": 711 },
        { "id": "62a", "display": "62a", "x": 263, "y": 505 },
        { "id": "63", "display": "63", "x": 247, "y": 562 },
        { "id": "15", "display": "15", "x": 1000, "y": 645 },
        { "id": "16", "display": "16", "x": 828, "y": 779 },
        { "id": "16", "display": "16", "x": 1067, "y": 714 },
        { "id": "12", "display": "12", "x": 918, "y": 777 },
        { "id": "13", "display": "13", "x": 1005, "y": 780 },
        { "id": "45", "display": "45", "x": 554, "y": 66 },
        { "id": "43", "display": "43", "x": 600, "y": 9 },
        { "id": "44", "display": "44", "x": 658, "y": 8 },
        { "id": "35", "display": "35", "x": 718, "y": 8 },
        { "id": "34", "display": "34", "x": 771, "y": 67 },
        { "id": "36", "display": "36", "x": 816, "y": 3 },
        { "id": "40", "display": "40", "x": 866, "y": 54 },
        { "id": "41", "display": "41", "x": 967, "y": 56 },
        { "id": "39", "display": "39", "x": 1014, "y": 5 },
        { "id": "33", "display": "33", "x": 1069, "y": 55 },
        { "id": "37", "display": "37", "x": 1229, "y": 6 },
        { "id": "32", "display": "32", "x": 1179, "y": 58 },
        { "id": "27", "display": "27", "x": 1272, "y": 67 },
        { "id": "28", "display": "28", "x": 1264, "y": 125 },
        { "id": "29", "display": "29", "x": 1260, "y": 185 },
        { "id": "30", "display": "30", "x": 1259, "y": 247 },
        { "id": "26", "display": "26", "x": 1301, "y": 4 },
        { "id": "25", "display": "25", "x": 1341, "y": 85 },
        { "id": "31", "display": "31", "x": 1258, "y": 314 },
        { "id": "24", "display": "24", "x": 1342, "y": 159 },
        { "id": "23", "display": "23", "x": 1339, "y": 230 },
        { "id": "22", "display": "22", "x": 1340, "y": 306 },
        { "id": "21", "display": "21", "x": 1314, "y": 387 },
        { "id": "20", "display": "20", "x": 1311, "y": 445 },
        { "id": "19", "display": "19", "x": 1309, "y": 500 },
        { "id": "18", "display": "18", "x": 1308, "y": 557 },
        { "id": "12b", "display": "12b", "x": 1305, "y": 666 },
        { "id": "17", "display": "17", "x": 1305, "y": 612 },
        { "id": "11b", "display": "11b", "x": 1303, "y": 721 },
        { "id": "10b", "display": "10b", "x": 1243, "y": 719 },
        { "id": "12a", "display": "12a", "x": 1184, "y": 716 },
        { "id": "42", "display": "42", "x": 916, "y": 106 },
        { "id": "38", "display": "38", "x": 1123, "y": 104 },
        { "id": "66", "display": "66", "x": 154, "y": 644 },
        { "id": "1", "display": "1", "x": 124, "y": 711 },
        { "id": "65", "display": "65", "x": 85, "y": 617 }
    ],
    "edges": [
        ["0", "1"], ["1", "2"], ["2", "3"], ["3", "4"], ["4", "5"], ["5", "6"], ["6", "7"], ["7", "8"], ["8", "9"], ["9", "10"],
        ["10", "11"], ["11", "12"], ["12", "13"], ["13", "14"], ["14", "15"], ["16", "11"], ["11", "12"], ["12", "13"],
        ["16", "15"], ["10a", "11a"], ["11a", "12a"], ["10b", "11b"], ["11b", "12b"], ["31", "30"], ["34", "35"], ["41", "42"],
        ["46", "47"], ["47", "48"], ["48", "50"], ["51a", "52a"], ["52a", "53a"], ["53a", "54a"], ["54a", "55a"], ["55a", "56a"],
        ["56a", "57a"], ["57a", "58a"], ["58a", "59a"], ["59a", "60a"], ["61a", "62a"], ["63", "64"], ["5", "6"], ["65", "66"],
        ["50a", "54a"], ["50a", "47"], ["11", "10"], ["2", "1"], ["3", "2"], ["5", "4"], ["6", "7"], ["14", "10"], ["15", "14"],
        ["16", "15"], ["13", "16"], ["45", "46"], ["43", "45"], ["43", "44"], ["35", "44"], ["34", "36"], ["40", "36"], ["42", "40"],
        ["41", "39"], ["33", "39"], ["38", "33"], ["32", "38"], ["37", "32"], ["37", "26"], ["27", "26"], ["28", "27"], ["29", "28"],
        ["30", "29"], ["25", "26"], ["24", "25"], ["31", "21"], ["20", "21"], ["19", "20"], ["18", "19"], ["17", "18"], ["12b", "17"],
        ["12a", "10b"], ["23", "24"], ["22", "23"], ["21", "22"], ["1", "66"]
    ]
};

