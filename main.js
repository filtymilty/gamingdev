document.addEventListener('DOMContentLoaded', function() {
    const games = [
        {
            icon: '🐍',
            title: 'Snake Game',
            description: 'Snake game with multiple difficulties and game modes including obstacles and portals.',
            link: 'games/snake/snake.html',
            comingSoon: false
        },
        {
            icon: '🚧',
            title: 'Coming Soon',
            description: 'An exciting new game is under construction. Stay tuned!',
            link: '#',
            comingSoon: true
        }
        // Add more games here as they become available
    ];

    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = `game-card${game.comingSoon ? ' coming-soon' : ''}`;
        
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h2 class="game-title">${game.title}</h2>
            <p class="game-description">${game.description}</p>
            <a href="${game.link}" class="game-link" ${game.comingSoon ? 'aria-disabled="true"' : ''} aria-label="${game.comingSoon ? 'Coming Soon' : 'Play ' + game.title}">${game.comingSoon ? 'Coming Soon' : 'Play Game'}</a>
        `;

        return card;
    }

    function renderGameCards() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) {
            console.error('Game grid element not found');
            return;
        }
        games.forEach(game => {
            gameGrid.appendChild(createGameCard(game));
        });
    }

    renderGameCards();
});
