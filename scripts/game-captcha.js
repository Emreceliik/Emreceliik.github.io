/**
 * Game-based CAPTCHA System
 * 5 Different Mini Games: Dino Jump, Memory Cards, Color Match, Puzzle, Snake
 */

class GameCaptcha {
    constructor() {
        this.games = ['dino', 'memory', 'colorMatch', 'puzzle', 'snake'];
        this.currentGame = null;
        this.score = 0;
        this.target = 10;
        this.isCompleted = false;
        this.gameInterval = null;
        
        this.initializeElements();
        this.loadRandomGame();
    }
    
    initializeElements() {
        this.gameTitle = document.getElementById('gameTitle');
        this.gameScore = document.getElementById('gameScore');
        this.gameTarget = document.getElementById('gameTarget');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.gameInstructions = document.getElementById('gameInstructions');
        this.gameStatus = document.getElementById('gameStatus');
        this.gameVerified = document.getElementById('gameVerified');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.refreshBtn = document.getElementById('refreshGame');
        
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.loadRandomGame());
        }
    }
    
    loadRandomGame() {
        this.resetGame();
        const randomIndex = Math.floor(Math.random() * this.games.length);
        this.currentGame = this.games[randomIndex];
        
        switch(this.currentGame) {
            case 'dino':
                this.loadDinoGame();
                break;
            case 'memory':
                this.loadMemoryGame();
                break;
            case 'colorMatch':
                this.loadColorMatchGame();
                break;
            case 'puzzle':
                this.loadPuzzleGame();
                break;
            case 'snake':
                this.loadSnakeGame();
                break;
        }
    }
    
    resetGame() {
        this.score = 0;
        this.isCompleted = false;
        this.updateScore();
        this.updateGameStatus('pending', '⚡ Complete the challenge!');
        this.gameVerified.value = 'false';
        this.submitBtn.disabled = true;
        this.submitText.textContent = '🎮 Complete Game First';
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        this.gameCanvas.innerHTML = '';
        this.gameCanvas.className = 'game-canvas';
    }
    
    updateScore() {
        this.gameScore.textContent = `Score: ${this.score}`;
        this.gameTarget.textContent = `Target: ${this.target}`;
    }
    
    updateGameStatus(type, message) {
        this.gameStatus.className = `status-${type}`;
        this.gameStatus.textContent = message;
    }
    
    completeGame() {
        this.isCompleted = true;
        this.gameVerified.value = 'true';
        this.updateGameStatus('success', '✅ Verification Complete!');
        this.submitBtn.disabled = false;
        this.submitText.textContent = '📧 Send Message';
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
    }
    
    // 1. DINO JUMP GAME
    loadDinoGame() {
        this.gameTitle.textContent = '🦕 Dino Jump';
        this.gameInstructions.textContent = 'Click to jump and avoid obstacles! Reach 10 points to verify.';
        this.target = 10;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas dino-game';
        this.gameCanvas.innerHTML = `
            <div id="dino" style="
                position: absolute;
                bottom: 50px;
                left: 50px;
                width: 40px;
                height: 40px;
                background: #8B4513;
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                transition: bottom 0.3s ease;
            ">🦕</div>
            <div id="ground" style="
                position: absolute;
                bottom: 0;
                width: 100%;
                height: 50px;
                background: linear-gradient(to top, #8B4513, #D2B48C);
            "></div>
        `;
        
        let dino = document.getElementById('dino');
        let isJumping = false;
        let obstacles = [];
        let gameSpeed = 2;
        
        const jump = () => {
            if (!isJumping) {
                isJumping = true;
                dino.style.bottom = '120px';
                setTimeout(() => {
                    dino.style.bottom = '50px';
                    isJumping = false;
                }, 600);
            }
        };
        
        this.gameCanvas.addEventListener('click', jump);
        
        const createObstacle = () => {
            const obstacle = document.createElement('div');
            obstacle.style.cssText = `
                position: absolute;
                bottom: 50px;
                right: -30px;
                width: 30px;
                height: 40px;
                background: #654321;
                border-radius: 4px;
            `;
            obstacle.textContent = '🌵';
            this.gameCanvas.appendChild(obstacle);
            obstacles.push(obstacle);
        };
        
        const gameLoop = () => {
            obstacles.forEach((obstacle, index) => {
                let obstacleLeft = parseInt(obstacle.style.right);
                obstacleLeft += gameSpeed;
                obstacle.style.right = obstacleLeft + 'px';
                
                // Check collision
                if (obstacleLeft > 80 && obstacleLeft < 120 && !isJumping) {
                    this.updateGameStatus('failed', '💥 Game Over! Click 🎲 New Game to try again.');
                    clearInterval(this.gameInterval);
                    return;
                }
                
                // Remove obstacle and add score
                if (obstacleLeft > 600) {
                    obstacle.remove();
                    obstacles.splice(index, 1);
                    this.score++;
                    this.updateScore();
                    
                    if (this.score >= this.target) {
                        this.completeGame();
                    }
                }
            });
        };
        
        this.gameInterval = setInterval(() => {
            if (Math.random() < 0.02) createObstacle();
            gameLoop();
        }, 50);
    }
    
    // 2. MEMORY CARDS GAME
    loadMemoryGame() {
        this.gameTitle.textContent = '🧠 Memory Cards';
        this.gameInstructions.textContent = 'Match pairs of cards! Find 5 pairs to verify.';
        this.target = 5;
        this.updateScore();
        
        const emojis = ['🎮', '🎯', '🎨', '🎪', '🎭', '🎵', '🎸', '🎺'];
        const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        
        this.gameCanvas.className = 'game-canvas memory-game';
        this.gameCanvas.innerHTML = '';
        
        let flippedCards = [];
        let matchedPairs = 0;
        
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.textContent = '❓';
            
            card.addEventListener('click', () => {
                if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    card.textContent = emoji;
                    flippedCards.push(card);
                    
                    if (flippedCards.length === 2) {
                        setTimeout(() => {
                            if (flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji) {
                                flippedCards.forEach(c => c.classList.add('matched'));
                                matchedPairs++;
                                this.score = matchedPairs;
                                this.updateScore();
                                
                                if (matchedPairs >= this.target) {
                                    this.completeGame();
                                }
                            } else {
                                flippedCards.forEach(c => {
                                    c.classList.remove('flipped');
                                    c.textContent = '❓';
                                });
                            }
                            flippedCards = [];
                        }, 1000);
                    }
                }
            });
            
            this.gameCanvas.appendChild(card);
        });
    }
    
    // 3. COLOR MATCH GAME
    loadColorMatchGame() {
        this.gameTitle.textContent = '🎨 Color Match';
        this.gameInstructions.textContent = 'Click the color that matches the target! Get 10 correct matches.';
        this.target = 10;
        this.updateScore();
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        
        const loadRound = () => {
            const targetColor = colors[Math.floor(Math.random() * colors.length)];
            const options = [targetColor];
            
            // Add 2 different colors
            while (options.length < 3) {
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                if (!options.includes(randomColor)) {
                    options.push(randomColor);
                }
            }
            
            options.sort(() => Math.random() - 0.5);
            
            this.gameCanvas.className = 'game-canvas color-match-game';
            this.gameCanvas.innerHTML = `
                <div class="color-target" style="background-color: ${targetColor}"></div>
                <div class="color-options">
                    ${options.map(color => `
                        <div class="color-option" 
                             style="background-color: ${color}" 
                             data-color="${color}">
                        </div>
                    `).join('')}
                </div>
            `;
            
            this.gameCanvas.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', () => {
                    if (option.dataset.color === targetColor) {
                        this.score++;
                        this.updateScore();
                        
                        if (this.score >= this.target) {
                            this.completeGame();
                        } else {
                            setTimeout(() => loadRound(), 500);
                        }
                    } else {
                        this.updateGameStatus('failed', '❌ Wrong color! Click 🎲 New Game to try again.');
                    }
                });
            });
        };
        
        loadRound();
    }
    
    // 4. PUZZLE GAME
    loadPuzzleGame() {
        this.gameTitle.textContent = '🧩 Number Puzzle';
        this.gameInstructions.textContent = 'Arrange numbers 1-8 in order! Complete the puzzle to verify.';
        this.target = 1;
        this.updateScore();
        
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, ''];
        numbers.sort(() => Math.random() - 0.5);
        
        this.gameCanvas.className = 'game-canvas puzzle-game';
        
        const renderPuzzle = () => {
            this.gameCanvas.innerHTML = '';
            numbers.forEach((num, index) => {
                const piece = document.createElement('div');
                piece.className = `puzzle-piece ${num === '' ? 'empty' : ''}`;
                piece.textContent = num;
                piece.dataset.index = index;
                
                if (num !== '') {
                    piece.addEventListener('click', () => {
                        const emptyIndex = numbers.indexOf('');
                        const clickedIndex = index;
                        
                        // Check if adjacent to empty space
                        const adjacentIndices = [
                            emptyIndex - 1, emptyIndex + 1, // horizontal
                            emptyIndex - 3, emptyIndex + 3  // vertical
                        ].filter(i => {
                            if (i < 0 || i > 8) return false;
                            if (emptyIndex % 3 === 0 && i === emptyIndex - 1) return false;
                            if (emptyIndex % 3 === 2 && i === emptyIndex + 1) return false;
                            return true;
                        });
                        
                        if (adjacentIndices.includes(clickedIndex)) {
                            // Swap positions
                            [numbers[emptyIndex], numbers[clickedIndex]] = [numbers[clickedIndex], numbers[emptyIndex]];
                            renderPuzzle();
                            
                            // Check if solved
                            const solved = numbers.slice(0, 8).every((num, i) => num === i + 1);
                            if (solved) {
                                this.score = 1;
                                this.updateScore();
                                this.completeGame();
                            }
                        }
                    });
                }
                
                this.gameCanvas.appendChild(piece);
            });
        };
        
        renderPuzzle();
    }
    
    // 5. SNAKE GAME
    loadSnakeGame() {
        this.gameTitle.textContent = '🐍 Snake Mini';
        this.gameInstructions.textContent = 'Use arrow keys or click to move! Eat 5 apples to verify.';
        this.target = 5;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas snake-game';
        this.gameCanvas.innerHTML = '';
        
        const boardSize = 20;
        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let direction = {x: 0, y: 0};
        let gameRunning = true;
        
        const drawGame = () => {
            this.gameCanvas.innerHTML = '';
            
            // Draw snake
            snake.forEach(segment => {
                const snakeElement = document.createElement('div');
                snakeElement.className = 'snake-pixel';
                snakeElement.style.left = (segment.x * 15) + 'px';
                snakeElement.style.top = (segment.y * 15) + 'px';
                this.gameCanvas.appendChild(snakeElement);
            });
            
            // Draw food
            const foodElement = document.createElement('div');
            foodElement.className = 'food-pixel';
            foodElement.style.left = (food.x * 15) + 'px';
            foodElement.style.top = (food.y * 15) + 'px';
            this.gameCanvas.appendChild(foodElement);
        };
        
        const moveSnake = () => {
            if (!gameRunning) return;
            
            const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
            
            // Check walls
            if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
                gameRunning = false;
                this.updateGameStatus('failed', '💥 Hit the wall! Click 🎲 New Game to try again.');
                return;
            }
            
            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameRunning = false;
                this.updateGameStatus('failed', '💥 Hit yourself! Click 🎲 New Game to try again.');
                return;
            }
            
            snake.unshift(head);
            
            // Check food
            if (head.x === food.x && head.y === food.y) {
                this.score++;
                this.updateScore();
                
                if (this.score >= this.target) {
                    this.completeGame();
                    return;
                }
                
                // Generate new food
                food = {
                    x: Math.floor(Math.random() * boardSize),
                    y: Math.floor(Math.random() * boardSize)
                };
            } else {
                snake.pop();
            }
            
            drawGame();
        };
        
        // Controls
        const handleKeyPress = (e) => {
            if (!gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp': direction = {x: 0, y: -1}; break;
                case 'ArrowDown': direction = {x: 0, y: 1}; break;
                case 'ArrowLeft': direction = {x: -1, y: 0}; break;
                case 'ArrowRight': direction = {x: 1, y: 0}; break;
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Click controls
        this.gameCanvas.addEventListener('click', (e) => {
            if (!gameRunning) return;
            
            const rect = this.gameCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            if (Math.abs(x - centerX) > Math.abs(y - centerY)) {
                direction = x > centerX ? {x: 1, y: 0} : {x: -1, y: 0};
            } else {
                direction = y > centerY ? {x: 0, y: 1} : {x: 0, y: -1};
            }
        });
        
        drawGame();
        
        this.gameInterval = setInterval(moveSnake, 200);
    }
}

// Initialize the game captcha when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gameCanvas')) {
        window.gameCaptcha = new GameCaptcha();
    }
});

// If DOM is already loaded
if (document.readyState === 'loading') {
    // Still loading, wait for the DOMContentLoaded event
} else {
    // DOM is already loaded
    if (document.getElementById('gameCanvas')) {
        window.gameCaptcha = new GameCaptcha();
    }
} 