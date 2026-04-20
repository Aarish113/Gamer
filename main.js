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

    // --- SIDEBAR TOGGLE ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.onclick = () => {
            sidebar.classList.toggle('collapsed');
        };
    }

    function toggleSidebar(collapse) {
        if (!sidebar) return;
        if (collapse) sidebar.classList.add('collapsed');
        else sidebar.classList.remove('collapsed');
    }

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

    startBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        const rawName = nameInput.value.trim();
        const nameUpper = rawName.toUpperCase();
        
        let isInvalid = false;
        const nameRegex = /^[A-Z\s]+$/i;
        
        if (!rawName) {
            nameErrorMsg.innerText = "Please enter your name, hero!";
            nameErrorMsg.style.display = 'block';
            isInvalid = true;
        } else if (!nameRegex.test(rawName)) {
            nameErrorMsg.innerText = "Letters and spaces only, please!";
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
                nameErrorMsg.innerText = "This name is reserved for legends!";
                nameErrorMsg.style.display = 'block';
                isInvalid = true;
            }
        }

        if (!isInvalid) {
            console.log("Proceeding to dashboard as:", rawName);
            playerName = rawName;
            
            // Personalize Dashboard
            if (dashboardTitle) dashboardTitle.innerText = `Welcome, ${playerName}!`;
            
            // Hide Overlays
            if (nameErrorMsg) nameErrorMsg.style.display = 'none';
            if (welcomeScreen) welcomeScreen.style.display = 'none';
            
            // Show App
            if (appContainer) {
                appContainer.style.display = 'flex';
                // Force a switch to dashboard view to be safe
                switchView('dashboard');
            }
            
            // Final safety: ensure preloader is hidden
            const preloader = document.getElementById('game-preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.classList.remove('active'), 500);
            }
        } else {
            console.log("Validation failed for name:", rawName);
            nameInput.style.borderColor = '#ef4444';
            setTimeout(() => nameInput.style.borderColor = 'var(--glass-border)', 1000);
        }
    });

    // Also support 'Enter' key
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startBtn.click();
    });

    // Use event delegation for game cards - only for elements within the dashboard grid
    document.addEventListener('click', (e) => {
        const gameCard = e.target.closest('.game-card');
        if (gameCard) {
            const gameId = gameCard.dataset.game;
            if (gameId) {
                console.log('Launching game:', gameId);
                launchGame(gameId);
            }
        }
    });

    backBtn.addEventListener('click', () => {
        console.log('Back to dashboard');
        switchView('dashboard');
    });

    function launchGame(gameId) {
        toggleSidebar(true); // Auto-collapse when game starts
        const preloader = document.getElementById('game-preloader');
        if (!preloader) {
            // Fallback if preloader missing
            performLaunch(gameId);
            return;
        }

        const preloaderText = preloader.querySelector('.preloader-text');
        const spinner = preloader.querySelector('.preloader-spinner');
        
        const gameColors = {
            'tic-tac-toe': '#6366f1',
            'snake': '#10b981',
            'memory': '#f59e0b',
            'mines': '#3b82f6',
            '2048': '#edc22e',
            'tetris': '#00f5ff',
            'ultimate-ttt': '#a855f7',
            'safe-crossing': '#4ecdc4',
            'pools': '#3b82f6',
            'the-flame': '#FF416C'
        };

        const color = gameColors[gameId] || '#6366f1';
        preloader.style.background = `radial-gradient(circle at center, ${color}AA 0%, #0f172a 100%)`;
        preloader.style.backgroundColor = '#0f172a'; // Solid base
        if (spinner) spinner.style.borderLeftColor = color;
        if (preloaderText) {
            preloaderText.style.background = `linear-gradient(to right, #fff, ${color})`;
            preloaderText.style.webkitBackgroundClip = 'text';
            preloaderText.innerText = `Entering ${gameId.replace(/-/g, ' ')}...`;
        }

        preloader.classList.add('active');
        preloader.style.opacity = '1';

        setTimeout(() => {
            performLaunch(gameId);
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.classList.remove('active'), 500);
            }, 600);
        }, 800);
    }

    function performLaunch(gameId) {
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
            case 'pools':
                gameTitle.innerText = 'Pools';
                loadPools();
                break;
            case 'the-flame':
                gameTitle.innerText = 'THE FLAME';
                loadTheFlame();
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
        `,
        'pools': () => `
            <ul>
                <li>First player to reach <strong>40 coins</strong> wins the table!</li>
                <li>If you guess wrongly, the player you bet on gets a small compensation!</li>
            </ul>
        `,
        'the-flame': () => `
            <ul>
                <li>Enter two names to see what destiny has in store for them.</li>
                <li>The algorithm analyzes letter repetitions and reduces them to a core numeric value.</li>
                <li>This value determines the "FLAMES" result:</li>
                <li><strong>F</strong>: Friends | <strong>L</strong>: Lovers | <strong>A</strong>: Affection</li>
                <li><strong>M</strong>: Marriage | <strong>E</strong>: Enemies | <strong>S</strong>: Siblings</li>
                <li>Results are calculated with precision—trust the logic... or don't!</li>
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
                <div class="ttt-info">
                    <div class="player-indicator" id="player-x">Player X</div>
                    <div class="player-indicator" id="player-o">POWER (AI)</div>
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
        let gameMode = 'ai';

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        playerX.classList.add('active');

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
                <div class="memory-disclaimer">THIS MAY SEEM IMPOSSIBLE. BUT IT IS NOT...</div>
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
        // --- SIDEBAR TOGGLE ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.onclick = () => {
            sidebar.classList.toggle('collapsed');
        };
    }

    function toggleSidebar(collapse) {
        if (collapse) sidebar.classList.add('collapsed');
        else sidebar.classList.remove('collapsed');
    }

    // Existing launchGame function update
    const originalLaunchGame = window.launchGame;
    window.launchGame = function(gameId) {
        toggleSidebar(true); // Auto-collapse
        originalLaunchGame(gameId);
    };
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
        gameContainer.innerHTML = '';
        const mobile = isMobileDevice();
        
        gameContainer.innerHTML = `
            <div id="safe-crossing-container">
                <div id="sc-canvas-container"></div>
                <div class="sc-ui-layer">
                    <div class="sc-top-bar">
                        <div class="sc-stat">🏆 <span id="sc-score">0</span></div>
                        <div class="sc-stat">❤️ <span id="sc-lives">❤️❤️❤️</span></div>
                    </div>
                    <div class="sc-controls-hint">
                        ${mobile ? '🕹️ Use D-Pad to move' : '⌨️ WASD/Arrows to move'}
                    </div>
                </div>
                
                <div class="sc-overlay" id="sc-startScreen">
                    <h1>CROSS ROAD</h1>
                    <p>Dodge traffic and cross the road safely!</p>
                    <div class="sc-mission-badge">TARGET: LANE 200</div>
                    <button class="sc-btn" id="sc-startBtn">START MISSION</button>
                </div>

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
                </div>
            </div>
        `;
        currentGameCleanup = initSafeCrossingLogic();
    }

    function initSafeCrossingLogic() {
        const container = document.getElementById('sc-canvas-container');
        const scoreEl = document.getElementById('sc-score');
        const livesEl = document.getElementById('sc-lives');
        const startScreen = document.getElementById('sc-startScreen');
        const startBtn = document.getElementById('sc-startBtn');

        if (!container) return () => {};

        // Three.js Setup
        const scene = new THREE.Scene();
        const aspect = container.clientWidth / container.clientHeight;
        const d = 150;
        const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        
        // Define camera offsets - Refined for mobile (less tilted)
        const camOffsetX = isMobileDevice() ? 150 : 200;
        const camOffsetY = isMobileDevice() ? -150 : -200;
        const camOffsetZ = isMobileDevice() ? 250 : 200;
        
        camera.position.set(camOffsetX, camOffsetY, camOffsetZ);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(-100, -100, 200);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Game Constants
        const GRID_SIZE = 42;
        const TILES_COUNT = 17;
        const WIN_SCORE = 200;
        
        let score = 0;
        let lives = 3;
        let gameOver = false;
        let gameStarted = false;
        let lanes = [];
        let animFrame;

        // Player
        const player = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(15, 15, 20),
            new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
        );
        body.position.z = 10;
        body.castShadow = true;
        player.add(body);
        scene.add(player);

        let currentLane = 0;
        let currentCol = 0;

        function createLane(index) {
            const isGrass = index === 0 || Math.random() > 0.4;
            const lane = new THREE.Mesh(
                new THREE.BoxGeometry(TILES_COUNT * GRID_SIZE, GRID_SIZE, 3),
                new THREE.MeshLambertMaterial({ color: isGrass ? 0xbaf455 : 0x454a59 })
            );
            lane.position.y = index * GRID_SIZE;
            lane.receiveShadow = true;
            scene.add(lane);

            const laneData = { index, type: isGrass ? 'grass' : 'road', vehicles: [] };

            if (!isGrass) {
                const vehicleCount = Math.floor(Math.random() * 2) + 1;
                const speed = Math.random() * 2 + 1;
                const dir = Math.random() > 0.5 ? 1 : -1;
                const color = [0x6366f1, 0xa855f7, 0xec4899][Math.floor(Math.random()*3)];

                for (let i = 0; i < vehicleCount; i++) {
                    const vehicle = new THREE.Mesh(
                        new THREE.BoxGeometry(60, 30, 15),
                        new THREE.MeshLambertMaterial({ color })
                    );
                    vehicle.position.set((Math.random() * 600 - 300), index * GRID_SIZE, 12);
                    vehicle.castShadow = true;
                    scene.add(vehicle);
                    laneData.vehicles.push({ mesh: vehicle, speed, dir });
                }
            }
            lanes.push(laneData);
        }

        function updateCamera() {
            camera.position.y = currentLane * GRID_SIZE + camOffsetY;
            camera.position.x = currentCol * GRID_SIZE + camOffsetX;
            camera.lookAt(currentCol * GRID_SIZE, currentLane * GRID_SIZE, 0);
        }

        async function move(dir) {
            if (!gameStarted || gameOver) return;
            switch(dir) {
                case 'up': currentLane++; break;
                case 'down': if (currentLane > 0) currentLane--; break;
                case 'left': if (currentCol > -8) currentCol--; break;
                case 'right': if (currentCol < 8) currentCol++; break;
            }
            player.position.set(currentCol * GRID_SIZE, currentLane * GRID_SIZE, 0);
            updateCamera();
            
            if (currentLane > score) {
                score = currentLane;
                scoreEl.innerText = score;
                createLane(lanes.length);

                // Win condition
                if (score >= WIN_SCORE) {
                    win();
                }
            }
        }

        function win() {
            gameOver = true;
            gameStarted = false;
            setTimeout(() => {
                window.showVictoryScreen(`LEGENDARY! You crossed 200 lanes and won the Safe Crossing mission, ${playerName}!`);
            }, 500);
        }

        function checkCollisions() {
            const playerBox = new THREE.Box3().setFromObject(player);
            const activeLane = lanes[currentLane];
            if (activeLane && activeLane.type === 'road') {
                activeLane.vehicles.forEach(v => {
                    const vehicleBox = new THREE.Box3().setFromObject(v.mesh);
                    if (playerBox.intersectsBox(vehicleBox)) {
                        die();
                    }
                });
            }
        }

        function die() {
            gameOver = true;
            gameStarted = false;
            lives--;
            livesEl.innerText = "❤️".repeat(lives);
            if (lives <= 0) {
                setTimeout(() => window.showLossScreen(`Traffic is tough, ${playerName}! You reached lane ${score}.`), 500);
            } else {
                setTimeout(() => {
                    currentLane = 0;
                    currentCol = 0;
                    player.position.set(0, 0, 0);
                    updateCamera();
                    gameOver = false;
                    gameStarted = true;
                }, 1000);
            }
        }

        function animate() {
            animFrame = requestAnimationFrame(animate);
            if (!gameStarted || gameOver) {
                renderer.render(scene, camera);
                return;
            }

            lanes.forEach(lane => {
                lane.vehicles.forEach(v => {
                    v.mesh.position.x += v.speed * v.dir;
                    if (v.dir === 1 && v.mesh.position.x > 400) v.mesh.position.x = -400;
                    if (v.dir === -1 && v.mesh.position.x < -400) v.mesh.position.x = 400;
                });
            });

            checkCollisions();
            renderer.render(scene, camera);
        }

        // Initialize
        for (let i = 0; i < 20; i++) createLane(i);
        updateCamera();
        animate();

        startBtn.addEventListener('click', () => {
            startScreen.style.display = 'none';
            gameStarted = true;
        });

        const keyHandler = (e) => {
            if (['ArrowUp', 'w'].includes(e.key)) move('up');
            if (['ArrowDown', 's'].includes(e.key)) move('down');
            if (['ArrowLeft', 'a'].includes(e.key)) move('left');
            if (['ArrowRight', 'd'].includes(e.key)) move('right');
        };
        window.addEventListener('keydown', keyHandler);

        // Mobile Controls
        document.getElementById('sc-btn-up')?.addEventListener('click', () => move('up'));
        document.getElementById('sc-btn-down')?.addEventListener('click', () => move('down'));
        document.getElementById('sc-btn-left')?.addEventListener('click', () => move('left'));
        document.getElementById('sc-btn-right')?.addEventListener('click', () => move('right'));

        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener('keydown', keyHandler);
            renderer.dispose();
            scene.clear();
        };
    }
    // --- POOLS (POLISHED) ---
    function loadPools() {
        gameContainer.innerHTML = `
            <div class="pools-container">
                <div id="pools-setup" class="pools-setup-v2">
                    <h2 class="setup-title">Welcome to the High Stakes Pool</h2>
                    <p>Select your character and enter the private table.</p>
                    <div class="setup-options">
                        <button class="setup-btn btn-action" data-humans="1" style="min-width: 250px;">Enter Private Table</button>
                    </div>
                </div>

                <div id="pools-game" style="display: none; width: 100%;">
                    <div class="pools-game-layout">
                        <!-- Left Side: Chips Selection -->
                        <div id="betting-controls-left" class="betting-side-panel left" style="visibility: hidden;">
                            <div class="betting-section">
                                <span class="section-label">Select Chips</span>
                                <div class="chip-group">
                                    <button class="chip-btn chip-1" data-val="1">1</button>
                                    <button class="chip-btn chip-3" data-val="3">3</button>
                                    <button class="chip-btn chip-5" data-val="5">5</button>
                                    <button class="chip-btn chip-10" data-val="10">10</button>
                                </div>
                                <div class="bet-display-wrap">
                                    Bet: <span id="current-bet-display" style="font-weight: 900; color: #fbbf24; font-size: 1.5rem;">1</span>🪙
                                </div>
                            </div>
                        </div>

                        <div class="table-area">
                            <div class="pools-table">
                                <div class="pools-table-inner" id="pools-table-inner">
                                    <!-- Seat 2 (Top) -->
                                    <div id="p2" class="player-seat seat-2">
                                        <div class="player-info-block">
                                            <div class="avatar-wrap computer" id="avatar-p2">
                                                <div class="player-coins">10</div>
                                            </div>
                                            <div class="player-meta">
                                                <span class="player-name">Computer 2</span>
                                            </div>
                                        </div>
                                        <div class="player-cards-wrap" id="cards-p2"></div>
                                    </div>

                                    <!-- Seat 1 (Left) -->
                                    <div id="p1" class="player-seat seat-1">
                                        <div class="player-info-block">
                                            <div class="avatar-wrap computer" id="avatar-p1">
                                                <div class="player-coins">10</div>
                                            </div>
                                            <div class="player-meta">
                                                <span class="player-name">Computer 1</span>
                                            </div>
                                        </div>
                                        <div class="player-cards-wrap" id="cards-p1"></div>
                                    </div>

                                    <!-- Seat 3 (Right) -->
                                    <div id="p3" class="player-seat seat-3">
                                        <div class="player-info-block">
                                            <div class="avatar-wrap computer" id="avatar-p3">
                                                <div class="player-coins">10</div>
                                            </div>
                                            <div class="player-meta">
                                                <span class="player-name">Computer 3</span>
                                            </div>
                                        </div>
                                        <div class="player-cards-wrap" id="cards-p3"></div>
                                    </div>

                                    <!-- Seat 0 (Bottom) -->
                                    <div id="p0" class="player-seat seat-0">
                                        <div class="player-info-block">
                                            <div class="avatar-wrap human" id="avatar-p0">
                                                <div class="player-coins">10</div>
                                            </div>
                                            <div class="player-meta">
                                                <span class="player-name">${playerName}</span>
                                            </div>
                                        </div>
                                        <div class="player-cards-wrap" id="cards-p0"></div>
                                    </div>

                                    <!-- Center: Pool and Dealer -->
                                    <div class="pool-center">
                                        <div class="center-top-row">
                                            <div class="dealer-wrap">
                                                <div class="dealer-avatar" id="dealer-avatar"></div>
                                            </div>
                                            <div class="host-reveals" id="host-cards"></div>
                                        </div>
                                        
                                        <div class="pool-box">
                                            <div class="pool-label">Main Pool</div>
                                            <div class="pool-value" id="pool-amount">0</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Side Sidebar -->
                        <div id="betting-controls-right" class="betting-side-panel right" style="visibility: hidden;">
                            <!-- Phase 1: Clues -->
                            <div id="clue-box" class="betting-box" style="display: none;">
                                <h3 style="text-align: center; color: #10b981; margin-bottom: 5px; font-size: 1rem;">Reveal Clues</h3>
                                <div class="betting-section">
                                    <button id="btn-open-h1" class="btn-action" style="font-size: 0.8rem; padding: 12px;">Clue 1 — 1🪙</button>
                                    <button id="btn-open-h2" class="btn-action" style="font-size: 0.8rem; padding: 12px;" disabled>Clue 2 — 3🪙</button>
                                    <div id="host-skip-container" style="margin-top: 5px;"></div>
                                </div>
                            </div>

                            <!-- Phase 2: Betting -->
                            <div id="betting-box-combo" class="betting-box" style="display: none;">
                                <h3 id="current-turn-label" style="text-align: center; color: #3b82f6; margin-bottom: 5px; font-size: 1rem;">Your Turn</h3>
                                <div class="betting-section">
                                    <span class="section-label">Predict Combo</span>
                                    <div class="combination-btns">
                                        <button class="combo-btn" data-combo="EE">EE</button>
                                        <button class="combo-btn" data-combo="OE">OE</button>
                                        <button class="combo-btn" data-combo="OO">OO</button>
                                    </div>
                                </div>
                            </div>

                            <div id="betting-box-confirm" class="betting-box" style="display: none; align-items: center;">
                                <button id="btn-place-bet" class="btn-action" style="width: 100%;">Confirm Bet</button>
                                <span id="target-hint" style="font-size: 0.7rem; color: #fbbf24; text-transform: uppercase; margin-top: 5px;">Select target on table</span>
                            </div>

                            <!-- Phase 3: Results -->
                            <div id="results-box" class="betting-box" style="display: none; max-height: 500px; overflow-y: auto;">
                                <h3 style="text-align: center; color: #fbbf24; margin-bottom: 10px; font-size: 1.1rem;">Round Summary</h3>
                                <div id="results-content" style="display: flex; flex-direction: column; gap: 12px;"></div>
                                <button id="btn-next-round" class="btn-action" style="width: 100%; margin-top: 15px;">Next Round</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Hidden reference to betting-controls for initPoolsLogic compatibility -->
                    <div id="betting-controls" style="display: none;"></div>
                    <div id="target-player-btns" style="display: none;"></div>

                    <div id="pools-message" class="ttt-status" style="margin-top: 20px;"></div>
                </div>
            </div>
        `;
        currentGameCleanup = initPoolsLogic();
    }

    function initPoolsLogic() {
        const setupDiv = document.getElementById('pools-setup');
        const gameDiv = document.getElementById('pools-game');
        const messageEl = document.getElementById('pools-message');
        const poolEl = document.getElementById('pool-amount');
        const btnOpenH1 = document.getElementById('btn-open-h1');
        const btnOpenH2 = document.getElementById('btn-open-h2');
        const leftPanel = document.getElementById('betting-controls-left');
        const rightPanel = document.getElementById('betting-controls-right');
        
        // Helper to toggle betting UI visibility
        const toggleBettingUI = (show) => {
            leftPanel.style.visibility = show ? 'visible' : 'hidden';
            rightPanel.style.visibility = show ? 'visible' : 'hidden';
            
            if (show) {
                document.getElementById('betting-box-combo').style.display = 'flex';
                document.getElementById('betting-box-confirm').style.display = 'flex';
                document.getElementById('clue-box').style.display = 'none';
            }
        };

        const turnLabel = document.getElementById('current-turn-label');
        const comboBtns = document.querySelectorAll('.combo-btn');
        const chipBtns = document.querySelectorAll('.chip-btn');
        const betDisplay = document.getElementById('current-bet-display');
        const btnPlaceBet = document.getElementById('btn-place-bet');
        const tableInner = document.querySelector('.pools-table-inner');
        
        // Scale the table up slightly for more breathing space
        const table = document.querySelector('.pools-table');
        if (table) table.style.width = 'min(700px, 95vw)';

        const AVATARS = {
            p0: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            p1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shadow',
            p2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zenith',
            p3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Volt',
            dealer: 'https://api.dicebear.com/7.x/bottts/svg?seed=Oracle'
        };

        const BOT_NAMES = ["Felix", "The Pro", "Neural-X", "Glitch"];

        let numHumans = 1;
        let players = [];
        let deck = [];
        let hostCards = [];
        let pool = 0;
        let currentBettorIndex = 0;
        let cuePhaseIndex = 0;
        let bets = [];
        let roundOver = false;
        let currentSelectedBet = 1;
        let selectedTargetId = null;
        let selectedCombo = null;
        let cheatsEnabled = false;
        let cheatBuffer = "";

        const HUMAN_AVATARS = [
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Xavier',
            'https://api.dicebear.com/7.x/pixel-art/svg?seed=Deckard'
        ];
        let selectedAvatar = HUMAN_AVATARS[0];

        // --- Setup View Rendering ---
        setupDiv.innerHTML = `
            <h2 class="setup-title">Welcome to the High Stakes Pool</h2>
            <p>Select your character to join the private table.</p>
            <div class="avatar-selection-label">Choose Your Avatar</div>
            <div class="avatar-list" id="pools-avatar-list"></div>
            <div class="setup-options">
                <button class="setup-btn btn-action" data-humans="1" style="min-width: 280px; padding: 20px;">Enter Private Table</button>
            </div>
        `;

        const avatarListEl = document.getElementById('pools-avatar-list');
        HUMAN_AVATARS.forEach((url, i) => {
            const av = document.createElement('div');
            av.className = `selectable-avatar ${i === 0 ? 'selected' : ''}`;
            av.style.backgroundImage = `url('${url}')`;
            av.onclick = () => {
                document.querySelectorAll('.selectable-avatar').forEach(x => x.classList.remove('selected'));
                av.classList.add('selected');
                selectedAvatar = url;
            };
            avatarListEl.appendChild(av);
        });

        // Re-bind buttons since we replaced innerHTML
        setupDiv.querySelectorAll('.setup-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                numHumans = 1; // Always 1 human now
                setupDiv.style.display = 'none';
                gameDiv.style.display = 'block';
                startNewGame();
            });
        });

        function startNewGame() {
            players = [
                { id: 0, name: playerName, coins: 10, cards: [], isHuman: true, avatar: selectedAvatar },
                { id: 1, name: numHumans > 1 ? "Human 2" : BOT_NAMES[1], coins: 10, cards: [], isHuman: numHumans > 1, avatar: numHumans > 1 ? HUMAN_AVATARS[1] : AVATARS.p1 },
                { id: 2, name: BOT_NAMES[2], coins: 10, cards: [], isHuman: false, avatar: AVATARS.p2 },
                { id: 3, name: BOT_NAMES[3], coins: 10, cards: [], isHuman: false, avatar: AVATARS.p3 }
            ];
            
            // Set Avatar Images
            players.forEach(p => {
                const av = document.getElementById(`avatar-p${p.id}`);
                if (av) av.style.backgroundImage = `url('${p.avatar}')`;
            });
            document.getElementById('dealer-avatar').style.backgroundImage = `url('${AVATARS.dealer}')`;

            updatePlayerUI();
            startNewRound();
        }

        function startNewRound() {
            roundOver = false;
            deck = Array.from({length: 10}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
            pool = 0;
            bets = [];
            hostCards = [deck.pop(), deck.pop()];
            players.forEach(p => p.cards = [deck.pop(), deck.pop()]);

            updatePoolUI();
            // Clear current cards from UI for animation
            players.forEach(p => {
                const container = document.getElementById(`cards-p${p.id}`);
                if (container) container.innerHTML = '';
            });
            
            renderHostCards(true);
            messageEl.innerText = "Host is dealing cards...";
            
            // Staggered dealing animation
            players.forEach((p, i) => {
                const isHuman = (p.id === 0) || (numHumans > 1 && p.id === 1);
                const cardHtml = isHuman ? p.cards[0] : '?';
                animateCard(p.id, cardHtml, i * 300);
            });

            setTimeout(() => {
                cuePhaseIndex = 0;
                processCluePhase();
            }, players.length * 300 + 800);
        }

        function animateCoin(playerIndex, count = 1) {
            const playerEl = document.getElementById(`p${playerIndex}`);
            const poolElLoc = document.getElementById('pool-amount');
            const dealerEl = document.getElementById('dealer-avatar');
            if (!playerEl || !poolElLoc) return;

            const startRect = playerEl.getBoundingClientRect();
            const endRect = poolElLoc.getBoundingClientRect();
            const containerRect = tableInner.getBoundingClientRect();

            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const coin = document.createElement('div');
                    coin.className = 'coin-particle';
                    const jitterX = (Math.random() - 0.5) * 40;
                    const jitterY = (Math.random() - 0.5) * 40;
                    coin.style.left = `${startRect.left - containerRect.left + startRect.width/2 + jitterX}px`;
                    coin.style.top = `${startRect.top - containerRect.top + startRect.height/2 + jitterY}px`;
                    tableInner.appendChild(coin);
                    coin.offsetHeight;
                    coin.style.left = `${endRect.left - containerRect.left + endRect.width/2 - 12}px`;
                    coin.style.top = `${endRect.top - containerRect.top + endRect.height/2 - 12}px`;
                    
                    setTimeout(() => {
                        coin.classList.add('coin-bounce');
                        if (dealerEl) {
                            dealerEl.classList.remove('pulse');
                            void dealerEl.offsetWidth;
                            dealerEl.classList.add('pulse');
                        }
                        setTimeout(() => coin.remove(), 400);
                    }, 600);
                }, i * 150);
            }
        }

        function renderHostCards(hidden) {
            const container = document.getElementById('host-cards');
            container.innerHTML = hostCards.map((c, i) => `
                <div class="pools-card ${hidden && !cheatsEnabled ? 'hidden' : ''}" id="host-card-${i}">${hidden && !cheatsEnabled ? '?' : c}</div>
            `).join('');
        }

        function animateCard(targetPlayerId, cardHtml, delay) {
            setTimeout(() => {
                const dealerEl = document.getElementById('dealer-avatar');
                const targetEl = document.getElementById(`cards-p${targetPlayerId}`);
                if (!dealerEl || !targetEl) return;

                const startRect = dealerEl.getBoundingClientRect();
                const containerRect = tableInner.getBoundingClientRect();
                
                const card = document.createElement('div');
                card.className = 'pools-card card-deal-anim';
                card.innerHTML = cardHtml;
                card.style.left = `${startRect.left - containerRect.left + startRect.width/2 - 25}px`;
                card.style.top = `${startRect.top - containerRect.top + startRect.height/2 - 37}px`;
                tableInner.appendChild(card);

                // Force reflow
                card.offsetHeight;

                // Move to final position
                const targetRect = targetEl.getBoundingClientRect();
                card.style.left = `${targetRect.left - containerRect.left + 10}px`;
                card.style.top = `${targetRect.top - containerRect.top}px`;

                setTimeout(() => {
                    card.remove();
                    renderPlayerCards();
                }, 600);
            }, delay);
        }

        function renderPlayerCards() {
            players.forEach(p => {
                const container = document.getElementById(`cards-p${p.id}`);
                const isCurrentHuman = (p.id === 0) || (numHumans > 1 && p.id === 1);
                if (container) {
                    const shouldShow = isCurrentHuman || roundOver || cheatsEnabled;
                    container.innerHTML = p.cards.map(c => `
                        <div class="pools-card ${shouldShow ? '' : 'hidden'}">${shouldShow ? c : '?'}</div>
                    `).join('');
                }
            });
        }

        function processCluePhase() {
            players.forEach(p => document.getElementById(`p${p.id}`).classList.remove('active'));
            
            const clue1Open = !document.getElementById('host-card-0').classList.contains('hidden');
            const clue2Open = document.getElementById('host-card-1') && !document.getElementById('host-card-1').classList.contains('hidden');
            
            if (cuePhaseIndex >= players.length || (clue1Open && clue2Open)) {
                startBettingPhase();
                return;
            }

            const currentPlayer = players[cuePhaseIndex];
            document.getElementById(`p${currentPlayer.id}`).classList.add('active');
            
            btnOpenH1.disabled = clue1Open || currentPlayer.coins < 1;
            btnOpenH2.disabled = !clue1Open || clue2Open || currentPlayer.coins < 3;
            
            const clueBox = document.getElementById('clue-box');
            const bettingBoxCombo = document.getElementById('betting-box-combo');
            const bettingBoxConfirm = document.getElementById('betting-box-confirm');

            if (currentPlayer.isHuman) {
                clueBox.style.display = 'flex';
                bettingBoxCombo.style.display = 'none';
                bettingBoxConfirm.style.display = 'none';
                rightPanel.style.visibility = 'visible';
                
                messageEl.innerText = ``;
                if (!document.getElementById('btn-skip-clue')) {
                    const skipBtn = document.createElement('button');
                    skipBtn.id = 'btn-skip-clue';
                    skipBtn.className = 'btn-rules';
                    skipBtn.style.width = '100%';
                    skipBtn.innerText = 'Pass Turn';
                    skipBtn.onclick = () => {
                        cuePhaseIndex++;
                        processCluePhase();
                    };
                if (document.getElementById('btn-skip-clue')) document.getElementById('btn-skip-clue').style.display = 'none';
                btnOpenH1.disabled = true;
                btnOpenH2.disabled = true;
                
                setTimeout(() => {
                    // AI Decision
                    let acted = false;
                    if (!clue1Open && currentPlayer.coins >= 1 && Math.random() < 0.3) {
                        openClue(1, currentPlayer);
                        acted = true;
                    } else if (clue1Open && !clue2Open && currentPlayer.coins >= 3 && Math.random() < 0.15) {
                        openClue(2, currentPlayer);
                        acted = true;
                    }
                    
                    setTimeout(() => {
                        cuePhaseIndex++;
                        processCluePhase();
                    }, acted ? 1000 : 500);
                }, 1000);
            }
        }

        function openClue(num, player) {
            if (num === 1) {
                player.coins -= 1;
                pool += 1;
                animateCoin(player.id, 1);
                const el = document.getElementById('host-card-0');
                el.classList.remove('hidden');
                el.innerText = hostCards[0];
            } else {
                player.coins -= 3;
                pool += 3;
                animateCoin(player.id, 3);
                const el = document.getElementById('host-card-1');
                el.classList.remove('hidden');
                el.innerText = hostCards[1];
            }
            updatePoolUI();
            updatePlayerUI();
        }

        btnOpenH1.addEventListener('click', () => {
            openClue(1, players[cuePhaseIndex]);
            // Don't auto-advance in human turn unless both clues open? 
            // Give them continuous chance until they pass or finish.
            btnOpenH1.disabled = true;
            const canOpen2 = players[cuePhaseIndex].coins >= 3;
            btnOpenH2.disabled = !canOpen2;
        });

        btnOpenH2.addEventListener('click', () => {
            openClue(2, players[cuePhaseIndex]);
            btnOpenH2.disabled = true;
        });

        function startBettingPhase() {
            if (document.getElementById('btn-skip-clue')) document.getElementById('btn-skip-clue').remove();
            document.getElementById('clue-box').style.display = 'none';
            
            toggleBettingUI(true);
            currentBettorIndex = 0;
            processNextBettor();
        }

        function processNextBettor() {
            players.forEach(p => document.getElementById(`p${p.id}`).classList.remove('active'));
            if (currentBettorIndex >= players.length) {
                resolveRound();
                return;
            }

            const bettor = players[currentBettorIndex];
            document.getElementById(`p${bettor.id}`).classList.add('active');

            if (bettor.isHuman) {
                turnLabel.innerText = `${bettor.name}'s Bet`;
                renderBettingUI();
            } else {
                toggleBettingUI(false);
                setTimeout(() => {
                    makeAiBet(bettor);
                    currentBettorIndex++;
                    processNextBettor();
                }, 1500);
            }
        }

        function renderBettingUI() {
            toggleBettingUI(true);
            const bettor = players[currentBettorIndex];
            selectedTargetId = null;
            selectedCombo = null;
            
            // Clear previous selections
            players.forEach(p => {
                const el = document.getElementById(`p${p.id}`);
                el.classList.remove('selectable-target', 'target-selected');
                el.onclick = null;
            });

            // Set up click-to-select targets
            players.filter(p => p.id !== bettor.id).forEach(p => {
                const el = document.getElementById(`p${p.id}`);
                el.classList.add('selectable-target');
                el.onclick = () => {
                    players.forEach(opp => document.getElementById(`p${opp.id}`).classList.remove('target-selected'));
                    el.classList.add('target-selected');
                    selectedTargetId = p.id;
                    document.getElementById('target-hint').innerText = `Target: ${p.name}`;
                };
            });
            
            document.getElementById('target-hint').innerText = "Select target on table";

            chipBtns.forEach(btn => {
                btn.classList.remove('selected');
                btn.onclick = () => {
                    const val = parseInt(btn.dataset.val);
                    if (val <= bettor.coins) {
                        currentSelectedBet = val;
                        betDisplay.innerText = val;
                        chipBtns.forEach(b => b.style.borderColor = 'white');
                        btn.style.borderColor = '#fbbf24';
                    }
                };
            });
            
            comboBtns.forEach(btn => {
                btn.classList.remove('selected');
                btn.onclick = () => {
                    comboBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedCombo = btn.dataset.combo;
                };
            });
        }

        btnPlaceBet.onclick = () => {
            if (!selectedTargetId || !selectedCombo) {
                messageEl.innerText = "Please select a target and combination first!";
                return;
            }
            const bettor = players[currentBettorIndex];
            if (bettor.coins < currentSelectedBet) return;

            bettor.coins -= currentSelectedBet;
            pool += currentSelectedBet;
            bets.push({ bettorId: bettor.id, targetId: parseInt(selectedTargetId), combo: selectedCombo, amount: currentSelectedBet });
            
            animateCoin(bettor.id, currentSelectedBet);
            updatePoolUI();
            updatePlayerUI();
            toggleBettingUI(false);
            
            // Clean up table selection
            players.forEach(p => {
                const el = document.getElementById(`p${p.id}`);
                el.classList.remove('selectable-target', 'target-selected');
                el.onclick = null;
            });

            currentBettorIndex++;
            setTimeout(processNextBettor, 1000);
        };

        function makeAiBet(aiPlayer) {
            if (aiPlayer.coins <= 0) return;
            const targets = players.filter(p => p.id !== aiPlayer.id);
            const target = targets[Math.floor(Math.random() * targets.length)];
            const combos = ['EE', 'OE', 'OO'];
            const combo = combos[Math.floor(Math.random() * combos.length)];
            const amount = Math.min(aiPlayer.coins, Math.random() > 0.5 ? 3 : 1);

            aiPlayer.coins -= amount;
            pool += amount;
            animateCoin(aiPlayer.id, amount);
            bets.push({ bettorId: aiPlayer.id, targetId: target.id, combo, amount });
            updatePoolUI();
            updatePlayerUI();
        }

        function resolveRound() {
            roundOver = true;
            toggleBettingUI(false);
            renderPlayerCards();
            renderHostCards(false);

            const resultsBox = document.getElementById('results-box');
            const resultsContent = document.getElementById('results-content');
            const bettingBoxCombo = document.getElementById('betting-box-combo');
            const bettingBoxConfirm = document.getElementById('betting-box-confirm');
            const clueBox = document.getElementById('clue-box');

            if (clueBox) clueBox.style.display = 'none';
            if (bettingBoxCombo) bettingBoxCombo.style.display = 'none';
            if (bettingBoxConfirm) bettingBoxConfirm.style.display = 'none';
            if (resultsBox) resultsBox.style.display = 'flex';
            rightPanel.style.visibility = 'visible';

            // 1. Calculate Results
            const playerResults = {};
            players.forEach(p => {
                const isC1Even = p.cards[0] % 2 === 0;
                const isC2Even = p.cards[1] % 2 === 0;
                playerResults[p.id] = (isC1Even && isC2Even) ? "EE" : (!isC1Even && !isC2Even) ? "OO" : "OE";
            });

            // 2. Distribute Money
            const winners = [];
            const compensations = [];
            bets.forEach(bet => {
                if (bet.combo === playerResults[bet.targetId]) {
                    winners.push({ bettorId: bet.bettorId, combo: bet.combo, amount: bet.amount });
                } else {
                    compensations.push({ targetId: bet.targetId, amount: Math.max(1, Math.floor(bet.amount * 0.5)) });
                }
            });

            let currentPool = pool;
            compensations.forEach(c => {
                const amount = Math.min(currentPool, c.amount);
                players[c.targetId].coins += amount;
                currentPool -= amount;
            });

            const winningBets = winners.length;
            if (winningBets > 0) {
                const share = Math.floor(currentPool / winningBets);
                winners.forEach(w => players[w.bettorId].coins += share);
                currentPool = currentPool % winningBets;
            }
            pool = currentPool;

            // 3. Generate Summary HTML
            let html = "";
            
            // Cards Summary
            html += `<div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Player Hands</span>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">`;
            players.forEach(p => {
                const comboStr = playerResults[p.id];
                html += `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; align-items: center;">
                            <span style="color: #cbd5e1;">${p.name}</span>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <span style="color: #fbbf24; font-weight: 800; font-family: monospace;">${p.cards[0]} ${p.cards[1]}</span>
                                <span style="font-size: 0.65rem; background: rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px; color: #3b82f6;">${comboStr}</span>
                            </div>
                         </div>`;
            });
            html += `</div></div>`;

            // Bets Summary
            html += `<div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Round Bets</span>
                        <div style="display: flex; flex-direction: column; gap: 8px;">`;
            bets.forEach(bet => {
                const bettor = players[bet.bettorId];
                const target = players[bet.targetId];
                const success = bet.combo === playerResults[bet.targetId];
                const icon = success ? "✅" : "❌";
                html += `<div style="font-size: 0.75rem; color: #e2e8f0; line-height: 1.4;">
                            <span style="color: #94a3b8;">${bettor.name}</span> bet <b>${bet.amount}🪙</b> on <span style="color: #94a3b8;">${target.name}</span> as <b>${bet.combo}</b> ${icon}
                         </div>`;
            });
            if (bets.length === 0) html += `<div style="font-size: 0.75rem; color: #94a3b8; font-style: italic;">No bets placed this round.</div>`;
            html += `</div></div>`;

            resultsContent.innerHTML = html;
            updatePoolUI();
            updatePlayerUI();

            document.getElementById('btn-next-round').onclick = () => {
                const tableWinner = players.find(p => p.coins >= 40);
                if (tableWinner) {
                    if (tableWinner.isHuman) showCelebration(`${tableWinner.name} reached 40 coins and wins the table!`);
                    else window.showLossScreen(`${tableWinner.name} won. Better luck next time.`);
                } else {
                    resultsBox.style.display = 'none';
                    startNewRound();
                }
            };
        }

        function checkWin() {
            const winner = players.find(p => p.coins >= 40);
            if (winner) {
                if (winner.isHuman) showCelebration(`${winner.name} reached 40 coins and wins the table!`);
                else window.showLossScreen(`${winner.name} won. Better luck next time, ${playerName}.`);
            } else {
                const nextContainer = document.createElement('div');
                nextContainer.className = 'next-round-container';
                const btnNext = document.createElement('button');
                btnNext.className = 'btn-action';
                btnNext.innerText = 'Next Round Deal';
                btnNext.onclick = () => {
                    nextContainer.remove();
                    startNewRound();
                };
                nextContainer.appendChild(btnNext);
                messageEl.appendChild(nextContainer);
            }
        }

        function updatePlayerUI() {
            players.forEach(p => {
                const box = document.getElementById(`p${p.id}`);
                if (box) {
                    box.querySelector('.player-name').innerText = p.name;
                    box.querySelector('.player-coins').innerText = p.coins;
                }
            });
            renderPlayerCards();
        }

        function updatePoolUI() {
            poolEl.innerText = pool;
        }

        const handlePoolsCheat = (e) => {
            cheatBuffer += e.key.toUpperCase();
            if (cheatBuffer.length > 5) cheatBuffer = cheatBuffer.slice(-5);
            if (cheatBuffer === "BRIBE") {
                cheatsEnabled = !cheatsEnabled;
                cheatBuffer = "";
                messageEl.innerText = cheatsEnabled ? "Cheats Activated: Bribed the dealer..." : "Cheats Deactivated.";
                if (cheatsEnabled) messageEl.style.color = "#fbbf24";
                else messageEl.style.color = "";
                
                updatePlayerUI();
                renderHostCards(!roundOver);
                console.log("%c Bribe Accepted: All cards revealed. ", "background: #222; color: #fbbf24; font-size: 1.2rem;");
            }
        };
        window.addEventListener('keydown', handlePoolsCheat);

        return () => {
            window.removeEventListener('keydown', handlePoolsCheat);
        };
    }

    // --- THE FLAME ---
    function loadTheFlame() {
        gameContainer.innerHTML = `
            <div class="flame-container">
                <div class="flame-card-ui">
                    <div class="flame-title-area">
                        <h2>THE FLAME</h2>
                    </div>
                    <div class="flame-input-group">
                        <div class="flame-field">
                            <label for="flame-name1">Name 1</label>
                            <input type="text" id="flame-name1" class="flame-input" placeholder="Enter first name..." autocomplete="off">
                        </div>
                        <div class="flame-field">
                            <label for="flame-name2">Name 2</label>
                            <input type="text" id="flame-name2" class="flame-input" placeholder="Enter second name..." autocomplete="off">
                        </div>
                    </div>
                    <button id="btn-calculate-flame" class="btn-flame-calculate">Check Destiny</button>
                </div>

                <div id="flame-loading" class="flame-loading-overlay">
                    <div class="flame-fire-container">
                        <div class="fire-eye"></div>
                    </div>
                    <div class="flame-loading-text">SOLVING FATE...</div>
                </div>

                <div id="flame-result" class="flame-result-screen">
                    <div id="flame-letter" class="flame-result-letter">F</div>
                    <div id="flame-meaning" class="flame-result-meaning">FRIENDS</div>
                    <div id="flame-sub" class="flame-result-sub">Destiny has spoken. These souls are bound by the threads of friendship.</div>
                    <button id="btn-flame-retry" class="btn-secondary">Try Another Pair</button>
                </div>
            </div>
        `;
        currentGameCleanup = initTheFlameLogic();
    }

    function initTheFlameLogic() {
        const name1Input = document.getElementById('flame-name1');
        const name2Input = document.getElementById('flame-name2');
        const calcBtn = document.getElementById('btn-calculate-flame');
        const loading = document.getElementById('flame-loading');
        const resultScreen = document.getElementById('flame-result');
        const cardUi = document.querySelector('.flame-card-ui');
        
        const letterEl = document.getElementById('flame-letter');
        const meaningEl = document.getElementById('flame-meaning');
        const subEl = document.getElementById('flame-sub');
        const retryBtn = document.getElementById('btn-flame-retry');

        const flamesMap = {
            'F': { meaning: 'FRIENDS', sub: 'Destiny has spoken. These souls are bound by the threads of friendship.' },
            'L': { meaning: 'LOVERS', sub: 'The stars align. A profound romance is written in the tapestry of time.' },
            'A': { meaning: 'AFFECTION', sub: 'A deep, unspoken warmth exists between these two. A bond that transcends words.' },
            'M': { meaning: 'MARRIAGE', sub: 'Two paths become one. A lifelong journey of unity and shared dreams awaits.' },
            'E': { meaning: 'ENEMIES', sub: 'A clash of wills. Some souls are destined to challenge and oppose each other.' },
            'S': { meaning: 'SIBLINGS', sub: 'A familial bond, strong and enduring. Like two branches of the same tree.' }
        };

        function calculateflames(n1, n2) {
            // Step 1: Count repetitions
            const combinedNames = (n1 + n2).toUpperCase().replace(/\s/g, '');
            const counts = [];
            for (let i = 0; i < combinedNames.length; i++) {
                const char = combinedNames[i];
                let count = 0;
                for (let j = 0; j < combinedNames.length; j++) {
                    if (combinedNames[j] === char) count++;
                }
                counts.push(count);
            }

            // Step 2: Number reduction (Interleaved Zig-Zag)
            let sequence = counts;
            while (sequence.length > 1) {
                let sums = [];
                let left = 0;
                let right = sequence.length - 1;
                while (left <= right) {
                    if (left === right) {
                        sums.push(sequence[left]);
                    } else {
                        sums.push(sequence[left] + sequence[right]);
                    }
                    left++;
                    right--;
                }

                // Zig-Zag placement: S1 (idx 0), S2 (end), S3 (idx 1), S4 (end-1)...
                let zigZag = new Array(sums.length);
                let zLeft = 0;
                let zRight = sums.length - 1;
                for (let i = 0; i < sums.length; i++) {
                    if (i % 2 === 0) {
                        zigZag[zLeft++] = sums[i];
                    } else {
                        zigZag[zRight--] = sums[i];
                    }
                }
                
                // FIXED: Do NOT split digits here. Use the actual sums to maintain variance.
                sequence = zigZag;

                if (sequence.length === 1) break;
            }

            // If the final number is somehow multi-digit (it will be), 
            // we can reduce it to a single digit for standard elimination variety,
            // or just use it directly. Using it directly is best for variance.
            const finalNum = sequence[0];

            // Step 3: FLAMES Elimination
            let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
            let currIdx = 0;
            while (flames.length > 1) {
                // Std FLAMES elimination formula
                currIdx = (currIdx + finalNum - 1) % flames.length;
                if (currIdx < 0) currIdx += flames.length;
                flames.splice(currIdx, 1);
            }

            return flames[0];
        }

        calcBtn.onclick = () => {
            const val1 = name1Input.value.trim();
            const val2 = name2Input.value.trim();

            if (!val1 || !val2) {
                calcBtn.innerText = "NAME BOTH SOULS!";
                setTimeout(() => calcBtn.innerText = "Check Destiny", 1500);
                return;
            }

            // Hide UI
            cardUi.style.display = 'none';
            loading.classList.add('active');

            // Aesthetic Delay
            setTimeout(() => {
                const resultLetter = calculateflames(val1, val2);
                const info = flamesMap[resultLetter];

                loading.classList.remove('active');
                resultScreen.classList.add('active');

                // Reveal with Shuffle Effect
                let iterations = 0;
                const letters = ['F', 'L', 'A', 'M', 'E', 'S'];
                const shuffleInterval = setInterval(() => {
                    letterEl.innerText = letters[Math.floor(Math.random() * letters.length)];
                    iterations++;
                    
                    if (iterations > 15) {
                        clearInterval(shuffleInterval);
                        letterEl.innerText = resultLetter;
                        meaningEl.innerText = info.meaning;
                        subEl.innerText = info.sub;
                    }
                }, 80);
            }, 3000);
        };

        retryBtn.onclick = () => {
            resultScreen.classList.remove('active');
            cardUi.style.display = 'flex';
            name1Input.value = '';
            name2Input.value = '';
        };

        return () => {};
    }

});
