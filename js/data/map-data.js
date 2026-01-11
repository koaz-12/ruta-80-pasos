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
    // Difícil=izquierda, Fácil=centro, Intermedio=derecha
    graph['10'] = {
        next: ['11', '10f', '10m'],
        branchInfo: [
            { id: '11', label: 'Difícil', hazard: '5 casillas' },
            { id: '10f', label: 'Fácil', hazard: '3 casillas' },
            { id: '10m', label: 'Medio', hazard: '4 casillas' }
        ]
    };

    // Difícil path (IZQUIERDA): 11→12→13→14→15→16 (5 casillas)
    for (let i = 11; i < 16; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }
    graph['15'] = { next: '16' };

    // Fácil path (CENTRO): 10f→11f→12f→16 (3 casillas)
    graph['10f'] = { next: '11f' };
    graph['11f'] = { next: '12f' };
    graph['12f'] = { next: '16' };

    // Medio path (DERECHA): 10m→11m→12m→13m→16 (4 casillas)
    graph['10m'] = { next: '11m' };
    graph['11m'] = { next: '12m' };
    graph['12m'] = { next: '13m' };
    graph['13m'] = { next: '16' };

    // Main continues from convergence: 16→26
    for (let i = 16; i < 26; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // ✅ JUNCTION 2: Position 26 (2 paths)
    // Difícil=izquierda (5 casillas), Fácil=derecha (4 casillas)
    graph['26'] = {
        next: ['27d', '27f'],
        branchInfo: [
            { id: '27d', label: 'Difícil', hazard: '5 casillas' },
            { id: '27f', label: 'Fácil', hazard: '4 casillas' }
        ]
    };

    // Difícil path: 27d→28d→29d→30d→31d→32 (5 casillas)
    graph['27d'] = { next: '28d' };
    graph['28d'] = { next: '29d' };
    graph['29d'] = { next: '30d' };
    graph['30d'] = { next: '31d' };
    graph['31d'] = { next: '32' };

    // Fácil path: 27f→28f→29f→30f→32 (4 casillas)
    graph['27f'] = { next: '28f' };
    graph['28f'] = { next: '29f' };
    graph['29f'] = { next: '30f' };
    graph['30f'] = { next: '32' };

    // Main continues from convergence 32→47
    for (let i = 32; i < 48; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // ✅ JUNCTION 3: Position 48 (2 paths)
    // Camino Largo vs Atajo
    graph['48'] = {
        next: ['49', '49a'],
        branchInfo: [
            { id: '49', label: 'Camino Largo', hazard: 'Normal' },
            { id: '49a', label: 'Atajo', hazard: 'Rápido' }
        ]
    };

    // Camino Largo: 49→50→51→52→53→54→55→56→57→58→59→60→61→62→63→64→65
    for (let i = 49; i < 65; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Atajo: 49a → 55 (converge)
    graph['49a'] = { next: '55' };

    // ✅ JUNCTION 4: Position 65 (loop or finish)
    graph['65'] = {
        next: ['66', '1'],
        branchInfo: [
            { id: '66', label: 'Continuar al Final', hazard: 'Jefe' },
            { id: '1', label: 'Otra Vuelta', hazard: 'Loop' }
        ]
    };

    // Final: 66 → 80 (Boss)
    graph['66'] = { next: '80' };
    graph['80'] = { next: null }; // Final - Boss fight

    return graph;
}

export const SAVED_LAYOUT = {
    "tiles": [
        { "id": "0", "display": "Punto de Partida", "x": 30, "y": 665 },
        { "id": "8", "display": "8", "x": 549, "y": 710 },
        { "id": "11", "display": "11", "x": 739, "y": 643 },
        { "id": "12", "display": "12", "x": 803, "y": 641 },
        { "id": "13", "display": "13", "x": 869, "y": 640 },
        { "id": "14", "display": "14", "x": 933, "y": 641 },
        { "id": "12f", "display": "12f", "x": 953, "y": 711 },
        { "id": "17", "display": "17", "x": 1125, "y": 716 },
        { "id": "47", "display": "47", "x": 506, "y": 13 },
        { "id": "49", "display": "49", "x": 445, "y": 71 },
        { "id": "50", "display": "50", "x": 444, "y": 127 },
        { "id": "51", "display": "51", "x": 443, "y": 183 },
        { "id": "52", "display": "52", "x": 386, "y": 181 },
        { "id": "53", "display": "53", "x": 330, "y": 180 },
        { "id": "55", "display": "55", "x": 213, "y": 182 },
        { "id": "56", "display": "56", "x": 155, "y": 205 },
        { "id": "57", "display": "57", "x": 120, "y": 261 },
        { "id": "58", "display": "58", "x": 89, "y": 317 },
        { "id": "59", "display": "59", "x": 120, "y": 373 },
        { "id": "60", "display": "60", "x": 162, "y": 426 },
        { "id": "61", "display": "61", "x": 221, "y": 451 },
        { "id": "64", "display": "64", "x": 215, "y": 622 },
        { "id": "54", "display": "54", "x": 270, "y": 180 },
        { "id": "48", "display": "48", "x": 446, "y": 15 },
        { "id": "49a", "display": "49a", "x": 271, "y": 48 },
        { "id": "10m", "display": "10m", "x": 738, "y": 777 },
        { "id": "2", "display": "2", "x": 186, "y": 710 },
        { "id": "3", "display": "3", "x": 246, "y": 711 },
        { "id": "4", "display": "4", "x": 305, "y": 710 },
        { "id": "7", "display": "7", "x": 492, "y": 710 },
        { "id": "6", "display": "6", "x": 435, "y": 710 },
        { "id": "5", "display": "5", "x": 373, "y": 713 },
        { "id": "9", "display": "9", "x": 606, "y": 710 },
        { "id": "10", "display": "10", "x": 663, "y": 710 },
        { "id": "10f", "display": "10f", "x": 771, "y": 711 },
        { "id": "11f", "display": "11f", "x": 868, "y": 711 },
        { "id": "62", "display": "62", "x": 263, "y": 505 },
        { "id": "63", "display": "63", "x": 247, "y": 562 },
        { "id": "15", "display": "15", "x": 1000, "y": 645 },
        { "id": "11m", "display": "11m", "x": 828, "y": 779 },
        { "id": "16", "display": "16", "x": 1067, "y": 714 },
        { "id": "12m", "display": "12m", "x": 918, "y": 777 },
        { "id": "13m", "display": "13m", "x": 1005, "y": 780 },
        { "id": "46", "display": "46", "x": 554, "y": 66 },
        { "id": "45", "display": "45", "x": 600, "y": 9 },
        { "id": "44", "display": "44", "x": 658, "y": 8 },
        { "id": "43", "display": "43", "x": 718, "y": 8 },
        { "id": "42", "display": "42", "x": 771, "y": 67 },
        { "id": "41", "display": "41", "x": 816, "y": 3 },
        { "id": "40", "display": "40", "x": 866, "y": 54 },
        { "id": "38", "display": "38", "x": 967, "y": 56 },
        { "id": "37", "display": "37", "x": 1014, "y": 5 },
        { "id": "36", "display": "36", "x": 1069, "y": 55 },
        { "id": "33", "display": "33", "x": 1229, "y": 6 },
        { "id": "34", "display": "34", "x": 1179, "y": 58 },
        { "id": "31d", "display": "31d", "x": 1272, "y": 67 },
        { "id": "30d", "display": "30d", "x": 1264, "y": 125 },
        { "id": "29d", "display": "29d", "x": 1260, "y": 185 },
        { "id": "28d", "display": "28d", "x": 1259, "y": 247 },
        { "id": "32", "display": "32", "x": 1301, "y": 4 },
        { "id": "30f", "display": "30f", "x": 1341, "y": 85 },
        { "id": "27d", "display": "27d", "x": 1258, "y": 314 },
        { "id": "29f", "display": "29f", "x": 1342, "y": 159 },
        { "id": "28f", "display": "28f", "x": 1339, "y": 230 },
        { "id": "27f", "display": "27f", "x": 1340, "y": 306 },
        { "id": "26", "display": "26", "x": 1314, "y": 387 },
        { "id": "25", "display": "25", "x": 1311, "y": 445 },
        { "id": "24", "display": "24", "x": 1309, "y": 500 },
        { "id": "23", "display": "23", "x": 1308, "y": 557 },
        { "id": "21", "display": "21", "x": 1305, "y": 666 },
        { "id": "22", "display": "22", "x": 1305, "y": 612 },
        { "id": "20", "display": "20", "x": 1303, "y": 721 },
        { "id": "19", "display": "19", "x": 1243, "y": 719 },
        { "id": "18", "display": "18", "x": 1184, "y": 716 },
        { "id": "39", "display": "39", "x": 916, "y": 106 },
        { "id": "35", "display": "35", "x": 1123, "y": 104 },
        { "id": "65", "display": "65", "x": 154, "y": 644 },
        { "id": "1", "display": "1", "x": 124, "y": 711 },
        { "id": "66", "display": "66", "x": 85, "y": 617 },
        { "id": "80", "display": "FINAL", "x": 35, "y": 520 }
    ],
    "edges": [
        // Edges auto-generated from buildGraph() - SAVED_LAYOUT edges disabled
        // to avoid incorrect decorative lines
    ]
};

