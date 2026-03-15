document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links li');
    const gameCards = document.querySelectorAll('.game-card');
    const views = document.querySelectorAll('.view');
    const backBtn = document.getElementById('btn-back');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');

    let currentGameCleanup = null;
    let playerName = "Player"; // Default
    let currentUTTTDifficulty = 'easy'; // Global for UTTT difficulty

    // Device detection utility
    function isMobileDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
    }

    // Global Celebration Helper
    const celebOverlay = document.getElementById('celebration-overlay');
    const celebSubtext = document.getElementById('congrats-subtext');
    const celebCloseBtn = document.getElementById('btn-close-celebration');

    function showCelebration(message) {
        if (celebOverlay && celebSubtext) {
            celebSubtext.innerText = message || `You are the ultimate champion, ${playerName}!`;
            celebOverlay.classList.add('active');
        }
    }

    celebCloseBtn.addEventListener('click', () => {
        celebOverlay.classList.remove('active');
        switchView('dashboard');
    });

    // Global Loss Helper
    const lossOverlay = document.getElementById('loss-overlay');
    const lossCloseBtn = document.getElementById('btn-close-loss');
    const lossSubtext = document.getElementById('loss-subtext');

    window.showLossScreen = function(message) {
        if (lossOverlay) {
            if (lossSubtext) {
                lossSubtext.innerText = message || "Better luck next time, loser.";
            }
            lossOverlay.classList.add('active');
        }
    };

    if (lossCloseBtn) {
        lossCloseBtn.addEventListener('click', () => {
            lossOverlay.classList.remove('active');
            switchView('dashboard');
        });
    }

    // Navigation Logic
    function switchView(viewId) {
        if (currentGameCleanup) {
            currentGameCleanup();
            currentGameCleanup = null;
        }

        views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');

        navLinks.forEach(link => {
            if (link.dataset.view === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const view = link.dataset.view;
            console.log('Sidebar clicked:', view);
            if (view === 'dashboard') {
                switchView('dashboard');
            } else {
                launchGame(view);
            }
        });
    });

    // Name Entry Logic
    const welcomeScreen = document.getElementById('welcome-screen');
    const nameInput = document.getElementById('player-name-input');
    const startBtn = document.getElementById('btn-start-playing');
    const appContainer = document.getElementById('app');
    const dashboardTitle = document.querySelector('#dashboard header h2');
    const nameErrorMsg = document.getElementById('name-error-msg');

    const blacklistWords = [
        // Indian famous
        "mahatma", "gandhi", "narendra", "modi", "virat", "kohli", "sachin", "tendulkar", "shahrukh", "khan", "salman", "amitabh", "bachchan", "ms", "dhoni", "yuvraj", "singh", "abdul", "kalam", "bhagat", "bose", "subhas", "chandra",
        // Footballers & International
        "messi", "lionel", "ronaldo", "cristiano", "neymar", "mbappe", "pele", "maradona", "zidane", "beckham", "ronaldinho", "haaland", "einstein", "newton", "musk", "elon", "jobs", "steve", "gates", "bill", "trump", "donald", "biden", "joe", "obama", "barack"
    ];

    startBtn.addEventListener('click', () => {
        const rawName = nameInput.value.trim();
        const nameUpper = rawName.toUpperCase();
        
        let isInvalid = false;
        const nameRegex = /^[A-Z\s]+$/i;
        
        if (!rawName) {
            isInvalid = true;
            nameErrorMsg.style.display = 'none';
        } else if (!nameRegex.test(rawName)) {
            nameErrorMsg.innerText = "GET THE SHIT OUT!!!";
            nameErrorMsg.style.display = 'block';
            isInvalid = true;
        } else {
            const words = rawName.toLowerCase().split(' ');
            let hasBlacklist = false;
            for (let word of words) {
                if (blacklistWords.includes(word)) {
                    hasBlacklist = true;
                    break;
                }
            }
            if (hasBlacklist) {
                nameErrorMsg.innerText = "GET THE SHIT OUT!!!";
                nameErrorMsg.style.display = 'block';
                isInvalid = true;
            }
        }

        if (!isInvalid) {
            playerName = rawName;
            dashboardTitle.innerText = `Welcome, ${playerName}!`;
            nameErrorMsg.style.display = 'none';
            welcomeScreen.style.display = 'none';
            appContainer.style.display = 'flex';
        } else {
            nameInput.style.borderColor = '#ef4444';
            setTimeout(() => nameInput.style.borderColor = 'var(--glass-border)', 1000);
        }
    });

    // Also support 'Enter' key
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startBtn.click();
    });

    // Use event delegation for game cards and buttons - much more robust
    document.addEventListener('click', (e) => {
        const playBtn = e.target.closest('.btn-play');
        const gameCard = e.target.closest('.game-card');
        
        if (playBtn || gameCard) {
            const gameId = (playBtn ? playBtn.closest('.game-card') : gameCard).dataset.game;
            console.log('Launching game:', gameId);
            launchGame(gameId);
        }
    });

    backBtn.addEventListener('click', () => {
        console.log('Back to dashboard');
        switchView('dashboard');
    });

    function launchGame(gameId) {
        console.log('Initializing view for:', gameId);
        switchView('game-view');
        
        switch(gameId) {
            case 'tic-tac-toe':
                gameTitle.innerText = 'Tic-Tac-Toe';
                loadTicTacToe();
                break;
            case 'snake':
                gameTitle.innerText = 'Neon Snake';
                loadSnake();
                break;
            case 'memory':
                gameTitle.innerText = 'Memory Match';
                loadMemory();
                break;
            case 'mines':
                gameTitle.innerText = 'Mines';
                loadMines();
                break;
            case '2048':
                gameTitle.innerText = '2048';
                load2048();
                break;
            case 'tetris':
                gameTitle.innerText = 'Neon Tetris';
                loadTetris();
                break;
            case 'ultimate-ttt':
                gameTitle.innerText = 'Ultimate Tic-Tac-Toe';
                loadUltimateTTT();
                break;
            case 'safe-crossing':
                gameTitle.innerText = 'Safe Crossing';
                loadSafeCrossing();
                break;
            default:
                console.error('Unknown game ID:', gameId);
        }
        activeGameId = gameId;
    }

    // Rules Logic
    const rulesModal = document.getElementById('rules-modal');
    const rulesTitle = document.getElementById('rules-game-title');
    const rulesContent = document.getElementById('rules-content');
    const closeRules = document.getElementById('close-rules');
    const btnRules = document.getElementById('btn-rules');
    let activeGameId = '';

    const GAME_RULES = {
        'tic-tac-toe': () => `
            <ul>
                <li>Players take turns placing X or O in a 3x3 grid.</li>
                <li>First player to get three in a row wins.</li>
                <li>Play locally or against the computer (named POWER) using Minimax AI.</li>
                ${isMobileDevice() ? '<li>Tap a cell to make your move.</li>' : '<li>Click a cell to make your move.</li>'}
            </ul>
        `,
        'snake': () => `
            <ul>
                <li>Eat red food to grow longer and earn points.</li>
                <li>Avoid hitting walls or yourself!</li>
                ${isMobileDevice()
                    ? '<li>🕹️ <strong>Mobile:</strong> Swipe in the direction you want to go.</li>'
                    : '<li>⌨️ Use <strong>Arrow Keys</strong> to steer the snake.</li>'}
            </ul>
        `,
        'memory': () => `
            <ul>
                <li>Flip two cards to find matching pairs.</li>
                <li>Stage 1: 30s | Stage 2: 15s | Stage 3: 7.5s</li>
                <li>Beat all 3 stages to win the game!</li>
                ${isMobileDevice() ? '<li>Tap any card to flip it.</li>' : '<li>Click any card to flip it.</li>'}
            </ul>
        `,
        'mines': () => `
            <ul>
                <li>Clear the grid without hitting a mine!</li>
                <li>Numbers show how many mines are adjacent.</li>
                ${isMobileDevice()
                    ? '<li>📱 <strong>Mobile:</strong> Tap to reveal. Long-press to flag a mine.</li>'
                    : '<li>Right-click to flag potential mines.</li>'}
                <li>Customizable grid size and mine count.</li>
            </ul>
        `,
        '2048': () => `
            <ul>
                <li>When two tiles with the same number touch, they merge!</li>
                <li>Reach the 2048 tile to win!</li>
                ${isMobileDevice()
                    ? '<li>👆 <strong>Mobile:</strong> Swipe Up / Down / Left / Right to slide tiles.</li>'
                    : '<li>⌨️ Use <strong>Arrow Keys</strong> to slide tiles.</li>'}
                <li>Continue playing to beat your highest score.</li>
            </ul>
        `,
        'tetris': () => `
            <ul>
                <li>Stack blocks to clear horizontal lines and score points.</li>
                <li>Level increases every 10 lines!</li>
                ${isMobileDevice()
                    ? '<li>📱 <strong>Mobile:</strong> Use the on-screen buttons to move, rotate, and drop pieces.</li>'
                    : '<li>⬅️➡️ Arrow Keys to move | ⬆️ Rotate | ⬇️ Soft Drop | Space Hard Drop | P to Pause</li>'}
            </ul>
        `,
        'ultimate-ttt': () => `
            <ul>
                <li>Each large square is a full Tic-Tac-Toe board.</li>
                <li>Your move determines which board your opponent plays in next.</li>
                <li>Win 3 small boards in a row to win the game!</li>
                ${isMobileDevice() ? '<li>Tap a cell to make your move.</li>' : '<li>Click a cell to make your move.</li>'}
            </ul>
        `,
        'safe-crossing': () => `
            <ul>
                <li>Cross the road without getting hit by cars!</li>
                <li>Jump on logs to cross the river — don't fall in!</li>
                <li>Reach the far side to level up and earn bonus points.</li>
                ${isMobileDevice()
                    ? '<li>📱 <strong>Mobile:</strong> Use the D-pad to move. Tap 🔫 to shoot a car and slow it down!</li>'
                    : '<li>⌨️ <strong>Desktop:</strong> WASD or Arrow Keys to move. Click to aim and shoot cars.</li>'}
                <li>You have 3 lives — lose them all and it\'s game over!</li>
            </ul>
        `
    };

    btnRules.addEventListener('click', () => {
        if (!activeGameId) return;
        rulesTitle.innerText = `${gameTitle.innerText} Rules`;
        const rule = GAME_RULES[activeGameId];
        rulesContent.innerHTML = rule ? (typeof rule === 'function' ? rule() : rule) : "Rules coming soon...";
        rulesModal.classList.add('active');
    });

    closeRules.addEventListener('click', () => rulesModal.classList.remove('active'));
    window.addEventListener('click', (e) => { 
        if (e.target === rulesModal) rulesModal.classList.remove('active'); 
    });

    // --- TIC TAC TOE ---
    function loadTicTacToe() {
        gameContainer.innerHTML = `
            <div class="ttt-container">
                <div class="ttt-modes">
                    <button class="mode-btn active" data-mode="pvp">Local PvP</button>
                    <button class="mode-btn" data-mode="ai">vs POWER</button>
                </div>
                <div class="ttt-info">
                    <div class="player-indicator" id="player-x">Player X</div>
                    <div class="player-indicator" id="player-o">Player O</div>
                </div>
                <div class="ttt-board" id="ttt-board">
                    ${Array(9).fill(0).map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
                </div>
                <div class="ttt-controls">
                    <button id="ttt-reset" class="btn-secondary">Reset Game</button>
                </div>
                <div id="ttt-status" class="ttt-status"></div>
            </div>
        `;
        currentGameCleanup = initTicTacToeLogic();
    }

    function initTicTacToeLogic() {
        const cells = document.querySelectorAll('.cell');
        const status = document.getElementById('ttt-status');
        const resetBtn = document.getElementById('ttt-reset');
        const playerX = document.getElementById('player-x');
        const playerO = document.getElementById('player-o');
        const modeBtns = document.querySelectorAll('.mode-btn');

        let currentPlayer = 'X';
        let gameState = ["", "", "", "", "", "", "", "", ""];
        let gameActive = true;
        let gameMode = 'pvp';

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        playerX.classList.add('active');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameMode = btn.dataset.mode;
                resetGame();
            });
        });

        function handleResultValidation() {
            let roundWon = false;
            let winCondition = null;
            for (let condition of winningConditions) {
                let a = gameState[condition[0]], b = gameState[condition[1]], c = gameState[condition[2]];
                if (a && a === b && b === c) {
                    roundWon = true;
                    winCondition = condition;
                    break;
                }
            }
            if (roundWon) {
                status.innerText = currentPlayer === 'X' ? `Congratulations!!! ${playerName}!` : "POWER Wins!";
                gameActive = false;
                winCondition.forEach(i => cells[i].classList.add('winner'));
                if (currentPlayer === 'X') {
                    setTimeout(() => showCelebration(`You defeated POWER in Tic-Tac-Toe!`), 500);
                } else {
                    setTimeout(() => window.showLossScreen(`Even a toddler can beat POWER, ${playerName}. But you couldn't handle 9 squares.`), 500);
                }
                return true;
            }
            if (!gameState.includes("")) {
                status.innerText = "Draw!";
                gameActive = false;
                return true;
            }
            return false;
        }

        function makeMove(index) {
            if (gameState[index] !== "" || !gameActive) return;
            gameState[index] = currentPlayer;
            cells[index].innerText = currentPlayer;
            cells[index].classList.add(currentPlayer.toLowerCase());

            if (!handleResultValidation()) {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                playerX.classList.toggle('active');
                playerO.classList.toggle('active');
                if (gameMode === 'ai' && currentPlayer === 'O') setTimeout(makeAiMove, 500);
            }
        }

        function makeAiMove() {
            if (!gameActive) return;
            // Introduce slight delay for "thinking" and trap evaluation
            setTimeout(() => {
                if (!gameActive) return;
                const bestMove = getMctsMove(gameState, 'O');
                makeMove(bestMove);
            }, 300);
        }

        // Custom MCTS / Heuristic Trap Setting for 3x3
        function getMctsMove(board, player) {
            const availSpots = board.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []);
            if (availSpots.length === 0) return -1;
            
            // 1. Can win now?
            for (let spot of availSpots) {
                const temp = [...board]; temp[spot] = player;
                if (checkWin(temp, player)) return spot;
            }
            // 2. Must block opponent win?
            const opp = player === 'O' ? 'X' : 'O';
            for (let spot of availSpots) {
                const temp = [...board]; temp[spot] = opp;
                if (checkWin(temp, opp)) return spot;
            }
            
            // 3. Trap Setting: Center is king, corners are princes, edges are peasants.
            // If center is free, always take it (best trap enabler).
            if (availSpots.includes(4)) return 4;
            
            // Try to force a double-threat trap (two win conditions simultaneously)
            let bestTrapMove = -1;
            let maxThreats = -1;
            for (let spot of availSpots) {
                const temp = [...board]; temp[spot] = player;
                let threats = 0;
                const remaining = temp.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []);
                for (let rSpot of remaining) {
                    const temp2 = [...temp]; temp2[rSpot] = player;
                    if (checkWin(temp2, player)) threats++;
                }
                if (threats > 1 && threats > maxThreats) {
                    maxThreats = threats;
                    bestTrapMove = spot;
                }
            }
            if (bestTrapMove !== -1) return bestTrapMove;

            // 4. If no immediate trap, Minimax fallback to ensure optimal play
            const bestM = minimaxFallback(board, player, 0, -Infinity, Infinity).index;
            if (bestM !== undefined) return bestM;

            return availSpots[Math.floor(Math.random() * availSpots.length)];
        }

        function checkWin(board, player) {
            for (let condition of winningConditions) {
                if (board[condition[0]] === player && board[condition[1]] === player && board[condition[2]] === player) return true;
            }
            return false;
        }

        function minimaxFallback(newBoard, player, depth, alpha, beta) {
            const availSpots = newBoard.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []);
            if (checkWin(newBoard, 'X')) return { score: -10 + depth };
            if (checkWin(newBoard, 'O')) return { score: 10 - depth };
            if (availSpots.length === 0) return { score: 0 };

            const isMaximizing = player === 'O';
            let bestMove;
            let bestScore = isMaximizing ? -Infinity : Infinity;

            for (let i = 0; i < availSpots.length; i++) {
                const spot = availSpots[i];
                newBoard[spot] = player;
                const score = minimaxFallback(newBoard, player === 'O' ? 'X' : 'O', depth + 1, alpha, beta).score;
                newBoard[spot] = "";

                if (isMaximizing) {
                    if (score > bestScore) { bestScore = score; bestMove = spot; }
                    alpha = Math.max(alpha, score);
                } else {
                    if (score < bestScore) { bestScore = score; bestMove = spot; }
                    beta = Math.min(beta, score);
                }
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return { index: bestMove, score: bestScore };
        }

        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                if (gameMode === 'ai' && currentPlayer === 'O') return;
                makeMove(parseInt(cell.dataset.index));
            });
        });

        function resetGame() {
            currentPlayer = 'X';
            gameState = Array(9).fill("");
            gameActive = true;
            status.innerText = "";
            cells.forEach(c => { c.innerText = ""; c.classList.remove('x', 'o', 'winner'); });
            playerX.classList.add('active');
            playerO.classList.remove('active');
        }
        resetBtn.addEventListener('click', resetGame);
        return () => {};
    }

    // --- SNAKE ---
    function loadSnake() {
        gameContainer.innerHTML = `
            <div class="snake-container">
                <div class="snake-stats">
                    <div class="stat-box">Score: <span id="snake-score">0</span></div>
                    <div class="stat-box">High Score: <span id="snake-highscore">0</span></div>
                </div>
                <canvas id="snake-canvas" width="400" height="400"></canvas>
                <div class="snake-controls"><button id="snake-start" class="btn-secondary">Start Game</button></div>
            </div>
        `;
        currentGameCleanup = initSnakeLogic();
    }

    function initSnakeLogic() {
        const canvas = document.getElementById('snake-canvas'), ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('snake-score'), highEl = document.getElementById('snake-highscore'), startBtn = document.getElementById('snake-start');
        const gridSize = 20, tileCount = canvas.width / gridSize;
        let score = 0, highscore = localStorage.getItem('snake-highscore') || 0, snake = [{x: 10, y: 10}], food = {x: 5, y: 5}, dx = 0, dy = 0, loop = null, paused = true;
        highEl.innerText = highscore;

        function draw() {
            ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Move
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score += 10; scoreEl.innerText = score;
                food = {x: Math.floor(Math.random()*tileCount), y: Math.floor(Math.random()*tileCount)};
            } else snake.pop();
            // Collision
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
                clearInterval(loop); paused = true; startBtn.innerText = 'Play Again';
                if (score > highscore) {
                    highscore = score;
                    localStorage.setItem('snake-highscore', score);
                    highEl.innerText = highscore;
                }
                setTimeout(() => window.showLossScreen(`You literally ate your own tail, ${playerName}. How stupid can you be?`), 500);
                return;
            }
            // Food
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(food.x*gridSize+10, food.y*gridSize+10, 7, 0, Math.PI*2); ctx.fill();
            // Snake
            snake.forEach((p, i) => {
                ctx.fillStyle = `rgba(16, 185, 129, ${1 - i/snake.length*0.5})`;
                ctx.beginPath(); ctx.roundRect(p.x*gridSize+2, p.y*gridSize+2, gridSize-4, gridSize-4, 5); ctx.fill();
            });
        }

        const handleKeys = (e) => {
            if (paused) return;
            const keys = {ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0]};
            if (keys[e.key]) {
                const [nx, ny] = keys[e.key];
                if (nx !== -dx || ny !== -dy) { dx = nx; dy = ny; }
                e.preventDefault();
            }
        };

        // Touch controls for Snake
        let touchStartX = 0;
        let touchStartY = 0;
        canvas.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            e.preventDefault();
        }, {passive: false});

        canvas.addEventListener('touchend', e => {
            if (paused) return;
            let touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            let dxTouch = touchEndX - touchStartX;
            let dyTouch = touchEndY - touchStartY;
            
            if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
                if (dxTouch > 30 && dx !== -1) { dx = 1; dy = 0; } // right
                else if (dxTouch < -30 && dx !== 1) { dx = -1; dy = 0; } // left
            } else {
                if (dyTouch > 30 && dy !== -1) { dx = 0; dy = 1; } // down
                else if (dyTouch < -30 && dy !== 1) { dx = 0; dy = -1; } // up
            }
            e.preventDefault();
        }, {passive: false});

        window.addEventListener('keydown', handleKeys);
        startBtn.addEventListener('click', () => {
            if (paused) { paused = false; startBtn.innerText = 'Restart'; score = 0; scoreEl.innerText = 0; snake = [{x: 10, y: 10}]; dx = 1; dy = 0; loop = setInterval(draw, 100); }
            else { clearInterval(loop); paused = true; startBtn.innerText = 'Start'; }
        });
        return () => { clearInterval(loop); window.removeEventListener('keydown', handleKeys); };
    }

    // --- MEMORY ---
    function loadMemory() {
        gameContainer.innerHTML = `
            <div class="memory-container">
                <div class="memory-stats">
                    <div class="stat-box">Stage: <span id="memory-stage">1</span>/3</div>
                    <div class="stat-box timer-box">Time: <span id="memory-timer">30.0</span>s</div>
                    <div class="stat-box">Matches: <span id="memory-matches">0</span> / 8</div>
                </div>
                <div class="memory-grid" id="memory-grid"></div>
                <div class="memory-controls"><button id="memory-reset" class="btn-secondary">Reset Game</button></div>
                <div id="memory-status" class="ttt-status"></div>
            </div>
        `;
        currentGameCleanup = initMemoryLogic();
    }

    function initMemoryLogic() {
        const grid = document.getElementById('memory-grid'), 
              timerEl = document.getElementById('memory-timer'),
              matchEl = document.getElementById('memory-matches'), 
              stageEl = document.getElementById('memory-stage'),
              resetBtn = document.getElementById('memory-reset'), 
              status = document.getElementById('memory-status');
              // celebration refs moved to global scope

        const icons = ['🎮', '🕹️', '👾', '🚀', '⭐', '💎', '🌈', '🔥'];
        let cards = [], flipped = [], matches = 0, canFlip = true;
        let timeLeft = 30, stage = 1, timerInterval = null, timerPaused = false;
        let cheatCode = "112358", inputBuffer = "";

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (timerPaused) return; // Secret: "112358" to toggle
                timeLeft -= 0.1;
                if (timeLeft <= 0) {
                    timeLeft = 0;
                    clearInterval(timerInterval);
                    gameOver();
                }
                timerEl.innerText = timeLeft.toFixed(1);
            }, 100);
        }

        const handleCheatCode = (e) => {
            inputBuffer += e.key;
            if (inputBuffer.length > cheatCode.length) inputBuffer = inputBuffer.slice(-cheatCode.length);
            if (inputBuffer === cheatCode) {
                timerPaused = !timerPaused;
                inputBuffer = "";
                status.innerText = timerPaused ? "Time Paused..." : "";
                status.style.color = "#f59e0b";
                console.log("%c Cheat Activated: Time manipulation enabled. ", "background: #222; color: #bada55; font-size: 1.2rem;");
            }
        };
        window.addEventListener('keydown', handleCheatCode);

        function gameOver() {
            canFlip = false;
            status.innerText = "Time's Up! Game Over.";
            status.style.color = "#ef4444";
            setTimeout(() => window.showLossScreen(`Goldfish memory, ${playerName}? Couldn't remember two simple pictures.`), 500);
        }

        function winStage() {
            clearInterval(timerInterval);
            if (stage < 3) {
                stage++;
                stageEl.innerText = stage;
                timeLeft = stage === 2 ? 15 : 7.5;
                status.innerText = `Stage ${stage-1} Clear! ${timerPaused ? "(Pause Active)" : "Get ready..."}`;
                canFlip = false;
                setTimeout(() => {
                    status.innerText = timerPaused ? "Time Paused..." : "";
                    create();
                    startTimer();
                }, 2000);
            } else {
                showCelebration(`You mastered all levels of Memory Match!`);
            }
        }



        function create() {
            matches = 0;
            matchEl.innerText = 0;
            cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
            grid.innerHTML = '';
            cards.forEach(icon => {
                const el = document.createElement('div'); el.classList.add('memory-card');
                el.innerHTML = `<div class="card-inner"><div class="card-front">?</div><div class="card-back">${icon}</div></div>`;
                el.addEventListener('click', () => {
                    if (!canFlip || flipped.includes(el) || el.classList.contains('matched')) return;
                    el.classList.add('flipped'); flipped.push(el);
                    if (flipped.length === 2) {
                        canFlip = false;
                        if (flipped[0].querySelector('.card-back').innerText === flipped[1].querySelector('.card-back').innerText) {
                            flipped.forEach(c => c.classList.add('matched')); matches++; matchEl.innerText = matches; flipped = []; canFlip = true;
                            if (matches === 8) winStage();
                        } else {
                            setTimeout(() => { flipped.forEach(c => c.classList.remove('flipped')); flipped = []; canFlip = true; }, 800);
                        }
                    }
                });
                grid.appendChild(el);
            });
            canFlip = true;
        }

        resetBtn.addEventListener('click', () => { 
            stage = 1; stageEl.innerText = 1;
            timeLeft = 30; timerEl.innerText = "30.0";
            status.innerText = ''; 
            clearInterval(timerInterval);
            create(); 
            startTimer();
        });

        create();
        startTimer();

        return () => { 
            clearInterval(timerInterval); 
            window.removeEventListener('keydown', handleCheatCode);
            // celebOverlay.classList.remove('active');  // Removed local ref
        };
    }

    // --- MINES ---
    function loadMines() {
        gameContainer.innerHTML = `
            <div class="mines-container">
                <div class="mines-config">
                    <div class="config-group">
                        <label>Rows</label>
                        <input type="number" id="mines-rows" value="10" min="5" max="20">
                    </div>
                    <div class="config-group">
                        <label>Cols</label>
                        <input type="number" id="mines-cols" value="10" min="5" max="20">
                    </div>
                    <div class="config-group">
                        <label>Mines</label>
                        <input type="number" id="mines-count" value="15" min="1" max="100">
                    </div>
                    <button id="mines-start" class="btn-play" style="width: auto; margin-top: auto; padding: 5px 15px;">New Game</button>
                </div>
                <div class="mines-header">
                    <div class="stat-box">Mines: <span id="mines-left">15</span></div>
                    <div id="mines-status" class="ttt-status"></div>
                </div>
                <div class="mines-grid" id="mines-grid"></div>
            </div>
        `;
        currentGameCleanup = initMinesLogic();
    }

    function initMinesLogic() {
        const gridEl = document.getElementById('mines-grid'),
              statusEl = document.getElementById('mines-status'),
              minesLeftEl = document.getElementById('mines-left'),
              rowsInput = document.getElementById('mines-rows'),
              colsInput = document.getElementById('mines-cols'),
              minesInput = document.getElementById('mines-count'),
              startBtn = document.getElementById('mines-start');

        let rows, cols, mineCount, grid, revealedCount, gameOver, flaggedCells;

        function init() {
            rows = parseInt(rowsInput.value);
            cols = parseInt(colsInput.value);
            mineCount = Math.min(parseInt(minesInput.value), rows * cols - 1);
            grid = []; revealedCount = 0; gameOver = false; flaggedCells = 0;
            statusEl.innerText = '';
            minesLeftEl.innerText = mineCount;

            gridEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
            gridEl.innerHTML = '';

            // Generate grid
            for (let r = 0; r < rows; r++) {
                grid[r] = [];
                for (let c = 0; c < cols; c++) {
                    const cell = {
                        r, c, isMine: false, revealed: false, flagged: false, count: 0,
                        el: document.createElement('div')
                    };
                    cell.el.classList.add('mines-cell');
                    cell.el.addEventListener('click', () => reveal(r, c));
                    cell.el.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        toggleFlag(r, c);
                    });

                    // Mobile long-press for flagging
                    let pressTimer;
                    cell.el.addEventListener('touchstart', (e) => {
                        if (grid[r][c].revealed) return;
                        pressTimer = setTimeout(() => {
                            toggleFlag(r, c);
                            // Vibrate if supported for feedback
                            if (navigator.vibrate) navigator.vibrate(50);
                        }, 500);
                    }, {passive: true});

                    cell.el.addEventListener('touchend', () => {
                        clearTimeout(pressTimer);
                    }, {passive: true});

                    cell.el.addEventListener('touchmove', () => {
                        clearTimeout(pressTimer);
                    }, {passive: true});

                    gridEl.appendChild(cell.el);
                    grid[r][c] = cell;
                }
            }

            // Place mines
            let placed = 0;
            while (placed < mineCount) {
                let r = Math.floor(Math.random() * rows);
                let c = Math.floor(Math.random() * cols);
                if (!grid[r][c].isMine) {
                    grid[r][c].isMine = true;
                    placed++;
                    // Update counts
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (grid[r + dr] && grid[r + dr][c + dc]) {
                                grid[r + dr][c + dc].count++;
                            }
                        }
                    }
                }
            }
        }

        function reveal(r, c) {
            if (gameOver || grid[r][c].revealed || grid[r][c].flagged) return;
            const cell = grid[r][c];
            cell.revealed = true;
            cell.el.classList.add('revealed');
            revealedCount++;

            if (cell.isMine) {
                cell.el.classList.add('mine');
                cell.el.innerText = '💣';
                endGame(false);
                return;
            }

            if (cell.count > 0) {
                cell.el.innerText = cell.count;
                cell.el.setAttribute('data-count', cell.count);
            } else {
                // Flood fill
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (grid[r + dr] && grid[r + dr][c + dc]) reveal(r + dr, c + dc);
                    }
                }
            }

            if (revealedCount === rows * cols - mineCount) {
                endGame(true);
                setTimeout(() => showCelebration(`The minefield is clear! Perfect job, ${playerName}!`), 500);
            }
        }

        function toggleFlag(r, c) {
            if (gameOver || grid[r][c].revealed) return;
            const cell = grid[r][c];
            cell.flagged = !cell.flagged;
            cell.el.classList.toggle('flagged');
            cell.el.innerText = cell.flagged ? '🚩' : '';
            flaggedCells += cell.flagged ? 1 : -1;
            minesLeftEl.innerText = mineCount - flaggedCells;
        }

        function endGame(won) {
            gameOver = true;
            statusEl.innerText = won ? 'WINNER!' : 'BOOM!';
            statusEl.style.color = won ? '#10b981' : '#ef4444';
            
            // Show all mines
            grid.forEach(row => row.forEach(cell => {
                if (cell.isMine) {
                    cell.el.classList.add('revealed');
                    cell.el.innerText = '💣';
                    if (!won) cell.el.classList.add('mine');
                }
            }));
            if (!won) {
                setTimeout(() => window.showLossScreen(`BOOM! You stepped right on it, ${playerName}. Blind as a bat.`), 1000);
            }
        }

        startBtn.addEventListener('click', init);
        init();
        return () => {};
    }

    // --- 2048 ---
    function load2048() {
        gameContainer.innerHTML = `
            <div class="g2048-container">
                <div class="g2048-stats">
                    <div class="stat-box">Score: <span id="2048-score">0</span></div>
                    <div class="stat-box">Best: <span id="2048-best">0</span></div>
                </div>
                <div class="g2048-grid" id="2048-grid">
                    ${Array(16).fill(0).map(() => `<div class="g2048-cell"></div>`).join('')}
                </div>
                <div class="memory-controls">
                    <button id="2048-reset" class="btn-secondary">New Game</button>
                    <div id="2048-status" class="ttt-status"></div>
                </div>
                <div class="sc-controls-hint" style="margin-top:20px;">
                    ${isMobileDevice() ? '👆 Swipe to slide tiles' : '⌨️ Use Arrow Keys to slide'}
                </div>
            </div>
        `;
        currentGameCleanup = init2048Logic();
    }

    function init2048Logic() {
        const gridEl = document.getElementById('2048-grid'),
              scoreEl = document.getElementById('2048-score'),
              bestEl = document.getElementById('2048-best'),
              resetBtn = document.getElementById('2048-reset'),
              statusEl = document.getElementById('2048-status');

        let grid = Array(4).fill(0).map(() => Array(4).fill(0));
        let score = 0;
        let best = parseInt(localStorage.getItem('2048-best')) || 0;
        bestEl.innerText = best;

        function init() {
            grid = Array(4).fill(0).map(() => Array(4).fill(0));
            score = 0; scoreEl.innerText = 0;
            statusEl.innerText = '';
            addTile();
            addTile();
            updateUI();
        }

        function addTile() {
            const empty = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (grid[r][c] === 0) empty.push({ r, c });
                }
            }
            if (empty.length > 0) {
                const { r, c } = empty[Math.floor(Math.random() * empty.length)];
                grid[r][c] = Math.random() < 0.9 ? 2 : 4;
                return { r, c };
            }
            return null;
        }

        function updateUI() {
            const cells = gridEl.querySelectorAll('.g2048-cell');
            grid.flat().forEach((val, i) => {
                const cell = cells[i];
                cell.innerText = val || '';
                cell.className = 'g2048-cell';
                if (val) {
                    cell.classList.add(`tile-${val > 2048 ? 'super' : val}`);
                }
            });
            scoreEl.innerText = score;
            if (score > best) {
                best = score;
                bestEl.innerText = best;
                localStorage.setItem('2048-best', best);
            }
        }

        function slide(row) {
            let filtered = row.filter(x => x !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    score += filtered[i];
                    filtered.splice(i + 1, 1);
                }
            }
            while (filtered.length < 4) filtered.push(0);
            return filtered;
        }

        function rotate(matrix) {
            return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
        }

        function move(dir) {
            let newGrid = [...grid.map(r => [...r])];
            let rotationCount = 0;

            if (dir === 'ArrowRight') rotationCount = 2;
            else if (dir === 'ArrowUp') rotationCount = 3;
            else if (dir === 'ArrowDown') rotationCount = 1;

            for (let i = 0; i < rotationCount; i++) newGrid = rotate(newGrid);
            
            newGrid = newGrid.map(row => slide(row));

            for (let i = 0; i < (4 - rotationCount) % 4; i++) newGrid = rotate(newGrid);

            if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
                grid = newGrid;
                addTile();
                updateUI();
                if (grid.flat().includes(2048)) {
                    setTimeout(() => showCelebration(`You reached the magic 2048 tile!`), 500);
                }
                if (isGameOver()) {
                    statusEl.innerText = 'Game Over!';
                    statusEl.style.color = '#ef4444';
                    setTimeout(() => window.showLossScreen(`Can't even do basic math, ${playerName}? Even a calculator pities you.`), 500);
                }
            }
        }

        function isGameOver() {
            if (grid.flat().includes(0)) return false;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 3; c++) {
                    if (grid[r][c] === grid[r][c+1]) return false;
                    if (grid[c][r] === grid[c+1][r]) return false;
                }
            }
            return true;
        }

        const handleKeys = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                move(e.key);
            }
        };

        // Swipe controls for 2048
        let touchStartX = 0;
        let touchStartY = 0;
        gridEl.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, {passive: true});

        gridEl.addEventListener('touchend', e => {
            let touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            let dxTouch = touchEndX - touchStartX;
            let dyTouch = touchEndY - touchStartY;
            
            let dx = touchEndX - touchStartX;
            let dy = touchEndY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) move(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else {
                if (Math.abs(dy) > 30) move(dy > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        }, {passive: true});

        init();
        return () => window.removeEventListener('keydown', handleKey);
    }

    // --- ULTIMATE TIC-TAC-TOE ---
    function loadUltimateTTT() {
        gameContainer.innerHTML = `
            <div class="ult-ttt-container">
                <div class="ttt-modes">
                    <button class="diff-btn ${currentUTTTDifficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                    <button class="diff-btn ${currentUTTTDifficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                    <button class="diff-btn ${currentUTTTDifficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
                    <button class="diff-btn ${currentUTTTDifficulty === 'impossible' ? 'active' : ''}" data-diff="impossible">Impossible</button>
                </div>
                <div class="ttt-info">
                    <div class="player-indicator" id="player-u-x">Player X</div>
                    <div class="player-indicator" id="player-u-o">Player O</div>
                </div>
                <div class="ult-ttt-board" id="ult-board">
                    ${Array(9).fill(0).map((_, i) => `
                        <div class="small-board" id="small-board-${i}" data-board-index="${i}">
                            ${Array(9).fill(0).map((_, j) => `<div class="ult-cell" data-board="${i}" data-cell="${j}"></div>`).join('')}
                        </div>
                    `).join('')}
                </div>
                <div class="ttt-controls">
                    <button id="ult-reset" class="btn-secondary">Reset Game</button>
                    <div id="ult-status" class="ult-status"></div>
                </div>
            </div>
        `;
        currentGameCleanup = initUltimateTTTLogic();
    }

    function initUltimateTTTLogic() {
        const boards = document.querySelectorAll('.small-board');
        const cells = document.querySelectorAll('.ult-cell');
        const status = document.getElementById('ult-status');
        const resetBtn = document.getElementById('ult-reset');
        const playerX = document.getElementById('player-u-x');
        const playerO = document.getElementById('player-u-o');
        const diffBtns = document.querySelectorAll('.diff-btn');

        let currentPlayer = 'X';
        let mainBoard = Array(9).fill(""); 
        let smallBoards = Array(9).fill(0).map(() => Array(9).fill("")); 
        let activeBoardIndex = -1; 
        let gameActive = true;

        const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentUTTTDifficulty = btn.dataset.diff;
                loadUltimateTTT(); 
            });
        });

        playerX.classList.add('active');
        playerX.innerText = "Player (X)";
        playerO.innerText = "POWER (O)";

        function checkWin(board) {
            for (let line of winLines) {
                const [a, b, c] = line;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
            }
            if (!board.includes("")) return "draw";
            return null;
        }

        function handleMove(boardIdx, cellIdx) {
            if (!gameActive || currentPlayer === 'O') return;
            if (activeBoardIndex !== -1 && boardIdx !== activeBoardIndex) return;
            if (smallBoards[boardIdx][cellIdx] !== "" || mainBoard[boardIdx] !== "") return;

            makeActualMove(boardIdx, cellIdx);
            if (gameActive) setTimeout(makeAiMove, 600);
        }

        function makeActualMove(boardIdx, cellIdx) {
            smallBoards[boardIdx][cellIdx] = currentPlayer;
            const clickedCell = document.querySelector(`.ult-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`);
            clickedCell.innerText = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());

            const subWinner = checkWin(smallBoards[boardIdx]);
            if (subWinner && subWinner !== "draw") {
                mainBoard[boardIdx] = subWinner;
                const boardEl = document.getElementById(`small-board-${boardIdx}`);
                boardEl.classList.add(`won-${subWinner.toLowerCase()}`);
                boardEl.setAttribute('data-winner', subWinner);
            } else if (subWinner === "draw") {
                mainBoard[boardIdx] = "D";
            }

            const bigWinner = checkWin(mainBoard);
            if (bigWinner) {
                gameActive = false;
                if (bigWinner === "draw" || bigWinner === "D") {
                    status.innerText = "Ultimate Draw!";
                } else {
                    status.innerText = bigWinner === 'X' ? `Congratulations!!! ${playerName}!` : "Winner: POWER!";
                    if (bigWinner === 'X') {
                        setTimeout(() => showCelebration(`You outmaneuvered POWER in Ultimate TTT!`), 500);
                    } else {
                        setTimeout(() => window.showLossScreen(`Ultimate failure, ${playerName}. POWER completely destroyed you on all fronts.`), 500);
                    }
                }
                document.querySelectorAll('.small-board').forEach(b => b.classList.remove('active'));
                return;
            }

            activeBoardIndex = mainBoard[cellIdx] === "" ? cellIdx : -1;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            playerX.classList.toggle('active');
            playerO.classList.toggle('active');

            document.querySelectorAll('.small-board').forEach((b, i) => {
                if ((activeBoardIndex === -1 || i === activeBoardIndex) && mainBoard[i] === "") b.classList.add('active');
                else b.classList.remove('active');
            });
        }

        function makeAiMove() {
            if (!gameActive) return;
            status.innerText = "POWER is thinking...";
            
            // Run MCTS in a timeout to allow UI update
            setTimeout(() => {
                if (!gameActive) return;
                
                let iterations = 200;
                if (currentUTTTDifficulty === 'easy') iterations = 25;
                else if (currentUTTTDifficulty === 'medium') iterations = 200;
                else if (currentUTTTDifficulty === 'hard') iterations = 1000;
                else if (currentUTTTDifficulty === 'impossible') iterations = 5000;

                const move = mctsSearch(mainBoard, smallBoards, activeBoardIndex, 'O', 800, iterations);
                status.innerText = "";
                makeActualMove(move.boardIdx, move.cellIdx);
            }, 50);
        }

        class MctsNode {
            constructor(mainB, smallBs, activeB, player, move = null, parent = null) {
                this.mainBoard = [...mainB];
                this.smallBoards = smallBs.map(b => [...b]);
                this.activeBoard = activeB;
                this.playerTurn = player; // Player to move from this node
                this.move = move; // Move that led to this node {boardIdx, cellIdx}
                this.parent = parent;
                this.children = [];
                this.wins = 0;
                this.visits = 0;
                this.untriedMoves = this.getLegalMoves();
            }

            getLegalMoves() {
                const targetBoards = this.activeBoard === -1 ? 
                    this.mainBoard.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []) : 
                    [this.activeBoard];
                
                let moves = [];
                for (let bIdx of targetBoards) {
                    for (let cIdx = 0; cIdx < 9; cIdx++) {
                        if (this.smallBoards[bIdx][cIdx] === "") moves.push({boardIdx: bIdx, cellIdx: cIdx});
                    }
                }
                return moves;
            }

            uctSelectChild() {
                const c = 1.414; // Exploration parameter
                return this.children.reduce((best, node) => {
                    const uct1 = (node.wins / node.visits) + c * Math.sqrt(Math.log(this.visits) / node.visits);
                    const uct2 = (best.wins / best.visits) + c * Math.sqrt(Math.log(this.visits) / best.visits);
                    return uct1 > uct2 ? node : best;
                });
            }

            expand() {
                const move = this.untriedMoves.pop();
                const nextPlayer = this.playerTurn === 'X' ? 'O' : 'X';
                
                let newMain = [...this.mainBoard];
                let newSmall = this.smallBoards.map(b => [...b]);
                
                newSmall[move.boardIdx][move.cellIdx] = this.playerTurn;
                const subWin = checkWin(newSmall[move.boardIdx]);
                if (subWin && subWin !== "draw") newMain[move.boardIdx] = subWin;
                else if (subWin === "draw") newMain[move.boardIdx] = "D";
                
                const nextActive = newMain[move.cellIdx] === "" ? move.cellIdx : -1;
                
                const child = new MctsNode(newMain, newSmall, nextActive, nextPlayer, move, this);
                this.children.push(child);
                return child;
            }

            backpropagate(result) {
                this.visits++;
                this.wins += result;
                if (this.parent) this.parent.backpropagate(result);
            }
        }

        function simulateRandomGame(node) {
            let mBoard = [...node.mainBoard];
            let sBoards = node.smallBoards.map(b => [...b]);
            let active = node.activeBoard;
            let player = node.playerTurn;
            
            let depth = 0;
            const maxDepth = 40; // Limit random rollout depth

            while (true) {
                const bigWinner = checkWin(mBoard);
                if (bigWinner === 'O') return 1;
                if (bigWinner === 'X') return 0;
                if (bigWinner === 'draw' || bigWinner === 'D') return 0.5;
                if (depth >= maxDepth) return heuristicEvaluate(mBoard, sBoards); // Draw/Uncertain

                const targets = active === -1 ? 
                    mBoard.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []) : [active];
                
                let moves = [];
                for (let b of targets) {
                    for (let c = 0; c < 9; c++) {
                        if (sBoards[b][c] === "") moves.push({b, c});
                    }
                }
                
                if (moves.length === 0) return 0.5;

                // Trap heuristic during rollout: Prefer center of active board, or block opponent wins, or take wins.
                let selectedMove = null;
                for (let m of moves) {
                    sBoards[m.b][m.c] = player;
                    if (checkWin(sBoards[m.b]) === player) { selectedMove = m; sBoards[m.b][m.c] = ""; break; }
                    sBoards[m.b][m.c] = "";
                }
                
                if (!selectedMove) {
                    const opp = player === 'X' ? 'O' : 'X';
                    for (let m of moves) {
                        sBoards[m.b][m.c] = opp;
                        if (checkWin(sBoards[m.b]) === opp) { selectedMove = m; sBoards[m.b][m.c] = ""; break; }
                        sBoards[m.b][m.c] = "";
                    }
                }
                // Center preference
                if (!selectedMove && active !== -1 && sBoards[active][4] === "") selectedMove = {b: active, c: 4};
                
                // Fallback random
                if (!selectedMove) selectedMove = moves[Math.floor(Math.random() * moves.length)];

                sBoards[selectedMove.b][selectedMove.c] = player;
                const sWin = checkWin(sBoards[selectedMove.b]);
                if (sWin && sWin !== "draw") mBoard[selectedMove.b] = sWin;
                else if (sWin === "draw") mBoard[selectedMove.b] = "D";
                
                active = mBoard[selectedMove.c] === "" ? selectedMove.c : -1;
                player = player === 'X' ? 'O' : 'X';
                depth++;
            }
        }
        
        function heuristicEvaluate(mBoard, sBoards) {
            // Evaluates board purely on weights when depth limit reached
            let score = 0.5;
            for(let i=0; i<9; i++) {
                if (mBoard[i] === 'O') score += 0.1;
                if (mBoard[i] === 'X') score -= 0.1;
            }
            if (mBoard[4] === 'O') score += 0.15; // Center control
            return Math.max(0, Math.min(1, score));
        }

        function mctsSearch(rootMain, rootSmall, rootActive, player, msAllowed, maxIters) {
            const rootNode = new MctsNode(rootMain, rootSmall, rootActive, player);
            const startTime = performance.now();
            
            // Immediate win/loss check before heavy tree search
            for (let mv of rootNode.getLegalMoves()) {
                const tMain = [...rootMain];
                const tSmall = rootSmall.map(b => [...b]);
                tSmall[mv.boardIdx][mv.cellIdx] = 'O';
                if (checkWin(tSmall[mv.boardIdx]) === 'O') {
                    tMain[mv.boardIdx] = 'O';
                    if (checkWin(tMain) === 'O') return mv; 
                }
            }

            let iterations = 0;
            while (performance.now() - startTime < msAllowed && iterations < maxIters) {
                let node = rootNode;
                
                // Selection
                while (node.untriedMoves.length === 0 && node.children.length > 0) {
                    node = node.uctSelectChild();
                }
                
                // Expansion
                if (node.untriedMoves.length > 0) {
                    node = node.expand();
                }
                
                // Simulation
                const result = simulateRandomGame(node);
                
                // Backpropagation. If player node result was O win, result is 1, so O node visited gets 1. 
                // X node visited gets 0. We invert.
                let currentNode = node;
                let propagateRes = result;
                while (currentNode) {
                    // if it was X's turn at this node, the move that led here was O's.
                    // Meaning node represents state *after* O moved. 
                    const v = (currentNode.playerTurn === 'X') ? result : 1 - result;
                    currentNode.visits++;
                    currentNode.wins += v;
                    currentNode = currentNode.parent;
                }
                iterations++;
            }
            
            console.log(`MCTS: Ran ${iterations} iterations in ${performance.now()-startTime}ms`);

            // Best move is child highly visited
            if (rootNode.children.length === 0) return rootNode.getLegalMoves()[0];
            const bestChild = rootNode.children.reduce((best, child) => child.visits > best.visits ? child : best);
            return bestChild.move;
        }

        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                handleMove(parseInt(cell.dataset.board), parseInt(cell.dataset.cell));
            });
        });

        document.querySelectorAll('.small-board').forEach(b => b.classList.add('active'));
        resetBtn.addEventListener('click', () => loadUltimateTTT());
        return () => {};
    }


    // --- TETRIS ---
    function loadTetris() {
        gameContainer.innerHTML = `
            <div class="wrapper tetris-wrapper-v2">
              <div class="side-panel tetris-side-v2">
                <div class="panel-box">
                  <div class="panel-label">Score</div>
                  <div class="panel-value" id="t2-score-display">0</div>
                </div>
                <div class="panel-box">
                  <div class="panel-label">Lines</div>
                  <div class="panel-value" id="t2-lines-display">0</div>
                </div>
                <div class="panel-box">
                  <div class="panel-label">Level</div>
                  <div class="panel-value" id="t2-level-display">1</div>
                  <div class="level-bar-bg">
                    <div class="level-bar-fill" id="t2-level-bar" style="width:0%"></div>
                  </div>
                </div>
                <div class="panel-box" style="margin-top:8px;">
                  <div class="panel-label">Controls</div>
                  <div class="controls-hint">
                    <div class="ctrl-row"><span class="key">←→</span> Move</div>
                    <div class="ctrl-row"><span class="key">↑</span> Rotate</div>
                    <div class="ctrl-row"><span class="key">↓</span> Soft Drop</div>
                    <div class="ctrl-row"><span class="key">SPC</span> Hard drop</div>
                    <div class="ctrl-row"><span class="key">P</span> Pause</div>
                  </div>
                </div>
              </div>

              <div class="game-container tetris-middle-v2">
                <div class="game-title tetris-title-v2">TETRIS</div>
                <div class="canvas-wrapper" id="t2-canvas-wrapper">
                  <canvas id="t2-game-canvas" width="300" height="600"></canvas>
                  <div class="canvas-corner tl"></div>
                  <div class="canvas-corner tr"></div>
                  <div class="canvas-corner bl"></div>
                  <div class="canvas-corner br"></div>
                  <div class="tetris-overlay" id="t2-overlay">
                    <div class="overlay-title" id="t2-overlay-title">TETRIS</div>
                    <div class="overlay-sub" id="t2-overlay-sub">
                      A classic returns<br><br>
                      ${isMobileDevice() 
                        ? 'Use on-screen buttons to control the game'
                        : '<span>←→</span> Move &nbsp; <span>↑</span> Rotate<br><span>↓</span> Soft drop &nbsp; <span>SPC</span> Hard drop'
                      }
                    </div>
                    <button class="t2-start-btn" id="t2-start-btn">START GAME</button>
                  </div>
                </div>
                
                <!-- On-Screen Controls for Mobile -->
                <div class="mobile-tetris-controls">
                    <button id="btn-t-left" class="t-ctrl-btn">←</button>
                    <button id="btn-t-right" class="t-ctrl-btn">→</button>
                    <button id="btn-t-rotate" class="t-ctrl-btn">⟳</button>
                    <button id="btn-t-drop" class="t-ctrl-btn">↓</button>
                    <button id="btn-t-hard" class="t-ctrl-btn">⏬</button>
                </div>
              </div>

              <div class="side-panel tetris-side-v2">
                <div class="panel-box">
                  <div class="panel-label">Next</div>
                  <canvas id="t2-next-canvas" width="120" height="120"></canvas>
                </div>
                <div class="panel-box" style="margin-top:8px;">
                  <div class="panel-label">Best</div>
                  <div class="panel-value" id="t2-best-display">0</div>
                </div>
                <div class="panel-box">
                  <div class="panel-label">Combo</div>
                  <div class="panel-value" id="t2-combo-display">x0</div>
                </div>
              </div>
            </div>
        `;
        currentGameCleanup = initTetrisLogic();
    }

    function initTetrisLogic() {
        const canvas = document.getElementById('t2-game-canvas');
        if (!canvas) return () => {};
        const ctx = canvas.getContext('2d');
        const nextCanvas = document.getElementById('t2-next-canvas');
        const nctx = nextCanvas.getContext('2d');

        const COLS = 10, ROWS = 20, CELL = 30;
        const COLORS = {
          I: { fill: '#00f5ff', glow: 'rgba(0,245,255,0.6)', dark: '#007a80' },
          O: { fill: '#ffbe0b', glow: 'rgba(255,190,11,0.6)', dark: '#7a5a00' },
          T: { fill: '#cc00ff', glow: 'rgba(204,0,255,0.6)', dark: '#660080' },
          S: { fill: '#06d6a0', glow: 'rgba(6,214,160,0.6)', dark: '#035c44' },
          Z: { fill: '#ff006e', glow: 'rgba(255,0,110,0.6)', dark: '#7a0035' },
          J: { fill: '#4361ee', glow: 'rgba(67,97,238,0.6)', dark: '#1a2870' },
          L: { fill: '#ff7700', glow: 'rgba(255,119,0,0.6)', dark: '#7a3900' },
        };

        const PIECES = {
          I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
          O: [[1,1],[1,1]],
          T: [[0,1,0],[1,1,1],[0,0,0]],
          S: [[0,1,1],[1,1,0],[0,0,0]],
          Z: [[1,1,0],[0,1,1],[0,0,0]],
          J: [[1,0,0],[1,1,1],[0,0,0]],
          L: [[0,0,1],[1,1,1],[0,0,0]],
        };

        const SCORE_TABLE = [0, 100, 300, 500, 800];
        const LEVEL_SPEEDS = [800,700,600,500,400,320,250,190,140,100,80];

        let board, currentPiece, nextPiece, score, lines, level, combo, best;
        let gameRunning, gamePaused, animFrame, dropTimer, lastTime;
        let flashRows = [], flashAlpha = 0;

        function createBoard() {
          return Array.from({length: ROWS}, () => Array(COLS).fill(0));
        }

        function randomPiece() {
          const types = Object.keys(PIECES);
          const type = types[Math.floor(Math.random() * types.length)];
          return {
            type,
            matrix: PIECES[type].map(r => [...r]),
            x: Math.floor(COLS/2) - Math.ceil(PIECES[type][0].length/2),
            y: 0,
          };
        }

        function rotate(matrix) {
          const N = matrix.length;
          const result = Array.from({length: N}, () => Array(N).fill(0));
          for (let r = 0; r < N; r++)
            for (let c = 0; c < N; c++)
              result[c][N-1-r] = matrix[r][c];
          return result;
        }

        function collides(piece, dx=0, dy=0, mat=null) {
          const m = mat || piece.matrix;
          for (let r = 0; r < m.length; r++) {
            for (let c = 0; c < m[r].length; c++) {
              if (!m[r][c]) continue;
              const nx = piece.x + c + dx;
              const ny = piece.y + r + dy;
              if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
              if (ny >= 0 && board[ny][nx]) return true;
            }
          }
          return false;
        }

        function placePiece() {
          const { matrix, x, y, type } = currentPiece;
          for (let r = 0; r < matrix.length; r++)
            for (let c = 0; c < matrix[r].length; c++)
              if (matrix[r][c] && y+r >= 0) board[y+r][x+c] = type;

          const cleared = [];
          for (let r = ROWS-1; r >= 0; r--)
            if (board[r].every(c => c !== 0)) cleared.push(r);

          if (cleared.length > 0) {
            flashRows = cleared;
            flashAlpha = 1;
            combo++;
            const pts = SCORE_TABLE[cleared.length] * level + (combo > 1 ? 50 * combo : 0);
            score += pts;
            lines += cleared.length;
            level = Math.min(10, Math.floor(lines / 10) + 1);
            showPopup(cleared, pts, cleared.length);
            setTimeout(() => {
              cleared.sort((a,b)=>b-a).forEach(r => {
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(0));
              });
              flashRows = [];
              updateUI();
            }, 180);
          } else {
            combo = 0;
            updateUI();
          }

          if (score > best) { best = score; localStorage.setItem('tetris_best', best); }
          document.getElementById('t2-best-display').textContent = best;
        }

        function showPopup(rows, pts, count) {
          const wrapper = document.getElementById('t2-canvas-wrapper');
          if (!wrapper) return;
          const labels = ['', 'SINGLE', 'DOUBLE!', 'TRIPLE!!', 'TETRIS!!!'];
          const popup = document.createElement('div');
          popup.className = 'lines-cleared-popup';
          popup.style.left = '50%';
          popup.style.transform = 'translateX(-50%)';
          const midRow = rows[Math.floor(rows.length/2)];
          popup.style.top = (midRow * CELL + 30) + 'px';
          popup.textContent = `${labels[count]} +${pts}`;
          wrapper.appendChild(popup);
          setTimeout(() => popup.remove(), 1000);
        }

        function ghostY() {
          let dy = 0;
          while (!collides(currentPiece, 0, dy+1)) dy++;
          return dy;
        }

        function hardDrop() {
          const dy = ghostY();
          score += dy * 2;
          currentPiece.y += dy;
          placePiece();
          spawnNext();
        }

        function spawnNext() {
          currentPiece = nextPiece;
          nextPiece = randomPiece();
          drawNext();
          if (collides(currentPiece)) {
            gameOver();
          }
        }

        function gameOver() {
          gameRunning = false;
          cancelAnimationFrame(animFrame);
          document.getElementById('t2-overlay-title').textContent = 'GAME OVER';
          document.getElementById('t2-overlay-sub').innerHTML = `Score: <span>${score}</span><br>Lines: <span>${lines}</span><br>Level: <span>${level}</span>`;
          document.getElementById('t2-start-btn').textContent = 'PLAY AGAIN';
          document.getElementById('t2-overlay').style.display = 'flex';
          setTimeout(() => window.showLossScreen(`You let the blocks crush you, ${playerName}. Utterly spineless.`), 500);
        }

        function startGame() {
          board = createBoard();
          score = 0; lines = 0; level = 1; combo = 0;
          flashRows = [];
          best = parseInt(localStorage.getItem('tetris_best') || '0');
          document.getElementById('t2-best-display').textContent = best;
          nextPiece = randomPiece();
          spawnNext();
          gameRunning = true;
          gamePaused = false;
          document.getElementById('t2-overlay').style.display = 'none';
          lastTime = performance.now();
          dropTimer = 0;
          loop(lastTime);
          updateUI();
        }

        function updateUI() {
          document.getElementById('t2-score-display').textContent = score;
          document.getElementById('t2-lines-display').textContent = lines;
          document.getElementById('t2-level-display').textContent = level;
          document.getElementById('t2-combo-display').textContent = `x${combo}`;
          const pct = ((lines % 10) / 10) * 100;
          document.getElementById('t2-level-bar').style.width = pct + '%';
        }

        function loop(timestamp) {
          if (!gameRunning || gamePaused) return;
          const dt = timestamp - lastTime;
          lastTime = timestamp;
          dropTimer += dt;
          const speed = LEVEL_SPEEDS[Math.min(level-1, LEVEL_SPEEDS.length-1)];
          if (dropTimer >= speed) {
            dropTimer = 0;
            if (!collides(currentPiece, 0, 1)) {
              currentPiece.y++;
            } else {
              placePiece();
              if (gameRunning) spawnNext();
            }
          }
          draw();
          animFrame = requestAnimationFrame(loop);
        }

        function drawCell(context, x, y, type, alpha=1, size=CELL) {
          const c = COLORS[type];
          const px = x * size, py = y * size;
          const pad = size * 0.05;

          context.globalAlpha = alpha;
          context.shadowColor = c.glow;
          context.shadowBlur = 10;
          context.fillStyle = c.fill;
          context.fillRect(px+pad, py+pad, size-pad*2, size-pad*2);
          
          context.shadowBlur = 0;
          const grad = context.createLinearGradient(px, py, px+size*0.5, py+size*0.5);
          grad.addColorStop(0, 'rgba(255,255,255,0.25)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          context.fillStyle = grad;
          context.fillRect(px+pad, py+pad, size-pad*2, size-pad*2);

          context.strokeStyle = 'rgba(255,255,255,0.15)';
          context.lineWidth = 1;
          context.strokeRect(px+pad+1, py+pad+1, size-pad*2-2, size-pad*2-2);

          context.globalAlpha = 1;
        }

        function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 1;
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              ctx.strokeRect(c*CELL, r*CELL, CELL, CELL);
            }
          }

          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (board[r][c]) {
                const isFlash = flashRows.includes(r);
                if (isFlash) {
                  ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
                  ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
                } else {
                  drawCell(ctx, c, r, board[r][c]);
                }
              }
            }
          }

          if (currentPiece) {
            const dy = ghostY();
            ctx.globalAlpha = 0.18;
            ctx.shadowColor = COLORS[currentPiece.type].glow;
            ctx.shadowBlur = 4;
            for (let r = 0; r < currentPiece.matrix.length; r++) {
              for (let c = 0; c < currentPiece.matrix[r].length; c++) {
                if (currentPiece.matrix[r][c]) {
                  ctx.fillStyle = COLORS[currentPiece.type].fill;
                  ctx.fillRect((currentPiece.x+c)*CELL+2, (currentPiece.y+dy+r)*CELL+2, CELL-4, CELL-4);
                }
              }
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            for (let r = 0; r < currentPiece.matrix.length; r++)
              for (let c = 0; c < currentPiece.matrix[r].length; c++)
                if (currentPiece.matrix[r][c])
                  drawCell(ctx, currentPiece.x+c, currentPiece.y+r, currentPiece.type);
          }

          if (flashAlpha > 0) flashAlpha = Math.max(0, flashAlpha - 0.12);
        }

        function drawNext() {
          nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
          if (!nextPiece) return;
          const m = nextPiece.matrix;
          const sz = 24;
          const offX = Math.floor((nextCanvas.width - m[0].length * sz) / 2);
          const offY = Math.floor((nextCanvas.height - m.length * sz) / 2);
          for (let r = 0; r < m.length; r++)
            for (let c = 0; c < m[r].length; c++)
              if (m[r][c]) {
                const px = offX + c * sz, py = offY + r * sz;
                const col = COLORS[nextPiece.type];
                nctx.shadowColor = col.glow;
                nctx.shadowBlur = 8;
                nctx.fillStyle = col.fill;
                nctx.fillRect(px+1, py+1, sz-2, sz-2);
                const g = nctx.createLinearGradient(px,py,px+sz*0.5,py+sz*0.5);
                g.addColorStop(0,'rgba(255,255,255,0.25)');
                g.addColorStop(1,'rgba(255,255,255,0)');
                nctx.fillStyle = g;
                nctx.fillRect(px+1, py+1, sz-2, sz-2);
                nctx.shadowBlur = 0;
              }
        }

        const handleKeys = e => {
          if (!gameRunning) return;
          if (e.key === 'p' || e.key === 'P') {
            gamePaused = !gamePaused;
            if (!gamePaused) { lastTime = performance.now(); loop(lastTime); }
            return;
          }
          if (gamePaused) return;
          switch(e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              if (!collides(currentPiece, -1, 0)) currentPiece.x--;
              break;
            case 'ArrowRight':
              e.preventDefault();
              if (!collides(currentPiece, 1, 0)) currentPiece.x++;
              break;
            case 'ArrowDown':
              e.preventDefault();
              if (!collides(currentPiece, 0, 1)) { currentPiece.y++; score += 1; }
              else { placePiece(); if(gameRunning) spawnNext(); }
              dropTimer = 0;
              break;
            case 'ArrowUp':
              e.preventDefault();
              const rotated = rotate(currentPiece.matrix);
              if (!collides(currentPiece, 0, 0, rotated)) {
                currentPiece.matrix = rotated;
              } else if (!collides(currentPiece, 1, 0, rotated)) {
                currentPiece.matrix = rotated; currentPiece.x++;
              } else if (!collides(currentPiece, -1, 0, rotated)) {
                currentPiece.matrix = rotated; currentPiece.x--;
              }
              break;
            case ' ':
              e.preventDefault();
              hardDrop();
              break;
          }
          draw();
          updateUI();
        };

        document.getElementById('t2-start-btn').addEventListener('click', startGame);
        window.addEventListener('keydown', handleKeys);

        // Mobile Controls
        document.getElementById('btn-t-left').addEventListener('click', () => handleKeys({key: 'ArrowLeft', preventDefault: ()=>{}}));
        document.getElementById('btn-t-right').addEventListener('click', () => handleKeys({key: 'ArrowRight', preventDefault: ()=>{}}));
        document.getElementById('btn-t-rotate').addEventListener('click', () => handleKeys({key: 'ArrowUp', preventDefault: ()=>{}}));
        document.getElementById('btn-t-drop').addEventListener('click', () => handleKeys({key: 'ArrowDown', preventDefault: ()=>{}}));
        document.getElementById('btn-t-hard').addEventListener('click', () => handleKeys({key: ' ', preventDefault: ()=>{}}));

        return () => {
            gameRunning = false;
            cancelAnimationFrame(animFrame);
            window.removeEventListener('keydown', handleKeys);
        };
    }

    // --- SAFE CROSSING ---
    function loadSafeCrossing() {
        const mobile = isMobileDevice();
        gameContainer.innerHTML = `
            <div id="safe-crossing-container">
                <div id="sc-canvas-container"></div>
                <div class="sc-ui-layer">
                    <div class="sc-top-bar">
                        <div class="sc-stat">SCORE: <span id="sc-score">0</span></div>
                        <div class="sc-stat text-center">MODE: <span id="sc-currentDifficulty">MEDIUM</span></div>
                        <div class="sc-stat"><span id="sc-lives">❤️❤️❤️</span></div>
                    </div>
                    <div class="sc-controls-hint">${mobile
                        ? '🕹️ D-Pad to move &nbsp;|&nbsp; Tap 🔫 to shoot'
                        : 'Move: WASD / Arrows &nbsp;|&nbsp; Aim &amp; Shoot: MOUSE'
                    }</div>
                </div>
                
                <div class="sc-overlay" id="sc-startScreen">
                    <h1>3D CROSS ROAD</h1>
                    <p>Dodge cars, cross rivers, and shoot to slow traffic!</p>
                    
                    <div class="sc-difficulty-selection">
                        <button class="sc-diff-btn" data-diff="easy">EASY</button>
                        <button class="sc-diff-btn selected" data-diff="medium">MEDIUM</button>
                        <button class="sc-diff-btn" data-diff="hard">HARD</button>
                    </div>

                    <button class="sc-btn" id="sc-startBtn">START GAME</button>
                </div>

                <!-- Mobile D-Pad + Shoot button -->
                <div id="sc-touch-controls"${mobile ? ' class="visible"' : ''}>
                    <div class="sc-dpad">
                        <div class="sc-dpad-center"></div>
                        <button class="sc-dpad-btn" id="sc-btn-up">▲</button>
                        <div class="sc-dpad-center"></div>
                        <button class="sc-dpad-btn" id="sc-btn-left">◀</button>
                        <div class="sc-dpad-center"></div>
                        <button class="sc-dpad-btn" id="sc-btn-right">▶</button>
                        <div class="sc-dpad-center"></div>
                        <button class="sc-dpad-btn" id="sc-btn-down">▼</button>
                        <div class="sc-dpad-center"></div>
                    </div>
                    <button class="sc-shoot-btn" id="sc-btn-shoot">🔫</button>
                </div>
            </div>
        `;
        currentGameCleanup = initSafeCrossingLogic();
    }

    function initSafeCrossingLogic() {
        const container = document.getElementById('sc-canvas-container');
        const scoreEl = document.getElementById('sc-score');
        const livesEl = document.getElementById('sc-lives');
        const currentDifficultyEl = document.getElementById('sc-currentDifficulty');
        const startScreen = document.getElementById('sc-startScreen');
        const startBtn = document.getElementById('sc-startBtn');
        const diffBtns = document.querySelectorAll('.sc-diff-btn');

        const GRID = 1;
        const COLS = 11;
        const ROWS = 12;
        const WIDTH = 600;
        const HEIGHT = 660;

        let score = 0;
        let lives = 3;
        let highestRow = 0;
        let gameOver = false;
        let gameStarted = false;
        let difficulty = 'medium';
        let speedMultiplier = 1;
        
        let scene, camera, renderer, dirLight;
        let playerGroup;
        let gameGrid = [];
        let entities = [];
        let projectiles = [];
        let animFrame;

        let mouse = new THREE.Vector2();
        let raycaster = new THREE.Raycaster();
        let intersectPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        let targetVector = new THREE.Vector3();

        const MAT = {
            water: new THREE.MeshPhongMaterial({ color: 0x118AB2, transparent: true, opacity: 0.8 }),
            road: new THREE.MeshPhongMaterial({ color: 0x4A4E69 }),
            safe: new THREE.MeshPhongMaterial({ color: 0x7FB069 }),
            log: new THREE.MeshPhongMaterial({ color: 0x8B5A2B }),
            player: new THREE.MeshPhongMaterial({ color: 0xF4A261 }),
            carRed: new THREE.MeshPhongMaterial({ color: 0xEF476F }),
            carYellow: new THREE.MeshPhongMaterial({ color: 0xFFD166 }),
            projectile: new THREE.MeshStandardMaterial({ color: 0xFFFFAA, emissive: 0xFFFF00, emissiveIntensity: 0.5 })
        };

        let player = {
            gridX: Math.floor(COLS/2),
            gridY: ROWS - 1,
            isDead: false,
            cooldown: 0
        };

        function initThree() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87CEEB);
            scene.fog = new THREE.Fog(0x87CEEB, 10, 25);

            camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 100);
            camera.position.set(5, 7, 15);
            camera.lookAt(5, 0, 5);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(WIDTH, HEIGHT);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
            dirLight.position.set(5, 10, 5);
            dirLight.castShadow = true;
            dirLight.shadow.camera.left = -10;
            dirLight.shadow.camera.right = 10;
            dirLight.shadow.camera.top = 10;
            dirLight.shadow.camera.bottom = -10;
            scene.add(dirLight);

            createPlayer();
            generateLevel();
        }

        function createPlayer() {
            playerGroup = new THREE.Group();
            const bodyGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const body = new THREE.Mesh(bodyGeo, MAT.player);
            body.position.y = 0.3;
            body.castShadow = true;
            playerGroup.add(body);
            scene.add(playerGroup);
            updatePlayerPosition();
        }

        function updatePlayerPosition() {
            playerGroup.position.set(player.gridX, 0, player.gridY);
            camera.position.z = player.gridY + 6;
            camera.position.x = player.gridX;
            camera.lookAt(player.gridX, 0, player.gridY - 3);
            dirLight.position.z = player.gridY + 5;
            dirLight.target.position.set(player.gridX, 0, player.gridY);
            dirLight.target.updateMatrixWorld();
        }

        function generateLevel() {
            // Clear old - Fixed iteration bug
            [...scene.children].forEach(c => {
                if (c.userData.isMap || c.userData.isEntity) scene.remove(c);
            });
            entities = [];
            gameGrid = [];

            for (let i = 0; i < ROWS; i++) {
                let type = 'safe';
                if (i !== 0 && i !== ROWS - 1) {
                    const r = Math.random();
                    if (r < 0.45) type = 'road';
                    else if (r < 0.8) type = 'water';
                }
                gameGrid[i] = type;

                const geo = new THREE.BoxGeometry(COLS, 0.5, 1);
                const mesh = new THREE.Mesh(geo, MAT[type]);
                mesh.position.set(5, -0.25, i);
                mesh.receiveShadow = true;
                mesh.userData.isMap = true;
                scene.add(mesh);

                if (type === 'road' || type === 'water') {
                    const speed = (Math.random() * 2 + 1.5) * speedMultiplier;
                    const dir = Math.random() > 0.5 ? 1 : -1;
                    const count = Math.floor(Math.random() * 2) + 1;
                    
                    for (let j = 0; j < count; j++) {
                        const isCar = type === 'road';
                        const entGeo = new THREE.BoxGeometry(isCar ? 1.5 : 2, 0.6, 0.8);
                        const mat = isCar ? (Math.random() > 0.5 ? MAT.carRed : MAT.carYellow) : MAT.log;
                        const ent = new THREE.Mesh(entGeo, mat);
                        ent.position.set(dir === 1 ? -2 - (j * 4) : 12 + (j * 4), 0.3, i);
                        ent.castShadow = true;
                        ent.userData = { isEntity: true, type: isCar ? 'car' : 'log', speed: speed, dir: dir, row: i, isSlowed: false };
                        scene.add(ent);
                        entities.push(ent);
                    }
                }
            }
        }

        function checkCollisions() {
            if (player.isDead) return;

            let onLog = false;
            let logSpeed = 0;
            let logDir = 0;

            for (let ent of entities) {
                if (ent.userData.row !== player.gridY) continue;
                
                const boundX = ent.userData.type === 'car' ? 0.75 : 1.0;
                if (Math.abs(playerGroup.position.x - ent.position.x) < boundX) {
                    if (ent.userData.type === 'car') {
                        playerDeath("Splat!");
                        return;
                    } else if (ent.userData.type === 'log') {
                        onLog = true;
                        logSpeed = ent.userData.speed;
                        logDir = ent.userData.dir;
                    }
                }
            }

            if (gameGrid[player.gridY] === 'water') {
                if (!onLog) {
                    playerDeath("Splash!");
                } else {
                    playerGroup.position.x += (logSpeed * logDir * 0.016);
                    player.gridX = playerGroup.position.x;
                    if (player.gridX < 0 || player.gridX > COLS - 1) playerDeath("Swept Away!");
                    camera.position.x = player.gridX;
                }
            }
        }

        function playerDeath(reason) {
            player.isDead = true;
            lives--;
            livesEl.innerText = "❤️".repeat(lives);
            playerGroup.scale.set(1, 0.1, 1); // squish
            
            if (lives <= 0) {
                gameOver = true;
                setTimeout(() => window.showLossScreen(`You didn't look both ways, ${playerName}. ${reason}`), 500);
            } else {
                setTimeout(resetPlayer, 1000);
            }
        }

        function resetPlayer() {
            player.isDead = false;
            player.gridX = Math.floor(COLS/2);
            player.gridY = ROWS - 1;
            highestRow = ROWS - 1;
            playerGroup.scale.set(1, 1, 1);
            updatePlayerPosition();
        }

        const handleKeys = (e) => {
            if (!gameStarted || gameOver || player.isDead) return;
            let moved = false;
            let targetX = Math.round(player.gridX); // Snap to grid if leaving log
            
            switch(e.key.toLowerCase()) {
                case 'w': case 'arrowup': 
                    if (player.gridY > 0) { player.gridY--; moved = true; player.gridX = targetX; } break;
                case 's': case 'arrowdown': 
                    if (player.gridY < ROWS - 1) { player.gridY++; moved = true; player.gridX = targetX;} break;
                case 'a': case 'arrowleft': 
                    if (targetX > 0) { player.gridX = targetX - 1; moved = true; } break;
                case 'd': case 'arrowright': 
                    if (targetX < COLS - 1) { player.gridX = targetX + 1; moved = true; } break;
            }

            if (moved) {
                playerGroup.position.set(player.gridX, 0, player.gridY);
                updatePlayerPosition();
                
                if (player.gridY < highestRow) {
                    highestRow = player.gridY;
                    score += 10;
                    scoreEl.innerText = score;
                }

                if (player.gridY === 0) {
                    score += 50;
                    scoreEl.innerText = score;
                    speedMultiplier += 0.1;
                    setTimeout(() => {
                        generateLevel();
                        resetPlayer();
                    }, 200);
                }
            }
        };

        const handleClick = (e) => {
            if (!gameStarted || gameOver || player.isDead || player.cooldown > 0) return;
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / WIDTH) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / HEIGHT) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(intersectPlane, targetVector);
            
            const dir = targetVector.clone().sub(playerGroup.position).normalize();
            
            const projGeo = new THREE.SphereGeometry(0.2);
            const proj = new THREE.Mesh(projGeo, MAT.projectile);
            proj.position.copy(playerGroup.position);
            proj.position.y = 0.5;
            scene.add(proj);
            projectiles.push({ mesh: proj, dir: dir, life: 60 });
            player.cooldown = 15;
        };

        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                diffBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                difficulty = btn.dataset.diff;
                currentDifficultyEl.innerText = difficulty.toUpperCase();
                speedMultiplier = difficulty === 'easy' ? 0.7 : (difficulty === 'hard' ? 1.5 : 1);
            });
        });

        startBtn.addEventListener('click', () => {
            startScreen.style.display = 'none';
            gameStarted = true;
            generateLevel();
            resetPlayer();
        });

        function animate() {
            animFrame = requestAnimationFrame(animate);
            if (!gameStarted || gameOver) {
                if (renderer && scene && camera) renderer.render(scene, camera);
                return;
            }

            if (player.cooldown > 0) player.cooldown--;

            // Move entities
            entities.forEach(ent => {
                ent.position.x += ent.userData.speed * ent.userData.dir * 0.016;
                if (ent.userData.dir === 1 && ent.position.x > COLS + 2) ent.position.x = -2;
                if (ent.userData.dir === -1 && ent.position.x < -2) ent.position.x = COLS + 2;
            });

            // Move projectiles
            for (let i = projectiles.length - 1; i >= 0; i--) {
                let p = projectiles[i];
                p.mesh.position.addScaledVector(p.dir, 0.4);
                p.life--;

                // Check hit cars to slow them down
                let hit = false;
                for (let ent of entities) {
                    if (ent.userData.type === 'car' && !ent.userData.isSlowed) {
                        if (p.mesh.position.distanceTo(ent.position) < 1.0) {
                            ent.userData.speed *= 0.3;
                            ent.userData.isSlowed = true;
                            ent.material = MAT.safe; // Turn green when slowed
                            hit = true;
                            break;
                        }
                    }
                }

                if (hit || p.life <= 0) {
                    scene.remove(p.mesh);
                    projectiles.splice(i, 1);
                }
            }

            checkCollisions();
            renderer.render(scene, camera);
        }

        initThree();
        animate();

        window.addEventListener('keydown', handleKeys);
        renderer.domElement.addEventListener('mousedown', handleClick);

        // Mobile D-Pad controls
        const btnUp    = document.getElementById('sc-btn-up');
        const btnDown  = document.getElementById('sc-btn-down');
        const btnLeft  = document.getElementById('sc-btn-left');
        const btnRight = document.getElementById('sc-btn-right');
        const btnShoot = document.getElementById('sc-btn-shoot');

        function scMobileMove(key) {
            handleKeys({ key, preventDefault: () => {} });
        }

        function scMobileShoot() {
            if (!gameStarted || gameOver || player.isDead || player.cooldown > 0) return;
            // Shoot forward (in the direction the player is facing: negative Z axis)
            const dir = new THREE.Vector3(0, 0, -1).normalize();
            const projGeo = new THREE.SphereGeometry(0.2);
            const proj = new THREE.Mesh(projGeo, MAT.projectile);
            proj.position.copy(playerGroup.position);
            proj.position.y = 0.5;
            scene.add(proj);
            projectiles.push({ mesh: proj, dir: dir, life: 60 });
            player.cooldown = 15;
        }

        if (btnUp)    btnUp.addEventListener('touchstart',    (e) => { e.preventDefault(); scMobileMove('w'); }, { passive: false });
        if (btnDown)  btnDown.addEventListener('touchstart',  (e) => { e.preventDefault(); scMobileMove('s'); }, { passive: false });
        if (btnLeft)  btnLeft.addEventListener('touchstart',  (e) => { e.preventDefault(); scMobileMove('a'); }, { passive: false });
        if (btnRight) btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); scMobileMove('d'); }, { passive: false });
        if (btnShoot) btnShoot.addEventListener('touchstart', (e) => { e.preventDefault(); scMobileShoot(); }, { passive: false });

        // Also support click for testing on desktop
        if (btnUp)    btnUp.addEventListener('click',    () => scMobileMove('w'));
        if (btnDown)  btnDown.addEventListener('click',  () => scMobileMove('s'));
        if (btnLeft)  btnLeft.addEventListener('click',  () => scMobileMove('a'));
        if (btnRight) btnRight.addEventListener('click', () => scMobileMove('d'));
        if (btnShoot) btnShoot.addEventListener('click', () => scMobileShoot());

        return () => {
            gameStarted = false;
            gameOver = true;
            cancelAnimationFrame(animFrame);
            window.removeEventListener('keydown', handleKeys);
            renderer.domElement.removeEventListener('mousedown', handleClick);
            renderer.dispose();
            scene.clear();
        };
    }

});
