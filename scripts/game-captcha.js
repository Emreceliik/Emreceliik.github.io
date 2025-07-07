/**
 * Game-based CAPTCHA System
 * 5 Different Mini Games: Dino Jump, Memory Cards, Color Match, Puzzle, Snake
 * Mouse-only controls, optimized for 300px height canvas
 */

class GameCaptcha {
    constructor() {
        this.games = ['dino', 'memory', 'colorMatch', 'puzzle', 'snake'];
        this.currentGame = null;
        this.score = 0;
        this.target = 10;
        this.isCompleted = false;
        this.gameInterval = null;
        this.canvasWidth = 0;
        this.canvasHeight = 300;
        
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
        
        // Get canvas dimensions
        if (this.gameCanvas) {
            this.canvasWidth = this.gameCanvas.offsetWidth;
        }
        
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
        
        // Update canvas dimensions
        this.canvasWidth = this.gameCanvas.offsetWidth;
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
    
    // 1. DINO JUMP GAME - Compact Version
    loadDinoGame() {
        this.gameTitle.textContent = '🦕 Dino Jump';
        this.gameInstructions.textContent = 'Click anywhere to jump! Avoid 8 cacti to verify.';
        this.target = 8;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas dino-game';
        this.gameCanvas.innerHTML = `
            <div id="dino" style="
                position: absolute;
                bottom: 40px;
                left: 30px;
                width: 30px;
                height: 30px;
                background: #8B4513;
                border-radius: 50%;
                transition: bottom 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            ">🦕</div>
            <div id="ground" style="
                position: absolute;
                bottom: 0;
                width: 100%;
                height: 40px;
                background: linear-gradient(to top, #8B4513, #D2B48C);
            "></div>
        `;
        
        let dino = document.getElementById('dino');
        let isJumping = false;
        let obstacles = [];
        let gameSpeed = 3;
        
        const jump = () => {
            if (!isJumping && !this.isCompleted) {
                isJumping = true;
                dino.style.bottom = '120px';
                setTimeout(() => {
                    dino.style.bottom = '40px';
                    isJumping = false;
                }, 500);
            }
        };
        
        this.gameCanvas.addEventListener('click', jump);
        
        const createObstacle = () => {
            const obstacle = document.createElement('div');
            obstacle.style.cssText = `
                position: absolute;
                bottom: 40px;
                right: -25px;
                width: 25px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            `;
            obstacle.textContent = '🌵';
            this.gameCanvas.appendChild(obstacle);
            obstacles.push(obstacle);
        };
        
        const gameLoop = () => {
            if (this.isCompleted) return;
            
            obstacles.forEach((obstacle, index) => {
                let obstacleRight = parseInt(obstacle.style.right) || 0;
                obstacleRight += gameSpeed;
                obstacle.style.right = obstacleRight + 'px';
                
                // Check collision (more forgiving hitbox)
                if (obstacleRight > 50 && obstacleRight < 80 && !isJumping) {
                    this.updateGameStatus('failed', '💥 Game Over! Click 🎲 New Game to try again.');
                    clearInterval(this.gameInterval);
                    return;
                }
                
                // Remove obstacle and add score
                if (obstacleRight > this.canvasWidth + 25) {
                    obstacle.remove();
                    obstacles.splice(index, 1);
                    this.score++;
                    this.updateScore();
                    
                    if (this.score >= this.target) {
                        this.completeGame();
                        return;
                    }
                }
            });
        };
        
        this.gameInterval = setInterval(() => {
            if (Math.random() < 0.015 && !this.isCompleted) createObstacle();
            gameLoop();
        }, 50);
    }
    
    // 2. MEMORY CARDS GAME - Smaller 3x2 Grid
    loadMemoryGame() {
        this.gameTitle.textContent = '🧠 Memory Cards';
        this.gameInstructions.textContent = 'Match pairs of cards! Find 3 pairs to verify.';
        this.target = 3;
        this.updateScore();
        
        const emojis = ['🎮', '🎯', '🎨', '🎪', '🎭', '🎵'];
        const cards = [...emojis.slice(0, 3), ...emojis.slice(0, 3)].sort(() => Math.random() - 0.5);
        
        this.gameCanvas.className = 'game-canvas memory-game';
        this.gameCanvas.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 20px;
            background: linear-gradient(45deg, #667eea, #764ba2);
        `;
        this.gameCanvas.innerHTML = '';
        
        let flippedCards = [];
        let matchedPairs = 0;
        
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                aspect-ratio: 1;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                cursor: pointer;
                transition: transform 0.3s ease;
                user-select: none;
                min-height: 60px;
            `;
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.textContent = '❓';
            
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('flipped')) {
                    card.style.transform = 'scale(1.05)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('flipped')) {
                    card.style.transform = 'scale(1)';
                }
            });
            
            card.addEventListener('click', () => {
                if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    card.textContent = emoji;
                    card.style.background = '#f0f8ff';
                    flippedCards.push(card);
                    
                    if (flippedCards.length === 2) {
                        setTimeout(() => {
                            if (flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji) {
                                flippedCards.forEach(c => {
                                    c.classList.add('matched');
                                    c.style.background = '#d4edda';
                                    c.style.transform = 'scale(0.9)';
                                });
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
                                    c.style.background = 'white';
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
    
    // 3. COLOR MATCH GAME - Compact Version
    loadColorMatchGame() {
        this.gameTitle.textContent = '🎨 Color Match';
        this.gameInstructions.textContent = 'Click the matching color! Get 6 correct matches.';
        this.target = 6;
        this.updateScore();
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        
        const loadRound = () => {
            if (this.isCompleted) return;
            
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
            this.gameCanvas.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
            `;
            this.gameCanvas.innerHTML = `
                <div style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    margin-bottom: 15px;
                    border: 3px solid white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    background-color: ${targetColor};
                "></div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                ">
                    ${options.map(color => `
                        <div style="
                            width: 45px;
                            height: 45px;
                            border-radius: 50%;
                            cursor: pointer;
                            border: 2px solid white;
                            transition: transform 0.3s ease;
                            background-color: ${color};
                        " data-color="${color}"></div>
                    `).join('')}
                </div>
            `;
            
            this.gameCanvas.querySelectorAll('[data-color]').forEach(option => {
                option.addEventListener('mouseenter', () => {
                    option.style.transform = 'scale(1.1)';
                });
                
                option.addEventListener('mouseleave', () => {
                    option.style.transform = 'scale(1)';
                });
                
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
    
    // 4. PUZZLE GAME - 2x2 Mini Puzzle
    loadPuzzleGame() {
        this.gameTitle.textContent = '🧩 Number Puzzle';
        this.gameInstructions.textContent = 'Arrange numbers 1-3 in order! Complete the puzzle to verify.';
        this.target = 1;
        this.updateScore();
        
        let numbers = [1, 2, 3, ''];
        numbers.sort(() => Math.random() - 0.5);
        
        this.gameCanvas.className = 'game-canvas puzzle-game';
        this.gameCanvas.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            padding: 40px;
            background: linear-gradient(45deg, #667eea, #764ba2);
        `;
        
        const renderPuzzle = () => {
            this.gameCanvas.innerHTML = '';
            numbers.forEach((num, index) => {
                const piece = document.createElement('div');
                piece.style.cssText = `
                    aspect-ratio: 1;
                    background: ${num === '' ? 'transparent' : 'white'};
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    cursor: ${num === '' ? 'default' : 'pointer'};
                    transition: all 0.3s ease;
                    border: 2px ${num === '' ? 'dashed rgba(255,255,255,0.5)' : 'solid transparent'};
                    min-height: 80px;
                `;
                piece.textContent = num;
                piece.dataset.index = index;
                
                if (num !== '') {
                    piece.addEventListener('mouseenter', () => {
                        piece.style.borderColor = '#fff';
                        piece.style.transform = 'scale(1.05)';
                    });
                    
                    piece.addEventListener('mouseleave', () => {
                        piece.style.borderColor = 'transparent';
                        piece.style.transform = 'scale(1)';
                    });
                    
                    piece.addEventListener('click', () => {
                        const emptyIndex = numbers.indexOf('');
                        const clickedIndex = index;
                        
                        // Check if adjacent to empty space
                        const adjacentIndices = [
                            emptyIndex - 1, emptyIndex + 1, // horizontal
                            emptyIndex - 2, emptyIndex + 2  // vertical
                        ].filter(i => {
                            if (i < 0 || i > 3) return false;
                            if (emptyIndex % 2 === 0 && i === emptyIndex - 1) return false;
                            if (emptyIndex % 2 === 1 && i === emptyIndex + 1) return false;
                            return true;
                        });
                        
                        if (adjacentIndices.includes(clickedIndex)) {
                            // Swap positions
                            [numbers[emptyIndex], numbers[clickedIndex]] = [numbers[clickedIndex], numbers[emptyIndex]];
                            renderPuzzle();
                            
                            // Check if solved
                            const solved = numbers.slice(0, 3).every((num, i) => num === i + 1);
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
    
    // 5. SNAKE GAME - Click Direction Control
    loadSnakeGame() {
        this.gameTitle.textContent = '🐍 Snake Mini';
        this.gameInstructions.textContent = 'Click LEFT/RIGHT/UP/DOWN sides to move! Eat 4 apples to verify.';
        this.target = 4;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas snake-game';
        this.gameCanvas.style.cssText = `
            position: relative;
            background: #111;
            border: 2px solid #333;
        `;
        this.gameCanvas.innerHTML = '';
        
        const boardSize = 12; // Smaller board for 300px height
        let snake = [{x: 6, y: 6}];
        let food = {x: 9, y: 9};
        let direction = {x: 1, y: 0};
        let gameRunning = true;
        const cellSize = Math.min(20, (this.canvasWidth - 4) / boardSize);
        
        const drawGame = () => {
            this.gameCanvas.innerHTML = '';
            
            // Draw snake
            snake.forEach((segment, index) => {
                const snakeElement = document.createElement('div');
                snakeElement.style.cssText = `
                    position: absolute;
                    width: ${cellSize}px;
                    height: ${cellSize}px;
                    background: ${index === 0 ? '#00ff00' : '#90EE90'};
                    border-radius: 2px;
                    left: ${segment.x * cellSize}px;
                    top: ${segment.y * cellSize}px;
                `;
                this.gameCanvas.appendChild(snakeElement);
            });
            
            // Draw food
            const foodElement = document.createElement('div');
            foodElement.style.cssText = `
                position: absolute;
                width: ${cellSize}px;
                height: ${cellSize}px;
                background: #ff0000;
                border-radius: 50%;
                left: ${food.x * cellSize}px;
                top: ${food.y * cellSize}px;
            `;
            this.gameCanvas.appendChild(foodElement);
        };
        
        const moveSnake = () => {
            if (!gameRunning || this.isCompleted) return;
            
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
                do {
                    food = {
                        x: Math.floor(Math.random() * boardSize),
                        y: Math.floor(Math.random() * boardSize)
                    };
                } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
            } else {
                snake.pop();
            }
            
            drawGame();
        };
        
        // Mouse-only directional controls
        this.gameCanvas.addEventListener('click', (e) => {
            if (!gameRunning || this.isCompleted) return;
            
            const rect = this.gameCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Determine direction based on click position
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal movement
                if (deltaX > 0 && direction.x !== -1) {
                    direction = {x: 1, y: 0}; // Right
                } else if (deltaX < 0 && direction.x !== 1) {
                    direction = {x: -1, y: 0}; // Left
                }
            } else {
                // Vertical movement
                if (deltaY > 0 && direction.y !== -1) {
                    direction = {x: 0, y: 1}; // Down
                } else if (deltaY < 0 && direction.y !== 1) {
                    direction = {x: 0, y: -1}; // Up
                }
            }
        });
        
        drawGame();
        this.gameInterval = setInterval(moveSnake, 250);
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