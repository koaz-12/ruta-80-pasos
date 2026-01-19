// Lobby Carousel Controller
// Handles the horizontal carousel for game mode selection

export class LobbyCarousel {
    constructor() {
        this.currentMode = 'solo';
        this.currentIndex = 0;
        this.modes = ['solo', 'hotseat', 'online'];
        this.playerCount = 3; // Default for hotseat

        this.init();
    }

    init() {
        this.carousel = document.getElementById('mode-carousel');
        this.cards = document.querySelectorAll('.mode-card');
        this.dots = document.querySelectorAll('.carousel-dots .dot');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        this.playBtn = document.getElementById('btn-play-mode');

        if (!this.carousel) return;

        // Arrow navigation
        this.prevBtn?.addEventListener('click', () => this.navigate(-1));
        this.nextBtn?.addEventListener('click', () => this.navigate(1));

        // Card click
        this.cards.forEach((card, index) => {
            card.addEventListener('click', () => this.selectMode(index));
        });

        // Dot click
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.selectMode(index));
        });

        // Swipe/scroll detection
        this.carousel.addEventListener('scroll', () => this.onScroll());

        // Play button
        this.playBtn?.addEventListener('click', () => this.startGame());

        // Player count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playerCount = parseInt(btn.dataset.count);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lobby-screen')?.classList.contains('hidden')) return;
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
            if (e.key === 'Enter') this.startGame();
        });

        // Touch swipe
        this.setupTouchSwipe();

        // Initial state
        this.updateUI();
    }

    setupTouchSwipe() {
        let startX = 0;
        let startY = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.navigate(1); // Swipe left = next
                } else {
                    this.navigate(-1); // Swipe right = prev
                }
            }
        }, { passive: true });
    }

    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.modes.length) {
            this.selectMode(newIndex);
        }
    }

    selectMode(index) {
        this.currentIndex = index;
        this.currentMode = this.modes[index];
        this.updateUI();

        // Scroll card into view
        const card = this.cards[index];
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    onScroll() {
        // Detect which card is most visible
        const carouselRect = this.carousel.getBoundingClientRect();
        const centerX = carouselRect.left + carouselRect.width / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        this.cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(centerX - cardCenterX);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== this.currentIndex) {
            this.currentIndex = closestIndex;
            this.currentMode = this.modes[closestIndex];
            this.updateUI(false); // Don't scroll again
        }
    }

    updateUI(scroll = true) {
        // Get current active card
        const currentActive = document.querySelector('.mode-card.active');
        const newActiveCard = this.cards[this.currentIndex];

        // If same card, no transition needed
        if (currentActive === newActiveCard) {
            return;
        }

        // Fade out current card
        if (currentActive) {
            currentActive.classList.add('fading-out');

            setTimeout(() => {
                // Remove old active
                this.cards.forEach(card => {
                    card.classList.remove('active', 'fading-out');
                });

                // Add new active with fade in
                newActiveCard?.classList.add('active');
            }, 200); // Wait for fade out
        } else {
            // No current card, just show new one
            this.cards.forEach(card => card.classList.remove('active'));
            newActiveCard?.classList.add('active');
        }

        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        // Update mode panels
        document.querySelectorAll('.mode-option-panel').forEach(panel => {
            panel.classList.add('hidden');
        });

        const activePanel = document.getElementById(`panel-${this.currentMode}`);
        if (activePanel) {
            activePanel.classList.remove('hidden');
        }

        // Update play button text
        if (this.playBtn) {
            const texts = {
                'solo': '🎮 JUGAR SOLO',
                'hotseat': '👥 JUGAR LOCAL',
                'online': '🌐 CONECTAR'
            };
            this.playBtn.textContent = texts[this.currentMode] || '🎮 JUGAR';
        }
    }

    startGame() {
        console.log(`🎮 [LOBBY] Starting game: ${this.currentMode}`);

        // Hide main lobby content
        const lobbyContent = document.querySelector('.lobby-title-section');
        const carousel = document.querySelector('.mode-carousel-container');
        const dots = document.querySelector('.carousel-dots');
        const playBtn = document.getElementById('btn-play-mode');
        const options = document.getElementById('mode-options');
        const footer = document.querySelector('.lobby-footer');

        switch (this.currentMode) {
            case 'solo':
                // Import and emit to game engine
                import('./core/event-bus.js').then(({ bus }) => {
                    bus.emit('UI_START_OFFLINE', 1);
                });
                break;

            case 'hotseat':
                import('./core/event-bus.js').then(({ bus }) => {
                    bus.emit('UI_START_OFFLINE', this.playerCount);
                });
                break;

            case 'online':
                // Show online options, don't start yet
                // The buttons in online panel handle create/join
                console.log('Online mode - use create/join buttons');
                break;
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lobbyCarousel = new LobbyCarousel();
});
