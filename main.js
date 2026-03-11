document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links li');
    const gameCards = document.querySelectorAll('.game-card');
    const views = document.querySelectorAll('.view');
    const backBtn = document.getElementById('btn-back');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');

    let currentGameCleanup = null;

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
                <li>Play locally or against the computer using Minimax AI.</li>
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
                <li>Remember the positions of icons.</li>
                <li>Match all 8 pairs to win the game.</li>
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
                    <button class="mode-btn" data-mode="ai">vs Computer</button>
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
                status.innerText = `Player ${currentPlayer} Wins!`;
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
                if (score > highscore) localStorage.setItem('snake-highscore', score);
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
                    <div class="stat-box">Moves: <span id="memory-moves">0</span></div>
                    <div class="stat-box">Matches: <span id="memory-matches">0</span> / 8</div>
                </div>
                <div class="memory-grid" id="memory-grid"></div>
                <div class="memory-controls"><button id="memory-reset" class="btn-secondary">Reset Game</button></div>
            </div>
        `;
        currentGameCleanup = initMemoryLogic();
    }

    function initMemoryLogic() {
        const grid = document.getElementById('memory-grid'), movesEl = document.getElementById('memory-moves'), matchEl = document.getElementById('memory-matches'), resetBtn = document.getElementById('memory-reset');
        const icons = ['🎮', '🕹️', '👾', '🚀', '⭐', '💎', '🌈', '🔥'];
        let cards = [...icons, ...icons].sort(() => Math.random() - 0.5), flipped = [], matches = 0, moves = 0, canFlip = true;

        function create() {
            grid.innerHTML = '';
            cards.forEach(icon => {
                const el = document.createElement('div'); el.classList.add('memory-card');
                el.innerHTML = `<div class="card-inner"><div class="card-front">?</div><div class="card-back">${icon}</div></div>`;
                el.addEventListener('click', () => {
                    if (!canFlip || flipped.includes(el) || el.classList.contains('matched')) return;
                    el.classList.add('flipped'); flipped.push(el);
                    if (flipped.length === 2) {
                        moves++; movesEl.innerText = moves; canFlip = false;
                        if (flipped[0].querySelector('.card-back').innerText === flipped[1].querySelector('.card-back').innerText) {
                            flipped.forEach(c => c.classList.add('matched')); matches++; matchEl.innerText = matches; flipped = []; canFlip = true;
                            if (matches === 8) setTimeout(() => alert('Win!'), 500);
                        } else {
                            setTimeout(() => { flipped.forEach(c => c.classList.remove('flipped')); flipped = []; canFlip = true; }, 1000);
                        }
                    }
                });
                grid.appendChild(el);
            });
        }
        resetBtn.addEventListener('click', () => { moves = 0; matches = 0; movesEl.innerText = 0; matchEl.innerText = 0; create(); });
        create();
        return () => {};
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
        playerO.innerText = "CPU (O)";

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
                status.innerText = bigWinner === "draw" || bigWinner === "D" ? "Ultimate Draw!" : `Winner: ${bigWinner === 'X' ? 'Player' : 'Computer'}!`;
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

            // Unbeatable AI simulation: prioritize winning sub-board, blocking player, or center control
            // 1. Can win sub-board?
            for (let m of possibleMoves) {
                const temp = [...smallBoards[m.boardIdx]];
                temp[m.cellIdx] = 'O';
                if (checkWin(temp) === 'O') return m;
            }

            // 2. Must block player win?
            for (let m of possibleMoves) {
                const temp = [...smallBoards[m.boardIdx]];
                temp[m.cellIdx] = 'X';
                if (checkWin(temp) === 'X') return m;
            }

            // 3. Prefer center of sub-board and center of big-board
            const centerMoves = possibleMoves.filter(m => m.cellIdx === 4);
            if (centerMoves.length > 0) {
                const centerMajor = centerMoves.find(m => m.boardIdx === 4);
                if (centerMajor) return centerMajor;
                return centerMoves[Math.floor(Math.random() * centerMoves.length)];
            }

            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
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
