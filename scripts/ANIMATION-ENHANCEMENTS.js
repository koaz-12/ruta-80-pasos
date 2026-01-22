// ✨ ENHANCED ANIMATION METHODS FOR SVGBoardRenderer
// Add these methods to the SVGBoardRenderer class

// Replace the existing animateMove method with this enhanced version
animateMove(playerId, path, callback) {
    // path is Array of Tile IDs ['1', '2', '3']
    if (!path || path.length < 2) {
        if (callback) callback();
        return;
    }

    const token = this.svg.querySelector(`.player-token[data-player-id="${playerId}"]`);
    if (!token) {
        console.error("Token not found for animation:", playerId);
        if (callback) callback();
        return;
    }

    // Cancel any ongoing animation for this token
    if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
    }

    // ✨ ADAPTIVE SPEED: Faster for longer paths
    const pathLength = path.length - 1; // Exclude starting position
    let baseSpeed = 400; // ms per hop

    if (pathLength >= 6) {
        baseSpeed = 250; // Fast for long distances
    } else if (pathLength >= 3) {
        baseSpeed = 350; // Medium for mid distances
    }

    console.log(`🎬 [ANIMATION] Moving ${pathLength} steps, speed: ${baseSpeed}ms/step`);

    // ✨ PATH PREVIEW: Highlight path before moving
    this.highlightPath(path);

    // ✨ DESTINATION HIGHLIGHT: Pulse final tile
    this.highlightDestination(path[path.length - 1]);

    token.classList.add('animating');

    let pathIdx = 0;
    const animationId = Date.now(); // Unique ID for this animation
    this.currentAnimationId = animationId;

    const hop = () => {
        // Check if this animation was cancelled
        if (this.currentAnimationId !== animationId) {
            console.log('[MOVE] Animation cancelled');
            this.clearPathHighlight();
            this.clearDestinationHighlight();
            return;
        }

        if (pathIdx >= path.length - 1) {
            // Finished
            token.classList.remove('animating');
            this.currentAnimationId = null;
            this.clearPathHighlight();
            this.clearDestinationHighlight();

            console.log('✅ [ANIMATION] Movement complete');
            if (callback) callback();
            return;
        }

        const nextId = String(path[pathIdx + 1]);
        pathIdx++;

        // Lookup Data
        const nextTileData = this.layoutData.tiles.find(t => String(t.id) === nextId);

        console.log(`[MOVE] Step ${pathIdx}/${path.length - 1}: Tile "${nextId}":`, nextTileData ? 'FOUND' : 'MISSING');

        if (!nextTileData) {
            console.warn(`[MOVE] Tile "${nextId}"` NOT in layout! Skipping...`);
            hop(); return;
        }

        // Get target coords
        const tx = nextTileData.x + (this.ts / 2);
        const ty = nextTileData.y + (this.ts / 2);

        // ✨ SMOOTH EASING: Ease-out-back for bounce effect
        token.style.transition = `transform ${ baseSpeed }ms cubic - bezier(0.175, 0.885, 0.32, 1.275)`;
        token.setAttribute('transform', `translate(${ tx }, ${ ty })`);

        // Wait for transition to complete before next hop
        this.currentTimeout = setTimeout(() => {
            hop();
        }, baseSpeed + 50); // Add small buffer
    };

    // Start after brief delay to show preview
    setTimeout(() => hop(), 300);
}

// ✨ NEW: Highlight path before movement
highlightPath(path) {
    // Remove old highlights
    this.clearPathHighlight();
    
    const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pathGroup.id = 'path-preview';
    
    path.slice(1).forEach(tileId => { // Skip starting position
        const tileData = this.layoutData.tiles.find(t => String(t.id) === String(tileId));
        if (!tileData) return;
        
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        highlight.setAttribute('cx', tileData.x + this.ts / 2);
        highlight.setAttribute('cy', tileData.y + this.ts / 2);
        highlight.setAttribute('r', this.ts * 0.4);
        highlight.setAttribute('fill', 'rgba(255, 215, 0, 0.3)'); // Gold with transparency
        highlight.setAttribute('stroke', '#FFD700');
        highlight.setAttribute('stroke-width', '2');
        
        pathGroup.appendChild(highlight);
    });
    
    this.svg.insertBefore(pathGroup, this.svg.firstChild); // Behind everything
}

clearPathHighlight() {
    const existing = this.svg.querySelector('#path-preview');
    if (existing) existing.remove();
}

// ✨ NEW: Pulse animation on destination
highlightDestination(tileId) {
    this.clearDestinationHighlight();
    
    const tileData = this.layoutData.tiles.find(t => String(t.id) === String(tileId));
    if (!tileData) return;
    
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.id = 'destination-highlight';
    pulse.setAttribute('cx', tileData.x + this.ts / 2);
    pulse.setAttribute('cy', tileData.y + this.ts / 2);
    pulse.setAttribute('r', this.ts * 0.5);
    pulse.setAttribute('fill', 'none');
    pulse.setAttribute('stroke', '#10b981'); // Green
    pulse.setAttribute('stroke-width', '3');
    pulse.setAttribute('opacity', '0.8');
    
    // Pulse animation via CSS
    pulse.style.animation = 'destination-pulse 1s ease-in-out infinite';
    
    this.svg.insertBefore(pulse, this.svg.firstChild);
}

clearDestinationHighlight() {
    const existing = this.svg.querySelector('#destination-highlight');
    if (existing) existing.remove();
}
