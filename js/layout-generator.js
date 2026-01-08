export class LayoutGenerator {
    constructor() {
        this.tilesContainer = document.getElementById('tile-container');
        this.w = 45; // Tile Width (Matches CSS)
        this.h = 45; // Tile Height (Matches CSS)
        // Global offsets to center board on screen
        this.offsetX = 50;
        this.offsetY = 50;

        this.colors = ['p-blue', 'p-red', 'p-yellow', 'p-green'];
    }

    generate() {
        if (!this.tilesContainer) return;
        this.tilesContainer.innerHTML = '';

        // --- 1. INICIO (Bottom Left) ---
        // Position: Bottom Leftish
        const startX = 50;
        const startY = 700; // Assuming 900px height

        const startBox = document.querySelector('.start-box');
        if (startBox) {
            this.setPos(startBox, startX, startY - 25); // -25 centers height diff (100 vs 50) roughly
        }

        // --- ZONE 1: BOTTOM LINE (1-11) ---
        // From right of Start box
        let cx = startX + 110;
        let cy = startY;

        for (let i = 1; i <= 11; i++) {
            this.createTile(i, cx, cy);
            cx += 50; // Spacing
        }

        // --- ZONE 2: TRIPLE SPLIT (12-18) ---
        // 12 Starts the split? Or connector?
        // Let's make 12 the split hub point or just branch out.
        // Map: 11 is last single.
        // 12-13 (Top), 14 (Mid), 15-16 (Bot)?
        // Re-reading map: "A/B/C"
        // Let's do:
        // Top Branch: 12, 13
        // Mid Branch: 14, 15
        // Bot Branch: 16, 17
        // 18 Merge

        const splitX = cx + 20;

        // Top Row (y - 60)
        this.createTile(12, splitX, cy - 60, 'p-blue');
        this.createTile(13, splitX + 55, cy - 60, 'p-red');

        // Mid Row (y)
        this.createTile(14, splitX, cy, 'p-yellow');
        this.createTile(15, splitX + 55, cy, 'p-green');

        // Bot Row (y + 60)
        this.createTile(16, splitX, cy + 60, 'p-blue');
        this.createTile(17, splitX + 55, cy + 60, 'p-red');

        // Merge Tile 18
        cx = splitX + 130;
        this.createTile(18, cx, cy); // Back to center y

        // --- ZONE 3: RIGHT VERTICAL & DIAMOND (19-33) ---
        // 19 Corner?
        cx += 60;
        this.createTile(19, cx, cy); // Turning tile

        // Go UP
        cy -= 55;
        this.createTile(20, cx, cy);
        cy -= 55;
        this.createTile(21, cx, cy);
        cy -= 55;
        this.createTile(22, cx, cy);
        cy -= 55;
        this.createTile(23, cx, cy);
        cy -= 55;
        this.createTile(24, cx, cy);
        cy -= 55;
        this.createTile(25, cx, cy);

        // DIAMOND SPLIT (26-33)
        // 26 Split Point
        cy -= 55;
        this.createTile(26, cx, cy);

        // Left Branch of Diamond (27, 28)
        this.createTile(27, cx - 40, cy - 50);
        this.createTile(28, cx - 40, cy - 100);

        // Right Branch of Diamond (29, 30) - Actually let's just sequential ID?
        // User map: 26 split. 
        // Left side: 27, 28?
        // Right side: 31, 32? 
        // Let's assign IDs arbitrarily to make loop
        this.createTile(29, cx + 40, cy - 50); // Right
        this.createTile(30, cx + 40, cy - 100); // Right

        // Let's add more to close diamond
        this.createTile(31, cx - 40, cy - 150); // Left Top
        this.createTile(32, cx + 40, cy - 150); // Right Top

        // 33 Merge Top
        cy -= 200;
        this.createTile(33, cx, cy);

        // --- ZONE 4: ZIG ZAG TOP (34-50) ---
        // Corner 34
        cy -= 60;
        this.createTile(34, cx, cy);

        // Move Left Zig Zag
        // X decreases. Y oscillates.
        let zigzagX = cx - 60;
        let zigzagY = cy;
        let up = true;

        for (let i = 35; i <= 50; i++) {
            let yOff = up ? -40 : 40;
            this.createTile(i, zigzagX, zigzagY + yOff);
            zigzagX -= 45;
            up = !up;
        }

        // --- ZONE 5: PARALLEL HORIZONTAL (51-64) ---
        // 51 Split for Parallel
        // 51 is at end of zig zag
        let parX = zigzagX - 20;
        let parY = zigzagY;

        this.createTile(51, parX, parY);

        // Rows
        parX -= 60;

        // Top Row (Segura) 52-57
        let ptx = parX;
        for (let i = 52; i <= 57; i++) {
            this.createTile(i, ptx, parY - 35, 'p-green'); // Green visual
            ptx -= 50;
        }

        // Bot Row (Mortal) 58-63
        let pbx = parX;
        for (let i = 58; i <= 63; i++) {
            this.createTile(i, pbx, parY + 35, 'p-red'); // Red visual
            pbx -= 50;
        }

        // 64 Merge
        let mergeX = ptx - 10;
        this.createTile(64, mergeX, parY);

        // --- ZONE 6: LEFT SNAKE (65-80) ---
        let snkX = mergeX - 60;
        let snkY = parY;

        this.createTile(65, snkX, snkY); // Start Snake

        // S-Curve Downwards
        snkY += 60;

        // We need 15 tiles (66-80) going S downwards
        // Curve 1: Right -> Down -> Left
        // Curve 2: Left -> Down -> Right

        // Let's emulate a bezier-ish path manually
        // 66, 67, 68 Curve Rightout
        this.createTile(66, snkX + 30, snkY);
        this.createTile(67, snkX + 60, snkY + 30);
        this.createTile(68, snkX + 30, snkY + 60);
        this.createTile(69, snkX, snkY + 70); // Centerish

        // 70, 71, 72 Curve Leftout
        let snkY2 = snkY + 110;
        this.createTile(70, snkX - 30, snkY2);
        this.createTile(71, snkX - 60, snkY2 + 30);
        this.createTile(72, snkX - 30, snkY2 + 60);
        this.createTile(73, snkX, snkY2 + 70);

        // 74-80 Straightish or gently chaotic down to Finish
        let snkY3 = snkY2 + 100;
        this.createTile(74, snkX + 20, snkY3);
        this.createTile(75, snkX + 40, snkY3 + 40);
        this.createTile(76, snkX + 20, snkY3 + 80);
        this.createTile(77, snkX, snkY3 + 120);
        this.createTile(78, snkX - 20, snkY3 + 160);
        this.createTile(79, snkX, snkY3 + 200);
        this.createTile(80, snkX + 30, snkY3 + 230); // Last Tile

        // META
        const meta = document.querySelector('.finish-box');
        if (meta) {
            this.setPos(meta, snkX + 80, snkY3 + 230);
        }
    }

    createTile(index, x, y, colorClass = null) {
        const div = document.createElement('div');
        div.className = 'tile';
        div.setAttribute('data-index', index);
        div.innerText = index;

        // Color
        if (colorClass) {
            div.classList.add(colorClass);
        } else {
            div.classList.add(this.colors[index % 4]);
        }

        this.setPos(div, x, y);
        this.tilesContainer.appendChild(div);
    }

    setPos(el, x, y) {
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.position = 'absolute';
        el.style.margin = '0';
    }
}
