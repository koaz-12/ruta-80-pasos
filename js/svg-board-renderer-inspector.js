
// v7.3: Tile Inspector - Shows tile data in console on click
enableTileInspector() {
    console.log('%c🔍 Tile Inspector Enabled', 'color: #4facfe; font-weight: bold');
    console.log('Click any tile during gameplay to see its data in console');

    this.svg.addEventListener('click', (evt) => {
        // Find tile element
        let target = evt.target;
        while (target && !target.classList.contains('tile')) {
            target = target.parentElement;
            if (target === this.svg) return; // Reached top without finding tile
        }

        if (!target) return;

        // Get tile ID
        const tileId = target.getAttribute('data-tile-id');
        if (!tileId) return;

        // Find tile data
        const tileData = this.layoutData?.tiles?.find(t => String(t.id) === String(tileId));
        const node = this.boardGraph?.[tileId];
        const seqPos = this.getSequentialPosition(tileId);

        // Log to console
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: yellow');
        console.log(`%cTILE INFO: ${tileId}`, 'color: cyan; font-size: 14px; font-weight: bold');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: yellow');
        console.log('ID:', tileId);
        console.log('Display:', tileData?.display || tileId);
        console.log('Sequential Position:', seqPos);
        console.log('Coordinates:', tileData ? `x: ${tileData.x}, y: ${tileData.y}` : 'NOT FOUND');
        console.log('Next:', node?.next || 'NONE');

        if (node && Array.isArray(node.next)) {
            console.log('%c🔀 JUNCTION', 'color: orange; font-weight: bold');
            console.log('Options:', node.next);
            console.log('Labels:', node.branchInfo?.map(b => b.label).join(', ') || 'N/A');
        }

        console.log('%cFull Tile Data:', 'color: #888');
        console.log(tileData);
        console.log('%cFull Graph Node:', 'color: #888');
        console.log(node);
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: yellow');
    });
}
}
