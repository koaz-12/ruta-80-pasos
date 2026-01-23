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

// LAYOUT: Recorrido de ABAJO hacia ARRIBA
// Tablero: 850 x 1400 px
// Inicio (0) abajo, Meta (80) arriba
export const SAVED_LAYOUT = {
    "tiles": [
        // === INICIO (abajo) ===
        { "id": "0", "display": "INICIO", "x": 100, "y": 1300 },

        // === TRAMO 1: Casillas 1-10 (subiendo) ===
        { "id": "1", "display": "1", "x": 180, "y": 1300 },
        { "id": "2", "display": "2", "x": 260, "y": 1300 },
        { "id": "3", "display": "3", "x": 340, "y": 1300 },
        { "id": "4", "display": "4", "x": 420, "y": 1300 },
        { "id": "5", "display": "5", "x": 500, "y": 1300 },
        { "id": "6", "display": "6", "x": 580, "y": 1280 },
        { "id": "7", "display": "7", "x": 660, "y": 1260 },
        { "id": "8", "display": "8", "x": 700, "y": 1180 },
        { "id": "9", "display": "9", "x": 700, "y": 1100 },
        { "id": "10", "display": "10", "x": 700, "y": 1020 },

        // === BIFURCACIÓN 1 (desde 10) ===
        // Difícil (izquierda)
        { "id": "11", "display": "11", "x": 600, "y": 980 },
        { "id": "12", "display": "12", "x": 520, "y": 940 },
        { "id": "13", "display": "13", "x": 440, "y": 900 },
        { "id": "14", "display": "14", "x": 360, "y": 860 },
        { "id": "15", "display": "15", "x": 280, "y": 820 },
        // Fácil (centro)
        { "id": "10f", "display": "10f", "x": 700, "y": 940 },
        { "id": "11f", "display": "11f", "x": 700, "y": 860 },
        { "id": "12f", "display": "12f", "x": 700, "y": 780 },
        // Medio (derecha)
        { "id": "10m", "display": "10m", "x": 780, "y": 960 },
        { "id": "11m", "display": "11m", "x": 780, "y": 900 },
        { "id": "12m", "display": "12m", "x": 780, "y": 840 },
        { "id": "13m", "display": "13m", "x": 780, "y": 780 },

        // === Convergencia en 16 ===
        { "id": "16", "display": "16", "x": 400, "y": 740 },

        // === TRAMO 2: Casillas 17-26 ===
        { "id": "17", "display": "17", "x": 400, "y": 680 },
        { "id": "18", "display": "18", "x": 400, "y": 620 },
        { "id": "19", "display": "19", "x": 400, "y": 560 },
        { "id": "20", "display": "20", "x": 400, "y": 500 },
        { "id": "21", "display": "21", "x": 340, "y": 460 },
        { "id": "22", "display": "22", "x": 280, "y": 420 },
        { "id": "23", "display": "23", "x": 220, "y": 380 },
        { "id": "24", "display": "24", "x": 160, "y": 340 },
        { "id": "25", "display": "25", "x": 160, "y": 280 },
        { "id": "26", "display": "26", "x": 160, "y": 220 },

        // === BIFURCACIÓN 2 (desde 26) ===
        // Difícil (izquierda)
        { "id": "27d", "display": "27d", "x": 100, "y": 180 },
        { "id": "28d", "display": "28d", "x": 100, "y": 140 },
        { "id": "29d", "display": "29d", "x": 100, "y": 100 },
        { "id": "30d", "display": "30d", "x": 160, "y": 60 },
        { "id": "31d", "display": "31d", "x": 220, "y": 40 },
        // Fácil (derecha)
        { "id": "27f", "display": "27f", "x": 220, "y": 180 },
        { "id": "28f", "display": "28f", "x": 280, "y": 140 },
        { "id": "29f", "display": "29f", "x": 340, "y": 100 },
        { "id": "30f", "display": "30f", "x": 400, "y": 60 },

        // === Convergencia en 32 ===
        { "id": "32", "display": "32", "x": 320, "y": 40 },

        // === TRAMO 3: Casillas 33-48 (derecha y baja) ===
        { "id": "33", "display": "33", "x": 400, "y": 60 },
        { "id": "34", "display": "34", "x": 480, "y": 80 },
        { "id": "35", "display": "35", "x": 560, "y": 100 },
        { "id": "36", "display": "36", "x": 640, "y": 120 },
        { "id": "37", "display": "37", "x": 720, "y": 140 },
        { "id": "38", "display": "38", "x": 780, "y": 200 },
        { "id": "39", "display": "39", "x": 780, "y": 280 },
        { "id": "40", "display": "40", "x": 780, "y": 360 },
        { "id": "41", "display": "41", "x": 780, "y": 440 },
        { "id": "42", "display": "42", "x": 720, "y": 500 },
        { "id": "43", "display": "43", "x": 640, "y": 540 },
        { "id": "44", "display": "44", "x": 560, "y": 580 },
        { "id": "45", "display": "45", "x": 480, "y": 620 },
        { "id": "46", "display": "46", "x": 480, "y": 700 },
        { "id": "47", "display": "47", "x": 480, "y": 780 },
        { "id": "48", "display": "48", "x": 480, "y": 860 },

        // === BIFURCACIÓN 3 (desde 48) ===
        // Camino Largo
        { "id": "49", "display": "49", "x": 400, "y": 900 },
        { "id": "50", "display": "50", "x": 320, "y": 940 },
        { "id": "51", "display": "51", "x": 240, "y": 980 },
        { "id": "52", "display": "52", "x": 160, "y": 1020 },
        { "id": "53", "display": "53", "x": 100, "y": 1080 },
        { "id": "54", "display": "54", "x": 100, "y": 1160 },
        // Atajo
        { "id": "49a", "display": "Atajo", "x": 560, "y": 920 },

        // === Convergencia en 55 ===
        { "id": "55", "display": "55", "x": 160, "y": 1200 },

        // === TRAMO 4: Casillas 56-65 (sube por la izquierda hacia el centro) ===
        { "id": "56", "display": "56", "x": 100, "y": 1140 },
        { "id": "57", "display": "57", "x": 60, "y": 1080 },
        { "id": "58", "display": "58", "x": 60, "y": 1000 },
        { "id": "59", "display": "59", "x": 60, "y": 920 },
        { "id": "60", "display": "60", "x": 60, "y": 840 },
        { "id": "61", "display": "61", "x": 60, "y": 760 },
        { "id": "62", "display": "62", "x": 60, "y": 680 },
        { "id": "63", "display": "63", "x": 60, "y": 600 },
        { "id": "64", "display": "64", "x": 60, "y": 520 },
        { "id": "65", "display": "65", "x": 60, "y": 440 },

        // === BIFURCACIÓN 4: Final o Loop ===
        { "id": "66", "display": "66", "x": 60, "y": 360 },

        // === META (arriba centro) ===
        { "id": "80", "display": "BOSS", "x": 400, "y": 100 }
    ],
    "edges": []
};
