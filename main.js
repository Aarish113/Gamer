document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links li');
    const gameCards = document.querySelectorAll('.game-card');
    const views = document.querySelectorAll('.view');
    const backBtn = document.getElementById('btn-back');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');

    let currentGameCleanup = null;
    let playerName = "Player"; // Default

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

    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name) {
            playerName = name;
            dashboardTitle.innerText = `Welcome, ${playerName}!`;
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
        'tic-tac-toe': `
            <ul>
                <li>Players take turns placing X or O in a 3x3 grid.</li>
                <li>First player to get three in a row wins.</li>
                <li>Play locally or against the computer (named POWER) using Minimax AI.</li>
            </ul>
        `,
        'snake': `
            <ul>
                <li>Use arrow keys to control the snake.</li>
                <li>Eat red food to grow and earn points.</li>
                <li>Avoid hitting walls or yourself!</li>
            </ul>
        `,
        'memory': `
            <ul>
                <li>Flip two cards to find matches.</li>
                <li>Stage 1: 30s | Stage 2: 15s | Stage 3: 7.5s</li>
                <li>Beat all 3 stages to win the game!</li>
            </ul>
        `,
        'mines': `
            <ul>
                <li>Clear the grid without hitting a mine!</li>
                <li>Numbers show how many mines are adjacent.</li>
                <li>Right-click to flag potential mines.</li>
                <li>Customizable grid size and mine count.</li>
            </ul>
        `,
        '2048': `
            <ul>
                <li>Use Arrow Keys to slide tiles.</li>
                <li>When two tiles with the same number touch, they merge into one!</li>
                <li>Reach the 2048 tile to win!</li>
                <li>Continue playing to reach the highest score possible.</li>
            </ul>
        `,
        'tetris': `
            <ul>
                <li>Stack blocks to clear horizontal lines.</li>
                <li>Use Arrow Keys to move and rotate pieces.</li>
                <li>Spacebar for a Hard Drop.</li>
                <li>Level increases every 10 lines!</li>
            </ul>
        `,
        'ultimate-ttt': `
            <ul>
                <li>A game of Tic-Tac-Toe where each square is a smaller 3x3 board.</li>
                <li>Your move in a small board determines which small board your opponent plays next.</li>
                <li>Win three small boards in a row to win the game!</li>
                <li>High-level strategy meets recursion.</li>
            </ul>
        `
    };

    btnRules.addEventListener('click', () => {
        if (!activeGameId) return;
        rulesTitle.innerText = `${gameTitle.innerText} Rules`;
        rulesContent.innerHTML = GAME_RULES[activeGameId] || "Rules coming soon...";
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
            const bestMove = minimax(gameState, 'O').index;
            makeMove(bestMove);
        }

        function minimax(newBoard, player) {
            const availSpots = newBoard.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []);
            if (checkWin(newBoard, 'X')) return { score: -10 };
            if (checkWin(newBoard, 'O')) return { score: 10 };
            if (availSpots.length === 0) return { score: 0 };

            const moves = [];
            for (let spot of availSpots) {
                const move = { index: spot };
                newBoard[spot] = player;
                move.score = minimax(newBoard, player === 'O' ? 'X' : 'O').score;
                newBoard[spot] = "";
                moves.push(move);
            }

            let bestMove, bestScore = player === 'O' ? -10000 : 10000;
            moves.forEach((m, i) => {
                if ((player === 'O' && m.score > bestScore) || (player === 'X' && m.score < bestScore)) {
                    bestScore = m.score;
                    bestMove = i;
                }
            });
            return moves[bestMove];
        }

        function checkWin(board, p) {
            return winningConditions.some(c => c.every(i => board[i] === p));
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
              status = document.getElementById('memory-status'),
              celebOverlay = document.getElementById('celebration-overlay'),
              closeCelebBtn = document.getElementById('btn-close-celebration');

        const icons = ['🎮', '🕹️', '👾', '🚀', '⭐', '💎', '🌈', '🔥'];
        let cards = [], flipped = [], matches = 0, canFlip = true;
        let timeLeft = 30, stage = 1, timerInterval = null;

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft -= 0.1;
                if (timeLeft <= 0) {
                    timeLeft = 0;
                    clearInterval(timerInterval);
                    gameOver();
                }
                timerEl.innerText = timeLeft.toFixed(1);
            }, 100);
        }

        function gameOver() {
            canFlip = false;
            status.innerText = "Time's Up! Game Over.";
            status.style.color = "#ef4444";
        }

        function winStage() {
            clearInterval(timerInterval);
            if (stage < 3) {
                stage++;
                stageEl.innerText = stage;
                timeLeft = stage === 2 ? 15 : 7.5;
                status.innerText = `Stage ${stage-1} Clear! Get ready...`;
                canFlip = false;
                setTimeout(() => {
                    status.innerText = "";
                    create();
                    startTimer();
                }, 2000);
            } else {
                showCelebration();
            }
        }

        function showCelebration() {
            celebOverlay.classList.add('active');
        }

        closeCelebBtn.onclick = () => {
            celebOverlay.classList.remove('active');
            switchView('dashboard');
        };

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

        return () => { clearInterval(timerInterval); celebOverlay.classList.remove('active'); };
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

            if (revealedCount === rows * cols - mineCount) endGame(true);
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
                if (isGameOver()) {
                    statusEl.innerText = 'Game Over!';
                    statusEl.style.color = '#ef4444';
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

        window.addEventListener('keydown', handleKeys);
        resetBtn.addEventListener('click', init);
        init();

        return () => window.removeEventListener('keydown', handleKeys);
    }

    // --- ULTIMATE TIC-TAC-TOE ---
    function loadUltimateTTT() {
        gameContainer.innerHTML = `
            <div class="ult-ttt-container">
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

        let currentPlayer = 'X';
        let mainBoard = Array(9).fill(""); 
        let smallBoards = Array(9).fill(0).map(() => Array(9).fill("")); 
        let activeBoardIndex = -1; 
        let gameActive = true;

        const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

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
            const move = getBestMove();
            makeActualMove(move.boardIdx, move.cellIdx);
        }

        function getBestMove() {
            const possibleMoves = [];
            const targetBoards = activeBoardIndex === -1 ? 
                mainBoard.reduce((acc, val, i) => val === "" ? acc.concat(i) : acc, []) : 
                [activeBoardIndex];

            for (let bIdx of targetBoards) {
                for (let cIdx = 0; cIdx < 9; cIdx++) {
                    if (smallBoards[bIdx][cIdx] === "") possibleMoves.push({boardIdx: bIdx, cellIdx: cIdx});
                }
            }

            // God Mode AI: Highly strategic evaluation for Ultimate TTT
            // 1. Can win the GAME right now?
            for (let m of possibleMoves) {
                const tempMain = [...mainBoard];
                const tempSub = [...smallBoards[m.boardIdx]];
                tempSub[m.cellIdx] = 'O';
                if (checkWin(tempSub) === 'O') {
                    tempMain[m.boardIdx] = 'O';
                    if (checkWin(tempMain) === 'O') return m;
                }
            }

            // 2. Can win a sub-board?
            for (let m of possibleMoves) {
                const tempSub = [...smallBoards[m.boardIdx]];
                tempSub[m.cellIdx] = 'O';
                if (checkWin(tempSub) === 'O') return m;
            }

            // 3. Must block player from winning a sub-board?
            for (let m of possibleMoves) {
                const tempSub = [...smallBoards[m.boardIdx]];
                tempSub[m.cellIdx] = 'X';
                if (checkWin(tempSub) === 'X') return m;
            }

            // 4. Strategic Evaluation: Prefer moves that don't send player to an open board
            let bestMove = possibleMoves[0];
            let bestScore = -Infinity;

            for (let m of possibleMoves) {
                let score = 0;
                const cellWeights = [3, 2, 3, 2, 4, 2, 3, 2, 3];
                score += cellWeights[m.cellIdx];
                score += cellWeights[m.boardIdx] * 2;

                if (mainBoard[m.cellIdx] !== "") {
                    score -= 50; // Heavily penalize giving the player freedom
                } else {
                    const nextBoard = smallBoards[m.cellIdx];
                    for (let i = 0; i < 9; i++) {
                        if (nextBoard[i] === "") {
                            const temp = [...nextBoard];
                            temp[i] = 'X';
                            if (checkWin(temp) === 'X') score -= 20; 
                        }
                    }
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = m;
                }
            }
            return bestMove;
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
            <div class="tetris-wrapper">
                <div class="tetris-side-panel">
                    <div class="tetris-panel-box">
                        <div class="tetris-label">Score</div>
                        <div class="tetris-value" id="t-score">0</div>
                    </div>
                    <div class="tetris-panel-box">
                        <div class="tetris-label">Lines</div>
                        <div class="tetris-value" id="t-lines">0</div>
                    </div>
                    <div class="tetris-panel-box">
                        <div class="tetris-label">Level</div>
                        <div class="tetris-value" id="t-level">1</div>
                    </div>
                    <div class="tetris-panel-box">
                        <div class="tetris-label">Controls</div>
                        <div class="tetris-controls-hint">
                            <div class="tetris-ctrl-row"><span class="tetris-key">←→</span> Move</div>
                            <div class="tetris-ctrl-row"><span class="tetris-key">↑</span> Rotate</div>
                            <div class="tetris-ctrl-row"><span class="tetris-key">↓</span> Drop</div>
                            <div class="tetris-ctrl-row"><span class="tetris-key">SPC</span> Hard</div>
                        </div>
                    </div>
                </div>

                <div class="tetris-game-container">
                    <div class="tetris-canvas-wrapper" id="t-canvas-wrapper">
                        <canvas id="tetris-canvas" width="240" height="480"></canvas>
                        <div class="tetris-overlay" id="t-overlay">
                            <h2 id="t-overlay-title">TETRIS</h2>
                            <p id="t-overlay-info">Use arrow keys to play</p>
                            <button id="t-start-btn" class="btn-secondary">START GAME</button>
                        </div>
                    </div>
                </div>

                <div class="tetris-side-panel">
                    <div class="tetris-panel-box">
                        <div class="tetris-label">Next</div>
                        <canvas id="tetris-next-canvas" width="80" height="80"></canvas>
                    </div>
                    <div class="tetris-panel-box">
                        <div class="tetris-label">Best</div>
                        <div class="tetris-value" id="t-best">0</div>
                    </div>
                </div>
            </div>
        `;
        currentGameCleanup = initTetrisLogic();
    }

    function initTetrisLogic() {
        const canvas = document.getElementById('tetris-canvas');
        const ctx = canvas.getContext('2d');
        const nextCanvas = document.getElementById('tetris-next-canvas');
        const nctx = nextCanvas.getContext('2d');
        const overlay = document.getElementById('t-overlay');
        const startBtn = document.getElementById('t-start-btn');
        const scoreEl = document.getElementById('t-score');
        const linesEl = document.getElementById('t-lines');
        const levelEl = document.getElementById('t-level');
        const bestEl = document.getElementById('t-best');

        const COLS = 10, ROWS = 20, CELL = 24;
        const COLORS = {
            I: '#00f5ff', O: '#ffbe0b', T: '#cc00ff',
            S: '#06d6a0', Z: '#ff006e', J: '#4361ee', L: '#ff7700'
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

        let board, currentPiece, nextPiece, score, lines, level, best;
        let running = false, lastTime = 0, dropCounter = 0;

        function createBoard() { return Array.from({length: ROWS}, () => Array(COLS).fill(0)); }

        function randomPiece() {
            const types = Object.keys(PIECES);
            const type = types[Math.floor(Math.random() * types.length)];
            return {
                type,
                matrix: PIECES[type].map(r => [...r]),
                x: Math.floor(COLS/2) - Math.floor(PIECES[type][0].length/2),
                y: 0
            };
        }

        function rotate(matrix) {
            const N = matrix.length;
            const res = Array.from({length:N}, () => Array(N).fill(0));
            for(let r=0; r<N; r++) for(let c=0; c<N; c++) res[c][N-1-r] = matrix[r][c];
            return res;
        }

        function collides(p, dx=0, dy=0, mat=null) {
            const m = mat || p.matrix;
            for(let r=0; r<m.length; r++) {
                for(let c=0; c<m[r].length; c++) {
                    if(!m[r][c]) continue;
                    const nx = p.x + c + dx, ny = p.y + r + dy;
                    if(nx < 0 || nx >= COLS || ny >= ROWS) return true;
                    if(ny >= 0 && board[ny][nx]) return true;
                }
            }
            return false;
        }

        function placePiece() {
            currentPiece.matrix.forEach((r, y) => {
                r.forEach((v, x) => {
                    if(v && currentPiece.y + y >= 0) board[currentPiece.y + y][currentPiece.x + x] = currentPiece.type;
                });
            });
            clearLines();
            if(score > best) { best = score; localStorage.setItem('tetris-best', best); bestEl.innerText = best; }
        }

        function clearLines() {
            let count = 0;
            outer: for(let r=ROWS-1; r>=0; r--) {
                for(let c=0; c<COLS; c++) if(!board[r][c]) continue outer;
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(0));
                count++; r++;
            }
            if(count > 0) {
                score += [0, 100, 300, 500, 800][count] * level;
                lines += count;
                level = Math.floor(lines/10) + 1;
                updateUI();
            }
        }

        function updateUI() {
            scoreEl.innerText = score;
            linesEl.innerText = lines;
            levelEl.innerText = level;
        }

        function drawCell(x, y, type, targetCtx = ctx, size = CELL) {
            const px = x * size, py = y * size;
            targetCtx.fillStyle = COLORS[type];
            targetCtx.fillRect(px + 1, py + 1, size - 2, size - 2);
            targetCtx.strokeStyle = 'rgba(255,255,255,0.1)';
            targetCtx.strokeRect(px, py, size, size);
        }

        function draw() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            board.forEach((r, y) => r.forEach((v, x) => { if(v) drawCell(x, y, v); }));
            if(currentPiece) {
                currentPiece.matrix.forEach((r, y) => r.forEach((v, x) => {
                    if(v) drawCell(currentPiece.x + x, currentPiece.y + y, currentPiece.type);
                }));
            }
        }

        function drawNext() {
            nctx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
            const m = nextPiece.matrix;
            const size = 18;
            const ox = (nextCanvas.width - m[0].length * size)/2;
            const oy = (nextCanvas.height - m.length * size)/2;
            m.forEach((r, y) => r.forEach((v, x) => {
                if(v) {
                    nctx.fillStyle = COLORS[nextPiece.type];
                    nctx.fillRect(ox + x*size + 1, oy + y*size + 1, size-2, size-2);
                }
            }));
        }

        function gameLoop(time = 0) {
            if(!running) return;
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            if(dropCounter > (1000 / level)) {
                if(!collides(currentPiece, 0, 1)) {
                    currentPiece.y++;
                } else {
                    placePiece();
                    currentPiece = nextPiece;
                    nextPiece = randomPiece();
                    drawNext();
                    if(collides(currentPiece)) {
                        running = false;
                        overlay.style.display = 'flex';
                        document.getElementById('t-overlay-title').innerText = 'GAME OVER';
                        startBtn.innerText = 'PLAY AGAIN';
                    }
                }
                dropCounter = 0;
            }
            draw();
            requestAnimationFrame(gameLoop);
        }

        const handleKeys = (e) => {
            if(!running) return;
            switch(e.key) {
                case 'ArrowLeft': if(!collides(currentPiece, -1, 0)) currentPiece.x--; break;
                case 'ArrowRight': if(!collides(currentPiece, 1, 0)) currentPiece.x++; break;
                case 'ArrowDown': if(!collides(currentPiece, 0, 1)) currentPiece.y++; break;
                case 'ArrowUp': 
                    const rot = rotate(currentPiece.matrix);
                    if(!collides(currentPiece, 0, 0, rot)) currentPiece.matrix = rot;
                    break;
                case ' ':
                    while(!collides(currentPiece, 0, 1)) currentPiece.y++;
                    placePiece();
                    currentPiece = nextPiece;
                    nextPiece = randomPiece();
                    drawNext();
                    break;
            }
            draw();
        };

        startBtn.addEventListener('click', () => {
            board = createBoard();
            score = 0; lines = 0; level = 1;
            best = parseInt(localStorage.getItem('tetris-best') || '0');
            bestEl.innerText = best;
            nextPiece = randomPiece();
            currentPiece = randomPiece();
            updateUI();
            drawNext();
            overlay.style.display = 'none';
            running = true;
            lastTime = performance.now();
            gameLoop(lastTime);
        });

        window.addEventListener('keydown', handleKeys);
        return () => { running = false; window.removeEventListener('keydown', handleKeys); };
    }
});
