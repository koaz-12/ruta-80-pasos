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
        { "id": "0", "display": "Punto de Partida", "x": 619, "y": 1317 },
        { "id": "1", "display": "1", "x": 627, "y": 1189 },
        { "id": "2", "display": "2", "x": 626, "y": 1096 },
        { "id": "3", "display": "3", "x": 627, "y": 1006 },
        { "id": "4", "display": "4", "x": 626, "y": 918 },
        { "id": "5", "display": "5", "x": 628, "y": 816 },
        { "id": "6", "display": "6", "x": 626, "y": 723 },
        { "id": "7", "display": "7", "x": 626, "y": 637 },
        { "id": "8", "display": "8", "x": 626, "y": 552 },
        { "id": "9", "display": "9", "x": 626, "y": 466 },
        { "id": "10", "display": "10", "x": 626, "y": 381 },
        { "id": "10f", "display": "10f", "x": 627, "y": 219 },
        { "id": "10m", "display": "10m", "x": 666, "y": 268 },
        { "id": "11", "display": "11", "x": 586, "y": 267 },
        { "id": "11f", "display": "11f", "x": 627, "y": 73 },
        { "id": "11m", "display": "11m", "x": 667, "y": 133 },
        { "id": "12", "display": "12", "x": 585, "y": 171 },
        { "id": "12f", "display": "12f", "x": 627, "y": -54 },
        { "id": "12m", "display": "12m", "x": 666, "y": -2 },
        { "id": "13", "display": "13", "x": 584, "y": 72 },
        { "id": "13m", "display": "13m", "x": 668, "y": -132 },
        { "id": "14", "display": "14", "x": 585, "y": -24 },
        { "id": "15", "display": "15", "x": 587, "y": -125 },
        { "id": "16", "display": "16", "x": 628, "y": -225 },
        { "id": "17", "display": "17", "x": 630, "y": -312 },
        { "id": "18", "display": "18", "x": 630, "y": -401 },
        { "id": "19", "display": "19", "x": 631, "y": -489 },
        { "id": "20", "display": "20", "x": 633, "y": -579 },
        { "id": "21", "display": "21", "x": 600, "y": -582 },
        { "id": "22", "display": "22", "x": 567, "y": -582 },
        { "id": "23", "display": "23", "x": 534, "y": -587 },
        { "id": "24", "display": "24", "x": 500, "y": -588 },
        { "id": "25", "display": "25", "x": 467, "y": -591 },
        { "id": "26", "display": "26", "x": 432, "y": -596 },
        { "id": "27d", "display": "27d", "x": 388, "y": -512 },
        { "id": "27f", "display": "27f", "x": 384, "y": -635 },
        { "id": "28d", "display": "28d", "x": 348, "y": -513 },
        { "id": "28f", "display": "28f", "x": 338, "y": -633 },
        { "id": "29d", "display": "29d", "x": 311, "y": -515 },
        { "id": "29f", "display": "29f", "x": 295, "y": -638 },
        { "id": "30d", "display": "30d", "x": 275, "y": -521 },
        { "id": "30f", "display": "30f", "x": 251, "y": -636 },
        { "id": "31d", "display": "31d", "x": 240, "y": -533 },
        { "id": "32", "display": "32", "x": 202, "y": -576 },
        { "id": "33", "display": "33", "x": 204, "y": -468 },
        { "id": "34", "display": "34", "x": 235, "y": -393 },
        { "id": "35", "display": "35", "x": 262, "y": -309 },
        { "id": "36", "display": "36", "x": 233, "y": -228 },
        { "id": "37", "display": "37", "x": 203, "y": -146 },
        { "id": "38", "display": "38", "x": 234, "y": -75 },
        { "id": "39", "display": "39", "x": 264, "y": 1 },
        { "id": "40", "display": "40", "x": 232, "y": 76 },
        { "id": "41", "display": "41", "x": 202, "y": 151 },
        { "id": "42", "display": "42", "x": 234, "y": 223 },
        { "id": "43", "display": "43", "x": 206, "y": 298 },
        { "id": "44", "display": "44", "x": 205, "y": 388 },
        { "id": "45", "display": "45", "x": 205, "y": 475 },
        { "id": "46", "display": "46", "x": 240, "y": 547 },
        { "id": "47", "display": "47", "x": 208, "y": 616 },
        { "id": "48", "display": "48", "x": 209, "y": 706 },
        { "id": "49", "display": "49", "x": 243, "y": 708 },
        { "id": "49a", "display": "49a", "x": 229, "y": 969 },
        { "id": "50", "display": "50", "x": 276, "y": 709 },
        { "id": "51", "display": "51", "x": 310, "y": 711 },
        { "id": "52", "display": "52", "x": 309, "y": 796 },
        { "id": "53", "display": "53", "x": 308, "y": 880 },
        { "id": "54", "display": "54", "x": 308, "y": 970 },
        { "id": "55", "display": "55", "x": 309, "y": 1056 },
        { "id": "56", "display": "56", "x": 323, "y": 1143 },
        { "id": "57", "display": "57", "x": 354, "y": 1221 },
        { "id": "58", "display": "58", "x": 386, "y": 1293 },
        { "id": "59", "display": "59", "x": 417, "y": 1221 },
        { "id": "60", "display": "60", "x": 447, "y": 1143 },
        { "id": "61", "display": "61", "x": 478, "y": 1069 },
        { "id": "62", "display": "62", "x": 509, "y": 994 },
        { "id": "63", "display": "63", "x": 543, "y": 993 },
        { "id": "64", "display": "64", "x": 576, "y": 994 },
        { "id": "65", "display": "65", "x": 579, "y": 1089 },
        { "id": "66", "display": "66", "x": 548, "y": 1168 },
        { "id": "80", "display": "FINAL", "x": 541, "y": 1294 }
    ],
    "edges": [
        // Edges auto-generated from buildGraph() - SAVED_LAYOUT edges disabled
        // to avoid incorrect decorative lines
    ]
};

