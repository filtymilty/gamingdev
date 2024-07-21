document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const gameOverElement = document.getElementById('gameOver');
    const startScreenElement = document.getElementById('startScreen');
    const finalScoreElement = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');
    const startButton = document.getElementById('startButton');
    const difficultySelect = document.getElementById('difficultySelect');
    const modeSelect = document.getElementById('modeSelect');
    const pauseMenuElement = document.getElementById('pauseMenu');
    const resumeButton = document.getElementById('resumeButton');
    const returnToMainButton = document.getElementById('returnToMainButton');
    const gameOverMainMenuButton = document.getElementById('gameOverMainMenuButton');

    const gridSize = 20;
    const tileCount = 30; // Increased from 20 for more detailed gameplay
    const tileSize = canvas.width / tileCount;

    let snake = [];
    let food = {};
    let obstacles = [];
    let portals = [];
    let dx = 0;
    let dy = 0;
    let score = 0;
    let highScores = {};
    let currentHighScore = 0;
    let gameSpeed;
    let gameMode;
    let difficulty;
    let isGameActive = false;
    let isPaused = false;
    let directionQueue = [];

    const snakeColors = ['#27ae60', '#2ecc71', '#1abc9c'];
    const foodColors = ['#e74c3c', '#c0392b', '#d35400'];
    const obstacleColor = '#7f8c8d';
    const portalColors = ['#8e44ad', '#9b59b6'];

    function updateDisplayedHighScore() {
        const key = `${difficulty}-${gameMode}`;
        currentHighScore = highScores[key] || 0;
        highScoreElement.textContent = `High Score: ${currentHighScore}`;
    }

    function setGameSettings() {
        difficulty = difficultySelect.value;
        gameMode = modeSelect.value;

        switch(difficulty) {
            case 'easy':
                gameSpeed = 150;
                break;
            case 'medium':
                gameSpeed = 100;
                break;
            case 'hard':
                gameSpeed = 70;
                break;
        }
    }

    function initializeGame() {
        snake = [{ x: 10, y: 10 }];
        generateFood();
        obstacles = [];
        portals = [];
        dx = dy = 0;
        score = 0;
        isPaused = false;
        directionQueue = [];
        updateDisplayedHighScore();
    }

    function drawGame() {
        if (isPaused) return;

        clearCanvas();
        moveSnake();
        drawSnake();
        drawFood();
        if (gameMode === 'obstacles') drawObstacles();
        if (gameMode === 'portal') drawPortals();
        checkCollision();
        updateScore();
    }

    function clearCanvas() {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function moveSnake() {
        if (dx === 0 && dy === 0) return; // Don't move if no direction is set

        if (directionQueue.length > 0) {
            const newDirection = directionQueue.shift();
            dx = newDirection.dx;
            dy = newDirection.dy;
        }

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        if (gameMode === 'portal') {
            head.x = (head.x + tileCount) % tileCount;
            head.y = (head.y + tileCount) % tileCount;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            generateFood();
        } else {
            snake.pop();
        }

        if (gameMode === 'portal') {
            checkPortals();
        }
    }

    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.fillStyle = snakeColors[index % snakeColors.length];
            ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize - 2, tileSize - 2);
            ctx.strokeStyle = '#2c3e50';
            ctx.strokeRect(segment.x * tileSize, segment.y * tileSize, tileSize - 2, tileSize - 2);
        });
    }

    function drawFood() {
        ctx.fillStyle = foodColors[Math.floor(Math.random() * foodColors.length)];
        ctx.beginPath();
        ctx.arc((food.x + 0.5) * tileSize, (food.y + 0.5) * tileSize, tileSize / 2 - 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    function generateFood() {
        do {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y) || 
                 obstacles.some(obs => obs.x === food.x && obs.y === food.y));
    }

    function generateObstacles() {
        const obstacleCount = 5;
        obstacles = []; // Clear existing obstacles
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            do {
                obstacle = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            } while (snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) ||
                     food.x === obstacle.x && food.y === obstacle.y ||
                     obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y));
                obstacles.push(obstacle);
        }
    }

    function drawObstacles() {
        ctx.fillStyle = obstacleColor;
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * tileSize, obstacle.y * tileSize, tileSize, tileSize);
        });
    }

    function generatePortals() {
        portals = []; // Clear existing portals
        for (let i = 0; i < 2; i++) {
            let portal;
            do {
                portal = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            } while (snake.some(segment => segment.x === portal.x && segment.y === portal.y) ||
                     food.x === portal.x && food.y === portal.y ||
                     portals.some(p => p.x === portal.x && p.y === portal.y));
                portals.push(portal);
        }
    }

    function drawPortals() {
        portals.forEach((portal, index) => {
            ctx.fillStyle = portalColors[index];
            ctx.beginPath();
            ctx.arc((portal.x + 0.5) * tileSize, (portal.y + 0.5) * tileSize, tileSize / 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function checkPortals() {
        const head = snake[0];
        portals.forEach((portal, index) => {
            if (head.x === portal.x && head.y === portal.y) {
                const otherPortal = portals[(index + 1) % 2];
                snake[0] = { x: otherPortal.x, y: otherPortal.y };
            }
        });
    }

    function checkCollision() {
        const head = snake[0];

        if (gameMode !== 'portal') {
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameOver();
                return;
            }
        }

        // Start checking for self-collision from the 4th segment
        for (let i = 4; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        if (gameMode === 'obstacles') {
            if (obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
                gameOver();
            }
        }
    }

    function updateScore() {
        scoreElement.textContent = `Score: ${score}`;
        if (score > currentHighScore) {
            currentHighScore = score;
            highScores[`${difficulty}-${gameMode}`] = currentHighScore;
            highScoreElement.textContent = `High Score: ${currentHighScore}`;
            saveHighScores();
        }
    }

    function gameOver() {
        clearInterval(gameLoop);
        isGameActive = false;
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
        // Ensure high score is saved even if the game ends without a new high score
        updateScore();
    }

    function startGame() {
        setGameSettings();
        initializeGame();
        startScreenElement.style.display = 'none';
        gameOverElement.style.display = 'none';
        pauseMenuElement.style.display = 'none';

        if (gameMode === 'obstacles') {
            generateObstacles();
        } else if (gameMode === 'portal') {
            generatePortals();
        }

        gameLoop = setInterval(drawGame, gameSpeed);
        isGameActive = true;
    }

    function restartGame() {
        gameOverElement.style.display = 'none';
        startGame();
    }

    function handleKeydown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            togglePause();
            return;
        }

        if (isPaused || !isGameActive) return;

        let newDx = dx;
        let newDy = dy;

        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (dy === 0) {
                    newDx = 0;
                    newDy = -1;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (dy === 0) {
                    newDx = 0;
                    newDy = 1;
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (dx === 0) {
                    newDx = -1;
                    newDy = 0;
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (dx === 0) {
                    newDx = 1;
                    newDy = 0;
                }
                break;
        }

        if ((newDx !== dx || newDy !== dy) && !(dx === 0 && dy === 0)) {
            directionQueue.push({ dx: newDx, dy: newDy });
        } else if (dx === 0 && dy === 0) {
            // Immediately set direction if it's the first move
            dx = newDx;
            dy = newDy;
        }
    }

    function togglePause() {
        if (!isGameActive) return;
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(gameLoop);
            pauseMenuElement.style.display = 'block';
        } else {
            gameLoop = setInterval(drawGame, gameSpeed);
            pauseMenuElement.style.display = 'none';
        }
    }

    function returnToMainMenu() {
        clearInterval(gameLoop);
        isPaused = false;
        isGameActive = false;
        pauseMenuElement.style.display = 'none';
        gameOverElement.style.display = 'none';
        startScreenElement.style.display = 'block';
        updateDisplayedHighScore();
    }

    function drawInitialBackground() {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchTime = 0;

    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        lastTouchTime = new Date().getTime();
    }

    function handleTouchMove(event) {
        event.preventDefault(); // Prevent scrolling while playing
        if (isPaused || !isGameActive) return;

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        let newDx = dx;
        let newDy = dy;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && dy !== 0) {
                newDx = 1;
                newDy = 0;
            } else if (deltaX < 0 && dy !== 0) {
                newDx = -1;
                newDy = 0;
            }
        } else {
            // Vertical swipe
            if (deltaY > 0 && dx !== 0) {
                newDx = 0;
                newDy = 1;
            } else if (deltaY < 0 && dx !== 0) {
                newDx = 0;
                newDy = -1;
            }
        }

        if ((newDx !== dx || newDy !== dy) && !(dx === 0 && dy === 0)) {
            directionQueue.push({ dx: newDx, dy: newDy });
        } else if (dx === 0 && dy === 0) {
            // Immediately set direction if it's the first move
            dx = newDx;
            dy = newDy;
        }

        // Update touch start position for next move
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }

    function handleTouchEnd(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTouchTime;
        if (tapLength < 300 && tapLength > 0) {
            togglePause();
        }
    }

    function loadHighScores() {
        try {
            const savedHighScores = localStorage.getItem('snakeHighScores');
            if (savedHighScores) {
                highScores = JSON.parse(savedHighScores);
            }
        } catch (error) {
            console.error('Error loading high scores:', error);
            highScores = {}; // Reset to default if there's an error
        }
    }

    function saveHighScores() {
        try {
            localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
        } catch (error) {
            console.error('Error saving high scores:', error);
        }
    }

    resumeButton.addEventListener('click', togglePause);
    returnToMainButton.addEventListener('click', returnToMainMenu);
    document.addEventListener('keydown', handleKeydown);
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    gameOverMainMenuButton.addEventListener('click', returnToMainMenu);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('load', () => {
        loadHighScores();
        difficulty = difficultySelect.value;
        gameMode = modeSelect.value;
        updateDisplayedHighScore();
        drawInitialBackground();
    });

    window.addEventListener('beforeunload', saveHighScores);

    difficultySelect.addEventListener('change', () => {
        difficulty = difficultySelect.value;
        updateDisplayedHighScore();
    });

    modeSelect.addEventListener('change', () => {
        gameMode = modeSelect.value;
        updateDisplayedHighScore();
    });

    startScreenElement.style.display = 'block';
});
