/**
 * Game-based CAPTCHA System
 * 5 Different Mini Games: Dino Jump, Memory Cards, Color Match, Puzzle, Snake
 * Mouse-only controls, optimized for 300px height canvas
 */

class GameCaptcha {
    constructor() {
        this.games = ['timing', 'memory', 'colorMatch', 'math', 'target', 'balloon', 'reaction'];
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
            case 'timing':
                this.loadTimingGame();
                break;
            case 'memory':
                this.loadMemoryGame();
                break;
            case 'colorMatch':
                this.loadColorMatchGame();
                break;
            case 'math':
                this.loadMathGame();
                break;
            case 'target':
                this.loadTargetGame();
                break;
            case 'balloon':
                this.loadBalloonGame();
                break;
            case 'reaction':
                this.loadReactionGame();
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
        
        // Clean up reaction game event listener
        if (this.reactionClickHandler) {
            this.gameCanvas.removeEventListener('click', this.reactionClickHandler);
            this.reactionClickHandler = null;
        }
        
        // Clear any timeouts (especially for reaction game)
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        this.gameCanvas.innerHTML = '';
        this.gameCanvas.className = 'game-canvas';
        this.gameCanvas.style.cssText = ''; // Reset any inline styles
        
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
    
    // 1. TIMING GAME - Click the moving target at the right moment
    loadTimingGame() {
        this.gameTitle.textContent = '⏰ Perfect Timing';
        this.gameInstructions.textContent = 'Click the moving target when it\'s in the green zone! Get 3 perfect hits.';
        this.target = 3;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas timing-game';
        this.gameCanvas.style.cssText = `
            position: relative;
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            border: 2px solid #333;
            overflow: hidden;
        `;
        this.gameCanvas.innerHTML = '';
        
        // Create target zone (green area)
        const targetZone = document.createElement('div');
        targetZone.style.cssText = `
            position: absolute;
            top: 50%;
            left: 40%;
            width: 20%;
            height: 60px;
            background: rgba(0, 255, 0, 0.3);
            border: 2px solid #00ff00;
            border-radius: 8px;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: white;
            font-weight: bold;
        `;
        targetZone.textContent = 'TARGET ZONE';
        this.gameCanvas.appendChild(targetZone);
        
        // Create moving target
        const movingTarget = document.createElement('div');
        movingTarget.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 40px;
            height: 40px;
            background: #ff4444;
            border-radius: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            z-index: 10;
        `;
        movingTarget.textContent = '🎯';
        this.gameCanvas.appendChild(movingTarget);
        
        let direction = 1;
        let position = 0;
        const speed = 2;
        const canvasWidth = this.canvasWidth - 40;
        
        const moveTarget = () => {
            if (this.isCompleted) return;
            
            position += speed * direction;
            
            if (position >= canvasWidth || position <= 0) {
                direction *= -1;
            }
            
            movingTarget.style.left = position + 'px';
        };
        
        movingTarget.addEventListener('click', () => {
            if (this.isCompleted) return;
            
            const targetLeft = position;
            const targetRight = position + 40; // target width
            const zoneLeft = this.canvasWidth * 0.4;
            const zoneRight = this.canvasWidth * 0.6;
            
            // More forgiving hit detection - if any part of target overlaps with zone
            if (targetRight >= zoneLeft && targetLeft <= zoneRight) {
                // Perfect hit!
                this.score++;
                this.updateScore();
                movingTarget.style.background = '#00ff00';
                movingTarget.textContent = '✅';
                
                setTimeout(() => {
                    movingTarget.style.background = '#ff4444';
                    movingTarget.textContent = '🎯';
                }, 300);
                
                if (this.score >= this.target) {
                    this.completeGame();
                    return;
                }
            } else {
                // Miss!
                movingTarget.style.background = '#ff0000';
                movingTarget.textContent = '❌';
                setTimeout(() => {
                    movingTarget.style.background = '#ff4444';
                    movingTarget.textContent = '🎯';
                }, 300);
            }
        });
        
        this.gameInterval = setInterval(moveTarget, 20);
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
            gap: 15px;
            padding: 25px;
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
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                cursor: pointer;
                transition: transform 0.3s ease;
                user-select: none;
                min-height: 35px;
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
        this.gameInstructions.textContent = 'Click the matching color! Get 3 correct matches.';
        this.target = 3;
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
    
    // 4. MATH GAME - Simple arithmetic problems
    loadMathGame() {
        this.gameTitle.textContent = '🧮 Quick Math';
        this.gameInstructions.textContent = 'Solve simple math problems! Get 3 correct answers to verify.';
        this.target = 3;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas math-game';
        this.gameCanvas.style.cssText = `
            padding: 30px;
            background: linear-gradient(45deg, #ff9a56, #ffad56);
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
        `;
        
        let currentQuestion = {};
        
        const generateQuestion = () => {
            const operations = ['+', '-', '×'];
            const operation = operations[Math.floor(Math.random() * operations.length)];
            let num1, num2, correctAnswer;
            
            switch(operation) {
                case '+':
                    num1 = Math.floor(Math.random() * 20) + 1;
                    num2 = Math.floor(Math.random() * 20) + 1;
                    correctAnswer = num1 + num2;
                    break;
                case '-':
                    num1 = Math.floor(Math.random() * 20) + 10;
                    num2 = Math.floor(Math.random() * 10) + 1;
                    correctAnswer = num1 - num2;
                    break;
                case '×':
                    num1 = Math.floor(Math.random() * 5) + 2;
                    num2 = Math.floor(Math.random() * 5) + 2;
                    correctAnswer = num1 * num2;
                    break;
            }
            
            // Generate wrong answers
            const wrongAnswers = [];
            while (wrongAnswers.length < 2) {
                const wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
                if (wrong !== correctAnswer && wrong > 0 && !wrongAnswers.includes(wrong)) {
                    wrongAnswers.push(wrong);
                }
            }
            
            const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
            
            return {
                question: `${num1} ${operation} ${num2} = ?`,
                answers: allAnswers,
                correct: correctAnswer
            };
        };
        
        const loadQuestion = () => {
            if (this.isCompleted) return;
            
            currentQuestion = generateQuestion();
            
            this.gameCanvas.innerHTML = `
                <div style="
                    font-size: 2rem;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                ">${currentQuestion.question}</div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    width: 100%;
                    max-width: 300px;
                "></div>
            `;
            
            const answersContainer = this.gameCanvas.querySelector('div:last-child');
            
            currentQuestion.answers.forEach(answer => {
                const button = document.createElement('button');
                button.style.cssText = `
                    padding: 15px;
                    font-size: 1.3rem;
                    font-weight: bold;
                    background: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #333;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                `;
                button.textContent = answer;
                
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'scale(1.05)';
                    button.style.background = '#f0f0f0';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'scale(1)';
                    button.style.background = 'white';
                });
                
                button.addEventListener('click', () => {
                    if (answer === currentQuestion.correct) {
                        button.style.background = '#4CAF50';
                        button.style.color = 'white';
                        button.textContent = '✅ ' + answer;
                        
                        this.score++;
                        this.updateScore();
                        
                        setTimeout(() => {
                            if (this.score >= this.target) {
                                this.completeGame();
                            } else {
                                loadQuestion();
                            }
                        }, 1000);
                    } else {
                        button.style.background = '#f44336';
                        button.style.color = 'white';
                        button.textContent = '❌ ' + answer;
                        
                        // Show correct answer
                        const correctBtn = [...answersContainer.children].find(btn => 
                            parseInt(btn.textContent) === currentQuestion.correct
                        );
                        if (correctBtn) {
                            correctBtn.style.background = '#4CAF50';
                            correctBtn.style.color = 'white';
                            correctBtn.textContent = '✅ ' + currentQuestion.correct;
                        }
                        
                        setTimeout(() => {
                            loadQuestion();
                        }, 1500);
                    }
                    
                    // Disable all buttons
                    [...answersContainer.children].forEach(btn => {
                        btn.disabled = true;
                        btn.style.cursor = 'default';
                    });
                });
                
                answersContainer.appendChild(button);
            });
        };
        
        loadQuestion();
    }
    
    // 5. TARGET SHOOTER GAME - Click the moving targets
    loadTargetGame() {
        this.gameTitle.textContent = '🎯 Target Shooter';
        this.gameInstructions.textContent = 'Click the moving targets to shoot them! Hit 4 targets to verify.';
        this.target = 4;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas target-game';
        this.gameCanvas.style.cssText = `
            position: relative;
            background: linear-gradient(45deg, #0f0f23, #1a1a2e);
            border: 2px solid #16213e;
            overflow: hidden;
            cursor: crosshair;
        `;
        this.gameCanvas.innerHTML = '';
        
        let targets = [];
        let gameRunning = true;
        
        const createTarget = () => {
            if (!gameRunning || this.isCompleted) return;
            
            const target = document.createElement('div');
            const size = Math.random() * 20 + 30; // 30-50px
            const startX = Math.random() < 0.5 ? -size : this.canvasWidth;
            const startY = Math.random() * (this.canvasHeight - 100) + 50;
            const endX = startX === -size ? this.canvasWidth + size : -size;
            const endY = Math.random() * (this.canvasHeight - 100) + 50;
            
            target.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${startX}px;
                top: ${startY}px;
                background: radial-gradient(circle, #ff4757, #ff3742);
                border: 3px solid #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${size * 0.4}px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 10;
                box-shadow: 0 0 15px rgba(255, 71, 87, 0.5);
            `;
            target.textContent = '🎯';
            
            target.addEventListener('mouseenter', () => {
                target.style.transform = 'scale(1.1)';
                target.style.boxShadow = '0 0 25px rgba(255, 71, 87, 0.8)';
            });
            
            target.addEventListener('mouseleave', () => {
                target.style.transform = 'scale(1)';
                target.style.boxShadow = '0 0 15px rgba(255, 71, 87, 0.5)';
            });
            
            target.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Hit effect
                target.style.background = 'radial-gradient(circle, #2ed573, #20bf6b)';
                target.textContent = '💥';
                target.style.transform = 'scale(1.3)';
                target.style.transition = 'all 0.3s ease';
                
                this.score++;
                this.updateScore();
                
                setTimeout(() => {
                    if (target.parentNode) {
                        target.remove();
                    }
                    const index = targets.indexOf(target);
                    if (index > -1) {
                        targets.splice(index, 1);
                    }
                }, 300);
                
                if (this.score >= this.target) {
                    gameRunning = false;
                    this.completeGame();
                    return;
                }
            });
            
            this.gameCanvas.appendChild(target);
            targets.push(target);
            
            // Animate target movement
            const duration = Math.random() * 3000 + 2000; // 2-5 seconds
            const startTime = Date.now();
            
            const animateTarget = () => {
                if (!gameRunning || this.isCompleted || !target.parentNode) return;
                
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;
                
                if (progress >= 1) {
                    // Target escaped
                    if (target.parentNode) {
                        target.remove();
                    }
                    const index = targets.indexOf(target);
                    if (index > -1) {
                        targets.splice(index, 1);
                    }
                    return;
                }
                
                // Smooth movement from start to end
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                
                target.style.left = currentX + 'px';
                target.style.top = currentY + 'px';
                
                requestAnimationFrame(animateTarget);
            };
            
            animateTarget();
            
            // Remove target after duration if not clicked
            setTimeout(() => {
                if (target.parentNode) {
                    target.remove();
                }
                const index = targets.indexOf(target);
                if (index > -1) {
                    targets.splice(index, 1);
                }
            }, duration + 500);
        };
        
        // Create crosshair cursor effect
        this.gameCanvas.addEventListener('mousemove', (e) => {
            if (!gameRunning || this.isCompleted) return;
            
            const rect = this.gameCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Update cursor position for visual feedback
            this.gameCanvas.style.background = `
                linear-gradient(45deg, #0f0f23, #1a1a2e),
                radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.1) 0%, transparent 20px)
            `;
        });
        
        // Spawn targets at intervals
        this.gameInterval = setInterval(() => {
            if (gameRunning && !this.isCompleted && targets.length < 3) {
                createTarget();
            }
        }, 1000);
        
        // Create first target immediately
        createTarget();
    }
    
    // 6. BALLOON POP GAME - Pop the floating balloons
    loadBalloonGame() {
        this.gameTitle.textContent = '🎈 Balloon Pop';
        this.gameInstructions.textContent = 'Pop the floating balloons! Pop 5 balloons to verify.';
        this.target = 5;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas balloon-game';
        this.gameCanvas.style.cssText = `
            position: relative;
            background: linear-gradient(to bottom, #87CEEB, #98D8E8);
            border: 2px solid #4682B4;
            overflow: hidden;
        `;
        this.gameCanvas.innerHTML = '';
        
        let balloons = [];
        const balloonColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', '#AB47BC', '#66BB6A'];
        
        const createBalloon = () => {
            if (this.isCompleted || balloons.length >= 4) return;
            
            const balloon = document.createElement('div');
            const size = Math.random() * 30 + 40; // 40-70px
            const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            const startX = Math.random() * (this.canvasWidth - size);
            const startY = this.canvasHeight + size;
            
            balloon.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size * 1.2}px;
                left: ${startX}px;
                top: ${startY}px;
                background: radial-gradient(ellipse 60% 80% at center 20%, ${color}, ${color}DD);
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: inset -10px -10px 0 rgba(0,0,0,0.1);
                font-size: ${size * 0.6}px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
            `;
            balloon.textContent = '🎈';
            
            // Floating animation
            let floatY = startY;
            const floatSpeed = Math.random() * 2 + 1; // 1-3px per frame
            const wiggle = Math.random() * 0.02 + 0.01; // Small horizontal movement
            let time = 0;
            
            balloon.addEventListener('mouseenter', () => {
                balloon.style.transform = 'scale(1.1)';
            });
            
            balloon.addEventListener('mouseleave', () => {
                balloon.style.transform = 'scale(1)';
            });
            
            balloon.addEventListener('click', () => {
                // Pop effect
                balloon.style.background = '#FFD700';
                balloon.textContent = '💥';
                balloon.style.transform = 'scale(1.5)';
                balloon.style.transition = 'all 0.3s ease';
                
                this.score++;
                this.updateScore();
                
                setTimeout(() => {
                    if (balloon.parentNode) {
                        balloon.remove();
                    }
                    const index = balloons.indexOf(balloon);
                    if (index > -1) {
                        balloons.splice(index, 1);
                    }
                }, 300);
                
                if (this.score >= this.target) {
                    this.completeGame();
                    return;
                }
            });
            
            this.gameCanvas.appendChild(balloon);
            balloons.push(balloon);
            
            const animateBalloon = () => {
                if (this.isCompleted || !balloon.parentNode) return;
                
                floatY -= floatSpeed;
                time += 0.1;
                const wiggleX = startX + Math.sin(time) * 20;
                
                balloon.style.top = floatY + 'px';
                balloon.style.left = wiggleX + 'px';
                
                // Remove if balloon floated away
                if (floatY < -size) {
                    if (balloon.parentNode) {
                        balloon.remove();
                    }
                    const index = balloons.indexOf(balloon);
                    if (index > -1) {
                        balloons.splice(index, 1);
                    }
                    return;
                }
                
                requestAnimationFrame(animateBalloon);
            };
            
            animateBalloon();
        };
        
        // Create balloons at intervals
        this.gameInterval = setInterval(() => {
            if (!this.isCompleted) {
                createBalloon();
            }
        }, 1500);
        
        // Create first balloon immediately
        createBalloon();
    }
    
    // 7. REACTION TEST GAME - Click when the signal appears
    loadReactionGame() {
        this.gameTitle.textContent = '⚡ Reaction Test';
        this.gameInstructions.textContent = 'Click as soon as you see the GREEN signal! Complete 2 quick reactions.';
        this.target = 2;
        this.updateScore();
        
        this.gameCanvas.className = 'game-canvas reaction-game';
        this.gameCanvas.style.cssText = `
            position: relative;
            background: #2c3e50;
            border: 2px solid #34495e;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        this.gameCanvas.innerHTML = '';
        
                 let waitingForReaction = false;
         let reactionStartTime = 0;
         this.currentTimeout = null;
        
        const showInstructions = () => {
            this.gameCanvas.innerHTML = `
                <div style="
                    text-align: center;
                    color: white;
                    font-size: 1.2rem;
                    padding: 20px;
                    line-height: 1.5;
                ">
                    <div style="font-size: 2rem; margin-bottom: 15px;">⏳</div>
                    <div>Wait for the GREEN signal...</div>
                    <div style="font-size: 0.9rem; margin-top: 10px; color: #bdc3c7;">
                        Click as fast as you can when it appears!
                    </div>
                </div>
            `;
        };
        
        const showGreenSignal = () => {
            this.gameCanvas.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
            this.gameCanvas.innerHTML = `
                <div style="
                    text-align: center;
                    color: white;
                    font-size: 2.5rem;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                ">
                    <div style="font-size: 3rem;">🟢</div>
                    <div>CLICK NOW!</div>
                </div>
            `;
            waitingForReaction = true;
            reactionStartTime = Date.now();
        };
        
        const showTooEarly = () => {
            this.gameCanvas.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
            this.gameCanvas.innerHTML = `
                <div style="
                    text-align: center;
                    color: white;
                    font-size: 1.5rem;
                    padding: 20px;
                ">
                    <div style="font-size: 2.5rem; margin-bottom: 15px;">❌</div>
                    <div>Too Early!</div>
                    <div style="font-size: 0.9rem; margin-top: 10px;">
                        Wait for the green signal
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                if (!this.isCompleted) {
                    startNewRound();
                }
            }, 1500);
        };
        
        const showReactionResult = (reactionTime) => {
            this.gameCanvas.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
            this.gameCanvas.innerHTML = `
                <div style="
                    text-align: center;
                    color: white;
                    font-size: 1.3rem;
                    padding: 20px;
                ">
                    <div style="font-size: 2rem; margin-bottom: 15px;">⚡</div>
                    <div>Reaction Time:</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #f1c40f;">
                        ${reactionTime}ms
                    </div>
                    <div style="font-size: 0.9rem; margin-top: 10px;">
                        ${reactionTime < 300 ? 'Lightning Fast! ⚡' : 
                          reactionTime < 500 ? 'Great Reflexes! 👍' : 
                          reactionTime < 700 ? 'Good Job! 😊' : 'Keep Practicing! 💪'}
                    </div>
                </div>
            `;
            
            this.score++;
            this.updateScore();
            
            setTimeout(() => {
                if (this.score >= this.target) {
                    this.completeGame();
                } else if (!this.isCompleted) {
                    startNewRound();
                }
            }, 2000);
        };
        
        const startNewRound = () => {
            if (this.isCompleted) return;
            
            waitingForReaction = false;
            this.gameCanvas.style.background = '#2c3e50';
            showInstructions();
            
            // Random delay between 1-4 seconds
            const delay = Math.random() * 3000 + 1000;
            this.currentTimeout = setTimeout(() => {
                if (!this.isCompleted) {
                    showGreenSignal();
                }
            }, delay);
        };
        
        const reactionClickHandler = () => {
            if (this.isCompleted) return;
            
            if (waitingForReaction) {
                // Calculate reaction time
                const reactionTime = Date.now() - reactionStartTime;
                waitingForReaction = false;
                if (this.currentTimeout) {
                    clearTimeout(this.currentTimeout);
                    this.currentTimeout = null;
                }
                showReactionResult(reactionTime);
            } else {
                // Clicked too early
                if (this.currentTimeout) {
                    clearTimeout(this.currentTimeout);
                    this.currentTimeout = null;
                }
                showTooEarly();
            }
        };
        
        this.gameCanvas.addEventListener('click', reactionClickHandler);
        
        // Store handler for cleanup
        this.reactionClickHandler = reactionClickHandler;
        
        // Start first round
        startNewRound();
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