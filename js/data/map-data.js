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
        { "id": "0", "display": "Punto de Partida", "x": 129, "y": 1300 },
        { "id": "1", "display": "1", "x": 117, "y": 1222 },
        { "id": "2", "display": "2", "x": 118, "y": 1165 },
        { "id": "3", "display": "3", "x": 117, "y": 1109 },
        { "id": "4", "display": "4", "x": 118, "y": 1055 },
        { "id": "5", "display": "5", "x": 115, "y": 992 },
        { "id": "6", "display": "6", "x": 118, "y": 935 },
        { "id": "7", "display": "7", "x": 118, "y": 883 },
        { "id": "8", "display": "8", "x": 118, "y": 830 },
        { "id": "9", "display": "9", "x": 118, "y": 778 },
        { "id": "10", "display": "10", "x": 118, "y": 725 },
        { "id": "10f", "display": "10f", "x": 117, "y": 626 },
        { "id": "10m", "display": "10m", "x": 53, "y": 656 },
        { "id": "11", "display": "11", "x": 182, "y": 655 },
        { "id": "11f", "display": "11f", "x": 117, "y": 537 },
        { "id": "11m", "display": "11m", "x": 51, "y": 573 },
        { "id": "12", "display": "12", "x": 184, "y": 596 },
        { "id": "12f", "display": "12f", "x": 117, "y": 458 },
        { "id": "12m", "display": "12m", "x": 53, "y": 490 },
        { "id": "13", "display": "13", "x": 185, "y": 536 },
        { "id": "13m", "display": "13m", "x": 50, "y": 410 },
        { "id": "14", "display": "14", "x": 184, "y": 477 },
        { "id": "15", "display": "15", "x": 180, "y": 415 },
        { "id": "16", "display": "16", "x": 114, "y": 353 },
        { "id": "17", "display": "17", "x": 112, "y": 300 },
        { "id": "18", "display": "18", "x": 112, "y": 246 },
        { "id": "19", "display": "19", "x": 109, "y": 191 },
        { "id": "20", "display": "20", "x": 107, "y": 136 },
        { "id": "21", "display": "21", "x": 160, "y": 134 },
        { "id": "22", "display": "22", "x": 212, "y": 134 },
        { "id": "23", "display": "23", "x": 265, "y": 131 },
        { "id": "24", "display": "24", "x": 320, "y": 130 },
        { "id": "25", "display": "25", "x": 373, "y": 129 },
        { "id": "26", "display": "26", "x": 429, "y": 126 },
        { "id": "27d", "display": "27d", "x": 500, "y": 177 },
        { "id": "27f", "display": "27f", "x": 508, "y": 102 },
        { "id": "28d", "display": "28d", "x": 564, "y": 176 },
        { "id": "28f", "display": "28f", "x": 581, "y": 103 },
        { "id": "29d", "display": "29d", "x": 624, "y": 176 },
        { "id": "29f", "display": "29f", "x": 649, "y": 100 },
        { "id": "30d", "display": "30d", "x": 682, "y": 172 },
        { "id": "30f", "display": "30f", "x": 721, "y": 101 },
        { "id": "31d", "display": "31d", "x": 738, "y": 164 },
        { "id": "32", "display": "32", "x": 799, "y": 138 },
        { "id": "33", "display": "33", "x": 797, "y": 204 },
        { "id": "34", "display": "34", "x": 747, "y": 250 },
        { "id": "35", "display": "35", "x": 703, "y": 302 },
        { "id": "36", "display": "36", "x": 750, "y": 351 },
        { "id": "37", "display": "37", "x": 798, "y": 402 },
        { "id": "38", "display": "38", "x": 749, "y": 445 },
        { "id": "39", "display": "39", "x": 701, "y": 492 },
        { "id": "40", "display": "40", "x": 751, "y": 538 },
        { "id": "41", "display": "41", "x": 800, "y": 584 },
        { "id": "42", "display": "42", "x": 748, "y": 629 },
        { "id": "43", "display": "43", "x": 793, "y": 675 },
        { "id": "44", "display": "44", "x": 795, "y": 730 },
        { "id": "45", "display": "45", "x": 794, "y": 783 },
        { "id": "46", "display": "46", "x": 739, "y": 828 },
        { "id": "47", "display": "47", "x": 790, "y": 870 },
        { "id": "48", "display": "48", "x": 788, "y": 925 },
        { "id": "49", "display": "49", "x": 734, "y": 926 },
        { "id": "49a", "display": "49a", "x": 757, "y": 1086 },
        { "id": "50", "display": "50", "x": 680, "y": 927 },
        { "id": "51", "display": "51", "x": 626, "y": 928 },
        { "id": "52", "display": "52", "x": 628, "y": 980 },
        { "id": "53", "display": "53", "x": 629, "y": 1032 },
        { "id": "54", "display": "54", "x": 629, "y": 1087 },
        { "id": "55", "display": "55", "x": 627, "y": 1140 },
        { "id": "56", "display": "56", "x": 605, "y": 1193 },
        { "id": "57", "display": "57", "x": 556, "y": 1241 },
        { "id": "58", "display": "58", "x": 504, "y": 1285 },
        { "id": "59", "display": "59", "x": 454, "y": 1241 },
        { "id": "60", "display": "60", "x": 406, "y": 1193 },
        { "id": "61", "display": "61", "x": 356, "y": 1148 },
        { "id": "62", "display": "62", "x": 306, "y": 1102 },
        { "id": "63", "display": "63", "x": 252, "y": 1101 },
        { "id": "64", "display": "64", "x": 198, "y": 1102 },
        { "id": "65", "display": "65", "x": 194, "y": 1160 },
        { "id": "66", "display": "66", "x": 243, "y": 1209 },
        { "id": "80", "display": "FINAL", "x": 255, "y": 1286 }
    ],
    "edges": [
        // Edges auto-generated from buildGraph() - SAVED_LAYOUT edges disabled
        // to avoid incorrect decorative lines
    ]
};

