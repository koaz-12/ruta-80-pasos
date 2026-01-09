// v7.0: Renumeración Limpia del Grafo - IDs Secuenciales 1-80

export function buildGraph() {
    const graph = {};

    // Inicio
    graph['0'] = { next: '1' };

    // Ruta principal 1-9
    for (let i = 1; i < 10; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Bifurcación en 10 (3 caminos)
    graph['10'] = {
        next: ['11', '10a', '10b'],
        branchInfo: [
            { id: '11', label: 'Alto', hazard: 'Normal' },
            { id: '10a', label: 'Medio', hazard: 'Eventos' },
            { id: '10b', label: 'Bajo', hazard: 'Rápido' }
        ]
    };

    // Camino principal: 11-17
    for (let i = 11; i < 18; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Camino medio (10a): 10a-16a → converge en 18
    graph['10a'] = { next: '11a' };
    for (let i = 11; i < 17; i++) {
        graph[`${i}a`] = { next: `${i + 1}a` };
    }
    graph['17a'] = { next: '18' };

    // Camino bajo (10b): 10b-14b → converge en 18
    graph['10b'] = { next: '11b' };
    for (let i = 11; i < 15; i++) {
        graph[`${i}b`] = { next: i < 14 ? `${i + 1}b` : '18' };
    }

    // Convergencia y ruta 18-24
    for (let i = 18; i < 25; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Bifurcación en 25 (2 caminos)
    graph['25'] = {
        next: ['26', '25a'],
        branchInfo: [
            { id: '26', label: 'Cuesta Arriba', hazard: 'Difícil' },
            { id: '25a', label: 'Túnel', hazard: 'Seguro?' }
        ]
    };

    // Camino principal: 26-33
    for (let i = 26; i <= 30; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }
    graph['31'] = { next: '34' }; // Salto a 34
    graph['32'] = { next: '33' };
    graph['33'] = { next: '34' };

    // Camino túnel (25a): 25a-32a → converge en 34
    graph['25a'] = { next: '26a' };
    for (let i = 26; i <= 33; i++) {
        graph[`${i}a`] = { next: i < 33 ? `${i + 1}a` : '34' };
    }

    // Ruta 34-49
    for (let i = 34; i < 50; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Bifurcación en 50 (2 caminos)
    graph['50'] = {
        next: ['51', '50a'],
        branchInfo: [
            { id: '51', label: 'Ruta Segura', hazard: 'Largo' },
            { id: '50a', label: 'Atajo Mortal', hazard: 'Combate' }
        ]
    };

    // Camino principal: 51-64
    for (let i = 51; i < 65; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Atajo mortal (50a): 50a-59a → converge en 65
    graph['50a'] = { next: '51a' };
    for (let i = 51; i < 60; i++) {
        graph[`${i}a`] = { next: i < 59 ? `${i + 1}a` : '65' };
    }

    // Ruta final 65-78
    for (let i = 65; i < 79; i++) {
        graph[String(i)] = { next: String(i + 1) };
    }

    // Bifurcación final en 79 (loop o fin)
    graph['79'] = {
        next: ['80', '10'],
        branchInfo: [
            { id: '80', label: 'Llegar al Final', hazard: 'Victoria' },
            { id: '10', label: 'Dar la Vuelta', hazard: 'Repetir Camino' }
        ]
    };

    graph['80'] = { next: null };

    return graph;
}

// Mapeo de IDs viejos a nuevos para migración de SAVED_LAYOUT
export const ID_MAPPING = {
    '0': '0',
    '5062': '1',
    '6057': '2',
    '6055': '3',
    '6056': '4',
    '6053': '5',
    '6054': '6',
    '1': '7',
    '2': '8',
    '3': '9',
    '4': '10',
    '5': '11',
    '6': '12',
    '7': '13',
    '8': '14',
    '9': '15',
    '10': '16',
    '1012': '17',
    '1013': '17',
    '1014': '17',
    '2012': '10a',
    '2013': '11a',
    '2014': '12a',
    '2015': '13a',
    '2016': '14a',
    '2017': '15a',
    '3012': '16a',
    '3013': '17a',
    '3014': '17a',
    '11': '17',
    '11b': '10a',
    '11c': '10b',
    '12b': '11a',
    '13b': '12b',
    '14b': '13b',
    '15b': '14b',
    '16b': '15',
    '17b': '16',
    '18': '18',
    '19': '19',
    '20': '20',
    '21': '21',
    '22': '22',
    '23': '23',
    '24': '24',
    '25': '25',
    '26': '26',
    '26b': '25a',
    '27': '27',
    '27b': '26a',
    '28': '28',
    '28b': '27a',
    '29': '29',
    '29b': '28a',
    '30': '30',
    '30b': '29a',
    '31': '31',
    '31b': '30a',
    '32': '32',
    '32b': '31a',
    '33': '33',
    '33b': '32a',
    '34': '34',
    '35': '35',
    '36': '36',
    '37': '37',
    '38': '38',
    '39': '39',
    '40': '40',
    '41': '41',
    '42': '42',
    '43': '43',
    '44': '44',
    '45': '45',
    '46': '46',
    '47': '47',
    '48': '48',
    '49': '49',
    '50': '50',
    '5051': '50a',
    '5052': '51a',
    '5053': '52a',
    '5054': '53a',
    '5055': '54a',
    '5056': '55a',
    '5057': '56a',
    '5058': '57a',
    '5059': '58a',
    '5060': '59a',
    '5061': '60',
    '51': '51',
    '51b': '50a',
    '52b': '51a',
    '53b': '52a',
    '54b': '53a',
    '55b': '54a',
    '56b': '55a',
    '57b': '56a',
    '58b': '57a',
    '59b': '58a',
    '60b': '59a',
    '52': '52',
    '53': '53',
    '54': '54',
    '55': '55',
    '56': '56',
    '57': '57',
    '58': '58',
    '59': '59',
    '60': '60',
    '5062': '61',
    '5063': '62',
    '5064': '63',
    '61': '61',
    '62': '62',
    '63': '63',
    '64': '64',
    '65': '65',
    '66': '66',
    '67': '67',
    '68': '68',
    '69': '69',
    '70': '70',
    '71': '71',
    '72': '72',
    '73': '73',
    '74': '74',
    '75': '75',
    '76': '76',
    '77': '77',
    '78': '78',
    '79': '79',
    '80': '80',
    // IDs adicionales del layout
    '6051': '51',
    '6052': '52',
    '6053': '5',
    '6054': '6',
    '6055': '3',
    '6056': '4',
    '6057': '2',
    '6058': '1',
    '6059': '1'
};

// SAVED_LAYOUT se migrará después con este mapeo
export const SAVED_LAYOUT = null; // Se actualizará en el siguiente paso
