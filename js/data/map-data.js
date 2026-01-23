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
        { "id": "0", "display": "Punto de Partida", "x": 129, "y": 100 },
        { "id": "1", "display": "1", "x": 117, "y": 178 },
        { "id": "2", "display": "2", "x": 118, "y": 235 },
        { "id": "3", "display": "3", "x": 117, "y": 291 },
        { "id": "4", "display": "4", "x": 118, "y": 345 },
        { "id": "5", "display": "5", "x": 115, "y": 408 },
        { "id": "6", "display": "6", "x": 118, "y": 465 },
        { "id": "7", "display": "7", "x": 118, "y": 517 },
        { "id": "8", "display": "8", "x": 118, "y": 570 },
        { "id": "9", "display": "9", "x": 118, "y": 622 },
        { "id": "10", "display": "10", "x": 118, "y": 675 },
        { "id": "10f", "display": "10f", "x": 117, "y": 774 },
        { "id": "10m", "display": "10m", "x": 53, "y": 744 },
        { "id": "11", "display": "11", "x": 182, "y": 745 },
        { "id": "11f", "display": "11f", "x": 117, "y": 863 },
        { "id": "11m", "display": "11m", "x": 51, "y": 827 },
        { "id": "12", "display": "12", "x": 184, "y": 804 },
        { "id": "12f", "display": "12f", "x": 117, "y": 942 },
        { "id": "12m", "display": "12m", "x": 53, "y": 910 },
        { "id": "13", "display": "13", "x": 185, "y": 864 },
        { "id": "13m", "display": "13m", "x": 50, "y": 990 },
        { "id": "14", "display": "14", "x": 184, "y": 923 },
        { "id": "15", "display": "15", "x": 180, "y": 985 },
        { "id": "16", "display": "16", "x": 114, "y": 1047 },
        { "id": "17", "display": "17", "x": 112, "y": 1100 },
        { "id": "18", "display": "18", "x": 112, "y": 1154 },
        { "id": "19", "display": "19", "x": 109, "y": 1209 },
        { "id": "20", "display": "20", "x": 107, "y": 1264 },
        { "id": "21", "display": "21", "x": 160, "y": 1266 },
        { "id": "22", "display": "22", "x": 212, "y": 1266 },
        { "id": "23", "display": "23", "x": 265, "y": 1269 },
        { "id": "24", "display": "24", "x": 320, "y": 1270 },
        { "id": "25", "display": "25", "x": 373, "y": 1271 },
        { "id": "26", "display": "26", "x": 429, "y": 1274 },
        { "id": "27d", "display": "27d", "x": 500, "y": 1223 },
        { "id": "27f", "display": "27f", "x": 508, "y": 1298 },
        { "id": "28d", "display": "28d", "x": 564, "y": 1224 },
        { "id": "28f", "display": "28f", "x": 581, "y": 1297 },
        { "id": "29d", "display": "29d", "x": 624, "y": 1224 },
        { "id": "29f", "display": "29f", "x": 649, "y": 1300 },
        { "id": "30d", "display": "30d", "x": 682, "y": 1228 },
        { "id": "30f", "display": "30f", "x": 721, "y": 1299 },
        { "id": "31d", "display": "31d", "x": 738, "y": 1236 },
        { "id": "32", "display": "32", "x": 799, "y": 1262 },
        { "id": "33", "display": "33", "x": 797, "y": 1196 },
        { "id": "34", "display": "34", "x": 747, "y": 1150 },
        { "id": "35", "display": "35", "x": 703, "y": 1098 },
        { "id": "36", "display": "36", "x": 750, "y": 1049 },
        { "id": "37", "display": "37", "x": 798, "y": 998 },
        { "id": "38", "display": "38", "x": 749, "y": 955 },
        { "id": "39", "display": "39", "x": 701, "y": 908 },
        { "id": "40", "display": "40", "x": 751, "y": 862 },
        { "id": "41", "display": "41", "x": 800, "y": 816 },
        { "id": "42", "display": "42", "x": 748, "y": 771 },
        { "id": "43", "display": "43", "x": 793, "y": 725 },
        { "id": "44", "display": "44", "x": 795, "y": 670 },
        { "id": "45", "display": "45", "x": 794, "y": 617 },
        { "id": "46", "display": "46", "x": 739, "y": 572 },
        { "id": "47", "display": "47", "x": 790, "y": 530 },
        { "id": "48", "display": "48", "x": 788, "y": 475 },
        { "id": "49", "display": "49", "x": 734, "y": 474 },
        { "id": "49a", "display": "49a", "x": 757, "y": 314 },
        { "id": "50", "display": "50", "x": 680, "y": 473 },
        { "id": "51", "display": "51", "x": 626, "y": 472 },
        { "id": "52", "display": "52", "x": 628, "y": 420 },
        { "id": "53", "display": "53", "x": 629, "y": 368 },
        { "id": "54", "display": "54", "x": 629, "y": 313 },
        { "id": "55", "display": "55", "x": 627, "y": 260 },
        { "id": "56", "display": "56", "x": 605, "y": 207 },
        { "id": "57", "display": "57", "x": 556, "y": 159 },
        { "id": "58", "display": "58", "x": 504, "y": 115 },
        { "id": "59", "display": "59", "x": 454, "y": 159 },
        { "id": "60", "display": "60", "x": 406, "y": 207 },
        { "id": "61", "display": "61", "x": 356, "y": 252 },
        { "id": "62", "display": "62", "x": 306, "y": 298 },
        { "id": "63", "display": "63", "x": 252, "y": 299 },
        { "id": "64", "display": "64", "x": 198, "y": 298 },
        { "id": "65", "display": "65", "x": 194, "y": 240 },
        { "id": "66", "display": "66", "x": 243, "y": 191 },
        { "id": "80", "display": "FINAL", "x": 255, "y": 114 }
    ],
    "edges": [
        // Edges auto-generated from buildGraph() - SAVED_LAYOUT edges disabled
        // to avoid incorrect decorative lines
    ]
};

