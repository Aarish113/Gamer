function initApp() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const gameCards = document.querySelectorAll('.game-card');
    const views = document.querySelectorAll('.view');
    const backBtn = document.getElementById('btn-back');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');

    let currentGameCleanup = null;
    let playerName = "Player"; // Default
    let currentUTTTDifficulty = 'easy'; 
    let activeGameId = '';
    function setDifficulty(level) {
        currentUTTTDifficulty = level;
    } // Global for UTTT difficulty

    // --- SIDEBAR TOGGLE (DESKTOP) ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.onclick = () => {
            sidebar.classList.toggle('collapsed');
        };
    }

    history.pushState({ page: 'app' }, '', '');

    window.addEventListener('popstate', (e) => {
        const gameView = document.getElementById('game-view');

        if (gameView.classList.contains('active')) {
            switchView('dashboard');
            history.pushState({ page: 'app' }, '', '');
        } else {
            history.back();
        }
    });
    
    function toggleSidebar(collapse) {
        if (!sidebar) return;
        // On mobile, collapsing means closing the drawer
        if (window.innerWidth <= 768) {
            closeMobileNav();
            return;
        }
        if (collapse) sidebar.classList.add('collapsed');
        else sidebar.classList.remove('collapsed');
    }

    // --- MOBILE HAMBURGER NAV ---
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

    function openMobileNav() {
        sidebar.classList.add('mobile-open');
        mobileNavOverlay.classList.add('active');
        if (mobileNavToggle) mobileNavToggle.textContent = '✕';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeMobileNav() {
        sidebar.classList.remove('mobile-open');
        mobileNavOverlay.classList.remove('active');
        if (mobileNavToggle) mobileNavToggle.textContent = '☰';
        document.body.style.overflow = '';
    }

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            if (sidebar.classList.contains('mobile-open')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileNav);
    }

    // Close mobile nav on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileNav();
            document.body.style.overflow = '';
        }
    });

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

    window.showLossScreen = function (message) {
        if (lossOverlay) {
            if (lossSubtext) {
                lossSubtext.innerText = message || "Better luck next time, loser.";
            }
            lossOverlay.classList.add('active');
        }
    };

    window.showVictoryScreen = function (message) {
        const celebOverlay = document.getElementById('celebration-overlay');
        const celebSubtext = document.getElementById('congrats-subtext');
        if (celebOverlay && celebSubtext) {
            celebSubtext.innerText = message;
            celebOverlay.classList.add('active');
        }
    };

    if (lossCloseBtn) {
        lossCloseBtn.addEventListener('click', () => {
            lossOverlay.classList.remove('active');
            switchView('dashboard');
        });
    }

    const retryBtn = document.getElementById('btn-retry-loss');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            lossOverlay.classList.remove('active');
            if (activeGameId) {
                window.launchGame(activeGameId);
            } else {
                switchView('dashboard');
            }
        });
    }

    // Navigation Logic
    function switchView(viewId) {
        if (currentGameCleanup) {
            currentGameCleanup();
            currentGameCleanup = null;
        }

        views.forEach(v => {
            v.classList.remove('active');
            v.style.display = ''; // Clear any inline styles that might interfere
        });
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
            closeMobileNav(); // Always close mobile drawer on nav
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
        // famous
        "mahatma", "gandhi", "musk", "elon", "virat", "kohli", "sachin", "tendulkar", "shahrukh", "amitabh", "ms", "dhoni",
        // Footballers & International
        "messi", "lionel", "ronaldo", "cristiano", "neymar", "mbappe", "pele", "maradona", "zidane", "beckham", "ronaldinho", "haaland", "einstein", "newton", "jobs", "steve", "gates", "bill", "trump", "donald", "biden", "joe", "obama", "barack",
        // F1 Players
        "hamilton", "lewis", "max", "verstappen", "charles", "leclerc", "lando", "norris", "george", "russell", "carlos", "sainz", "oscar", "piastri", "fernando", "alonso", "sebastian", "vettel", "michael", "schumacher", "ayrton", "senna", "sergio", "perez", "pierre", "gasly", "esteban", "ocon", "yuki", "tsunoda", "alex", "albon", "valtteri", "bottas", "zhou", "guanyu", "lance", "stroll", "kevin", "magnussen", "nico", "hulkenberg", "logan", "sargeant"
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
                nameErrorMsg.innerText = "Ah yes… A deeply confident assumption. Unfortunately, confidence is not evidence.Try again.";
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
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && startBtn) startBtn.click();
        });
    }

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

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Back to dashboard');
            switchView('dashboard');
        });
    }

    function launchGame(gameId) {
        toggleSidebar(true);
        const preloader = document.getElementById('game-preloader');
        if (!preloader) {
            performLaunch(gameId);
            return;
        }

        const preloaderText = preloader.querySelector('.preloader-text');
        const statusText = preloader.querySelector('.preloader-status');
        const progressBar = preloader.querySelector('.preloader-progress-bar');
        const backdrop = preloader.querySelector('.preloader-backdrop');

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
            'the-flame': '#FF416C',
            'dino': '#f97316',
            'memory-glitch': '#ff00ff'
        };

        const statusMessages = [
            "Optimizing Game Engine...",
            "Loading High-Resolution Assets...",
            "Calibrating Neural Pathways...",
            "Decrypting Secret Levels...",
            "Syncing with Global Hub...",
            "Checking for Player Skill (None Found)...",
            "Initializing Quantum Logic...",
            "Preparing the Arena..."
        ];

        const color = gameColors[gameId] || '#6366f1';
        
        // Update Backdrop
        if (backdrop) {
            backdrop.style.background = `radial-gradient(circle at center, ${color} 0%, transparent 70%)`;
        }

        // Update Text
        if (preloaderText) {
            if (gameId === 'memory-glitch') {
                preloaderText.innerText = 'ECHO//YOU';
                preloaderText.classList.add('glitch-text-fx');
                preloaderText.setAttribute('data-text', 'ECHO//YOU');
            } else {
                preloaderText.innerText = gameId.replace(/-/g, ' ');
                preloaderText.classList.remove('glitch-text-fx');
            }
            preloaderText.style.backgroundImage = `linear-gradient(to right, #fff, ${color}, #fff)`;
        }

        // Reset progress
        if (progressBar) progressBar.style.width = '0%';
        if (statusText) statusText.innerText = "Connecting...";

        preloader.classList.add('active');
        preloader.style.opacity = '1';

        // Custom theme for ECHO//YOU
        if (gameId === 'memory-glitch') {
            preloader.classList.add('memory-glitch-active');
            if (backdrop) backdrop.style.display = 'none'; // Hide default backdrop
        } else {
            preloader.classList.remove('memory-glitch-active');
            if (backdrop) backdrop.style.display = '';
        }

        // Animate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            if (progress > 30 && progress < 40 && statusText) statusText.innerText = statusMessages[Math.floor(Math.random() * statusMessages.length)];
            if (progress > 60 && progress < 70 && statusText) statusText.innerText = statusMessages[Math.floor(Math.random() * statusMessages.length)];
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                if (statusText) statusText.innerText = "Ready to Play.";
                
                setTimeout(() => {
                    performLaunch(gameId);
                    setTimeout(() => {
                        preloader.style.opacity = '0';
                        setTimeout(() => {
                            preloader.classList.remove('active');
                            if (progressBar) progressBar.style.width = '0%';
                        }, 800);
                    }, 400);
                }, 200);
            }
        }, 100);
    }

    function performLaunch(gameId) {
        console.log('Initializing view for:', gameId);
        switchView('game-view');

        switch (gameId) {
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
            case 'dino':
                gameTitle.innerText = 'Neon Dino';
                loadDino();
                break;
            case 'brick-breaker':
                gameTitle.innerText = 'Brick Breaker';
                loadBrickBreaker();
                break;
            case 'memory-glitch':
                gameTitle.innerText = 'ECHO//YOU';
                loadMemoryGlitch();
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
                <li>Avoid yourself!</li>
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
        `,
        'dino': () => `
            <ul>
                <li>Press <strong>Space</strong> or <strong>Up Arrow</strong> to jump over obstacles.</li>
                <li>Avoid the cacti and neon obstacles!</li>
                <li>The speed increases as you go.</li>
                ${isMobileDevice() ? '<li><strong>Mobile:</strong> Tap the screen to jump.</li>' : ''}
            </ul>
        `,
        'brick-breaker': () => `
            <ul>
                <li>Move the paddle to keep the ball in play and break all the bricks.</li>
                <li><strong>Controls:</strong> Mouse or Left/Right Arrow Keys to move.</li>
                <li><strong>Power-Ups:</strong> Catch falling letters for special abilities!</li>
                <li><strong>(M)</strong> Multi-ball | <strong>(W)</strong> Wide Paddle | <strong>(F)</strong> Fireball</li>
                <li>Clear all bricks to reach the next level. You have 3 lives!</li>
            </ul>
        `,
        'memory-glitch': () => `
            <ul>
                <li>Reach the green exit to progress to the next level.</li>
                <li>Avoid colliding with your past selves (ghosts).</li>
                <li>Every level adds a ghost that repeats your previous movements exactly.</li>
                <li><strong>Controls:</strong> Arrow Keys or WASD to move.</li>
                <li>Plan your path carefully—you'll have to dodge it next time!</li>
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
        return () => { };
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

        // Match canvas internal resolution to its CSS display size (mobile-aware)
        const displaySize = Math.min(canvas.offsetWidth || 400, 400);
        canvas.width = displaySize;
        canvas.height = displaySize;

        const gridSize = 20, tileCount = Math.floor(canvas.width / gridSize);
        let score = 0,
            highscore = localStorage.getItem('snake-highscore') || 0,
            snake = [{ x: 10, y: 10 }],
            food = { x: 5, y: 5 },
            dx = 0,
            dy = 0,
            loop = null,
            paused = true;
        highEl.innerText = highscore;

        function draw() {
            if (paused) return;
            if (dx === 0 && dy === 0) return;
            ctx.fillStyle = '#0f172a'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Move
            let head = { x: snake[0].x + dx, y: snake[0].y + dy };

            // APPLY WRAP BEFORE ADDING TO SNAKE
            head.x = (head.x + tileCount) % tileCount;
            head.y = (head.y + tileCount) % tileCount;

            snake.unshift(head);
            if (snake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
                // game over
            }

            if (head.x === food.x && head.y === food.y) {
                score += 10; scoreEl.innerText = score;
                food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
            } else snake.pop();
            // Wrap around
            head.x = (head.x + tileCount) % tileCount;
            head.y = (head.y + tileCount) % tileCount;

            // Self collision only
            if (snake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
                clearInterval(loop);
                paused = true;
                startBtn.innerText = 'Play Again';

                if (score > highscore) {
                    highscore = score;
                    localStorage.setItem('snake-highscore', score);
                    highEl.innerText = highscore;
                }

                setTimeout(() => window.showLossScreen(`You ran into yourself, ${playerName}.`), 500);
                return;
            } {
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
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/3, 0, Math.PI * 2); ctx.fill();
            // Snake
            snake.forEach((p, i) => {
                ctx.fillStyle = `rgba(16, 185, 129, ${1 - i / snake.length * 0.5})`;
                ctx.beginPath(); ctx.roundRect(p.x * gridSize + 2, p.y * gridSize + 2, gridSize - 4, gridSize - 4, 5); ctx.fill();
            });
        }

        const handleKeys = (e) => {
            if (paused) return;
            const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
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
        }, { passive: false });

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
        }, { passive: false });

        window.addEventListener('keydown', handleKeys);
        startBtn.addEventListener('click', () => {

            // RESET STATE COMPLETELY
            snake = [{ x: 5, y: 5 }];  // safe center
            dx = 1;
            dy = 0;

            // SPAWN FOOD NOT ON SNAKE
            do {
                food = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            } while (food.x === snake[0].x && food.y === snake[0].y);

            score = 0;
            scoreEl.innerText = score;

            paused = false;

            if (loop) clearInterval(loop);
            loop = setInterval(draw, 120);

            startBtn.innerText = 'Restart';
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
                status.innerText = `Stage ${stage - 1} Clear! ${timerPaused ? "(Pause Active)" : "Get ready..."}`;
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

            // Dynamically compute cell size based on available width
            const availWidth = Math.min(window.innerWidth - 60, 600);
            const cellSize = Math.max(20, Math.min(32, Math.floor(availWidth / cols)));

            gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
            // Apply dynamic cell sizing via inline styles on each cell
            const cellStyleStr = `width:${cellSize}px;height:${cellSize}px;font-size:${Math.max(0.65, cellSize / 38)}rem;`;
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
                    cell.el.style.cssText = cellStyleStr;
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
                    }, { passive: true });

                    cell.el.addEventListener('touchend', () => {
                        clearTimeout(pressTimer);
                    }, { passive: true });

                    cell.el.addEventListener('touchmove', () => {
                        clearTimeout(pressTimer);
                    }, { passive: true });

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
        return () => { };
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
        const gameArea = document.getElementById('game-container');

        gameArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
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
                    if (grid[r][c] === grid[r][c + 1]) return false;
                    if (grid[c][r] === grid[c + 1][r]) return false;
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
        }, { passive: true });

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
        }, { passive: true });

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

        const winLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

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
                        if (this.smallBoards[bIdx][cIdx] === "") moves.push({ boardIdx: bIdx, cellIdx: cIdx });
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
                        if (sBoards[b][c] === "") moves.push({ b, c });
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
                if (!selectedMove && active !== -1 && sBoards[active][4] === "") selectedMove = { b: active, c: 4 };

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
            for (let i = 0; i < 9; i++) {
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

            console.log(`MCTS: Ran ${iterations} iterations in ${performance.now() - startTime}ms`);

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
        return () => { };
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
        if (!canvas) return () => { };
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
            I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        };

        const SCORE_TABLE = [0, 100, 300, 500, 800];
        const LEVEL_SPEEDS = [800, 700, 600, 500, 400, 320, 250, 190, 140, 100, 80];

        let board, currentPiece, nextPiece, score, lines, level, combo, best;
        let gameRunning, gamePaused, animFrame, dropTimer, lastTime;
        let flashRows = [], flashAlpha = 0;

        function createBoard() {
            return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        }

        function randomPiece() {
            const types = Object.keys(PIECES);
            const type = types[Math.floor(Math.random() * types.length)];
            return {
                type,
                matrix: PIECES[type].map(r => [...r]),
                x: Math.floor(COLS / 2) - Math.ceil(PIECES[type][0].length / 2),
                y: 0,
            };
        }

        function rotate(matrix) {
            const N = matrix.length;
            const result = Array.from({ length: N }, () => Array(N).fill(0));
            for (let r = 0; r < N; r++)
                for (let c = 0; c < N; c++)
                    result[c][N - 1 - r] = matrix[r][c];
            return result;
        }

        function collides(piece, dx = 0, dy = 0, mat = null) {
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
                    if (matrix[r][c] && y + r >= 0) board[y + r][x + c] = type;

            const cleared = [];
            for (let r = ROWS - 1; r >= 0; r--)
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
                    cleared.sort((a, b) => b - a).forEach(r => {
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
            const midRow = rows[Math.floor(rows.length / 2)];
            popup.style.top = (midRow * CELL + 30) + 'px';
            popup.textContent = `${labels[count]} +${pts}`;
            wrapper.appendChild(popup);
            setTimeout(() => popup.remove(), 1000);
        }

        function ghostY() {
            let dy = 0;
            while (!collides(currentPiece, 0, dy + 1)) dy++;
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
            window.launchGame = function (gameId) {
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
            const speed = LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
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

        function drawCell(context, x, y, type, alpha = 1, size = CELL) {
            const c = COLORS[type];
            const px = x * size, py = y * size;
            const pad = size * 0.05;

            context.globalAlpha = alpha;
            context.shadowColor = c.glow;
            context.shadowBlur = 10;
            context.fillStyle = c.fill;
            context.fillRect(px + pad, py + pad, size - pad * 2, size - pad * 2);

            context.shadowBlur = 0;
            const grad = context.createLinearGradient(px, py, px + size * 0.5, py + size * 0.5);
            grad.addColorStop(0, 'rgba(255,255,255,0.25)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = grad;
            context.fillRect(px + pad, py + pad, size - pad * 2, size - pad * 2);

            context.strokeStyle = 'rgba(255,255,255,0.15)';
            context.lineWidth = 1;
            context.strokeRect(px + pad + 1, py + pad + 1, size - pad * 2 - 2, size - pad * 2 - 2);

            context.globalAlpha = 1;
        }

        function draw() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Board
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c]) {
                        drawCell(ctx, c, r, board[r][c]);
                    }
                }
            }

            // Draw Cleared Row Flash
            if (flashAlpha > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
                flashRows.forEach(r => ctx.fillRect(0, r * CELL, canvas.width, CELL));
                flashAlpha = Math.max(0, flashAlpha - 0.08);
            }

            if (currentPiece) {
                // Draw Ghost
                const dy = ghostY();
                ctx.globalAlpha = 0.18;
                ctx.shadowColor = COLORS[currentPiece.type].glow;
                ctx.shadowBlur = 4;
                for (let r = 0; r < currentPiece.matrix.length; r++) {
                    for (let c = 0; c < currentPiece.matrix[r].length; c++) {
                        if (currentPiece.matrix[r][c]) {
                            ctx.fillStyle = COLORS[currentPiece.type].fill;
                            ctx.fillRect((currentPiece.x + c) * CELL + 2, (currentPiece.y + dy + r) * CELL + 2, CELL - 4, CELL - 4);
                        }
                    }
                }
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;

                // Draw Current Piece
                for (let r = 0; r < currentPiece.matrix.length; r++) {
                    for (let c = 0; c < currentPiece.matrix[r].length; c++) {
                        if (currentPiece.matrix[r][c]) {
                            drawCell(ctx, currentPiece.x + c, currentPiece.y + r, currentPiece.type);
                        }
                    }
                }
            }
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
                        nctx.fillRect(px + 1, py + 1, sz - 2, sz - 2);
                        const g = nctx.createLinearGradient(px, py, px + sz * 0.5, py + sz * 0.5);
                        g.addColorStop(0, 'rgba(255,255,255,0.25)');
                        g.addColorStop(1, 'rgba(255,255,255,0)');
                        nctx.fillStyle = g;
                        nctx.fillRect(px + 1, py + 1, sz - 2, sz - 2);
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
            switch (e.key) {
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
                    else { placePiece(); if (gameRunning) spawnNext(); }
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
        document.getElementById('btn-t-left').addEventListener('click', () => handleKeys({ key: 'ArrowLeft', preventDefault: () => { } }));
        document.getElementById('btn-t-right').addEventListener('click', () => handleKeys({ key: 'ArrowRight', preventDefault: () => { } }));
        document.getElementById('btn-t-rotate').addEventListener('click', () => handleKeys({ key: 'ArrowUp', preventDefault: () => { } }));
        document.getElementById('btn-t-drop').addEventListener('click', () => handleKeys({ key: 'ArrowDown', preventDefault: () => { } }));
        document.getElementById('btn-t-hard').addEventListener('click', () => handleKeys({ key: ' ', preventDefault: () => { } }));

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

        if (!container) return () => { };

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
                const color = [0x6366f1, 0xa855f7, 0xec4899][Math.floor(Math.random() * 3)];

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
            switch (dir) {
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
            deck = Array.from({ length: 10 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
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
                    coin.style.left = `${startRect.left - containerRect.left + startRect.width / 2 + jitterX}px`;
                    coin.style.top = `${startRect.top - containerRect.top + startRect.height / 2 + jitterY}px`;
                    tableInner.appendChild(coin);
                    coin.offsetHeight;
                    coin.style.left = `${endRect.left - containerRect.left + endRect.width / 2 - 12}px`;
                    coin.style.top = `${endRect.top - containerRect.top + endRect.height / 2 - 12}px`;

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
                card.style.left = `${startRect.left - containerRect.left + startRect.width / 2 - 25}px`;
                card.style.top = `${startRect.top - containerRect.top + startRect.height / 2 - 37}px`;
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
                    document.getElementById('host-skip-container').appendChild(skipBtn);
                }
            } else {
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

            if (cheatsEnabled) {
                players[0].coins += currentPool;
                pool = 0;
            } else {
                pool = currentPool;
            }

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
                    <div class="flame-loader-visual">
                        <div class="flame-ring ring-1"></div>
                        <div class="flame-ring ring-2"></div>
                        <div class="flame-core"></div>
                    </div>
                    <div class="flame-loading-text">SOLVING FATE...</div>
                    <div class="flame-loading-status">Analyzing Soul Fragments...</div>
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
            const statusMessages = [
                "Analyzing Soul Fragments...",
                "Decoding Cosmic Resonance...",
                "Consulting the Ancient Scripts...",
                "Measuring Heartbeat Variance...",
                "Syncing Destinies...",
                "Finalizing Fate Calculation..."
            ];
            
            const statusText = loading.querySelector('.flame-loading-status');
            let statusIdx = 0;
            const statusInterval = setInterval(() => {
                if (statusText) statusText.innerText = statusMessages[statusIdx % statusMessages.length];
                statusIdx++;
            }, 600);

            setTimeout(() => {
                clearInterval(statusInterval);
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

        return () => { };
    }

    // --- NEON DINO ---
    function loadDino() {
        gameContainer.innerHTML = `
            <div class="dino-container">
                <div class="dino-stats">
                    <div class="stat-box">Score: <span id="dino-score">0</span></div>
                    <div class="stat-box">High Score: <span id="dino-highscore">0</span></div>
                </div>
                <canvas id="dino-canvas" width="800" height="300"></canvas>
                <div class="dino-controls">
                    <button id="dino-start" class="btn-play">Start Running</button>
                </div>
                <div class="dino-hint">Press SPACE or TAP to Jump</div>
            </div>
        `;
        currentGameCleanup = initDinoLogic();
    }

    function initDinoLogic() {
        const canvas = document.getElementById('dino-canvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('dino-score');
        const highEl = document.getElementById('dino-highscore');
        const startBtn = document.getElementById('dino-start');

        let score = 0;
        let highscore = localStorage.getItem('dino-highscore') || 0;
        highEl.innerText = highscore;

        let gameActive = false;
        let animationId;
        let speed = 5;
        let frameCount = 0;

        const player = {
            x: 50,
            y: 0,
            width: 40,
            height: 40,
            dy: 0,
            jumpForce: 12,
            gravity: 0.6,
            grounded: true,
            color: '#f97316'
        };

        const obstacles = [];
        const particles = [];

        function createParticle(x, y, color) {
            for (let i = 0; i < 5; i++) {
                particles.push({
                    x, y,
                    dx: (Math.random() - 0.5) * 5,
                    dy: (Math.random() - 0.5) * 5,
                    size: Math.random() * 3 + 1,
                    life: 1,
                    color
                });
            }
        }

        function jump() {
            if (!gameActive) return;
            if (player.grounded) {
                player.dy = -player.jumpForce;
                player.grounded = false;
                createParticle(player.x + player.width / 2, player.y + player.height, player.color);
            }
        }

        function update() {
            if (!gameActive) return;

            frameCount++;
            if (frameCount % 10 === 0) {
                score++;
                scoreEl.innerText = score;
                if (score % 100 === 0) speed += 0.5;
            }

            // Player Physics
            player.dy += player.gravity;
            player.y += player.dy;

            const groundY = canvas.height - 40;
            if (player.y + player.height > groundY) {
                player.y = groundY - player.height;
                player.dy = 0;
                player.grounded = true;
            }

            // Obstacles
            if (frameCount % Math.max(50, 100 - Math.floor(speed * 2)) === 0) {
                const height = 30 + Math.random() * 40;
                obstacles.push({
                    x: canvas.width,
                    y: groundY - height,
                    width: 20,
                    height: height,
                    color: '#ec4899'
                });
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= speed;

                // Collision
                if (
                    player.x < obs.x + obs.width &&
                    player.x + player.width > obs.x &&
                    player.y < obs.y + obs.height &&
                    player.y + player.height > obs.y
                ) {
                    gameOver();
                }

                if (obs.x + obs.width < 0) obstacles.splice(i, 1);
            }

            // Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.dx;
                p.y += p.dy;
                p.life -= 0.02;
                if (p.life <= 0) particles.splice(i, 1);
            }

            draw();
            animationId = requestAnimationFrame(update);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ground Line
            const groundY = canvas.height - 40;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            // Ground Glow
            ctx.strokeStyle = 'var(--primary)';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'var(--primary)';
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Player (Neon Dino Shape)
            ctx.fillStyle = player.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = player.color;
            
            // Draw stylized Dino
            ctx.save();
            ctx.translate(player.x, player.y);
            
            // Body
            ctx.fillRect(0, 10, 30, 25); 
            // Head
            ctx.fillRect(15, 0, 20, 15);
            // Eye
            ctx.fillStyle = '#000';
            ctx.fillRect(30, 4, 3, 3);
            ctx.fillStyle = player.color;
            // Tail
            ctx.beginPath();
            ctx.moveTo(0, 15);
            ctx.lineTo(-10, 30);
            ctx.lineTo(5, 30);
            ctx.fill();
            // Feet
            ctx.fillRect(5, 35, 8, 5);
            ctx.fillRect(18, 35, 8, 5);
            
            ctx.restore();
            ctx.shadowBlur = 0;

            // Obstacles (Neon Cacti)
            obstacles.forEach(obs => {
                ctx.fillStyle = obs.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = obs.color;
                
                ctx.save();
                ctx.translate(obs.x, obs.y);
                
                // Main stem
                ctx.fillRect(obs.width/2 - 4, 0, 8, obs.height);
                // Left arm
                if (obs.height > 40) {
                    ctx.fillRect(obs.width/2 - 12, 15, 8, 5);
                    ctx.fillRect(obs.width/2 - 12, 5, 4, 15);
                }
                // Right arm
                ctx.fillRect(obs.width/2 + 4, 25, 8, 5);
                ctx.fillRect(obs.width/2 + 8, 10, 4, 20);
                
                ctx.restore();
                ctx.shadowBlur = 0;
            });

            // Particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        function gameOver() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            startBtn.innerText = 'Run Again';
            startBtn.style.display = 'block';

            if (score > highscore) {
                highscore = score;
                localStorage.setItem('dino-highscore', highscore);
                highEl.innerText = highscore;
            }

            setTimeout(() => window.showLossScreen(`You tripped over a neon cactus, ${playerName}. How... luminous of you.`), 500);
        }

        function startGame() {
            score = 0;
            scoreEl.innerText = '0';
            speed = 5;
            frameCount = 0;
            obstacles.length = 0;
            particles.length = 0;
            player.y = canvas.height - 40 - player.height;
            player.dy = 0;
            gameActive = true;
            startBtn.style.display = 'none';
            update();
        }

        startBtn.onclick = startGame;

        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };

        const handleTouch = (e) => {
            e.preventDefault();
            jump();
        };

        window.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('touchstart', handleTouch);

        draw(); // Initial draw

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
            canvas.removeEventListener('touchstart', handleTouch);
        };
    }

    // --- BRICK BREAKER ---
    function loadBrickBreaker() {
        gameContainer.innerHTML = `
            <div class="brick-container">
                <div class="brick-stats">
                    <div class="brick-stat-item">SCORE: <span id="bb-score">0</span></div>
                    <div class="brick-stat-item">LIVES: <span id="bb-lives">3</span></div>
                    <div class="brick-stat-item">LEVEL: <span id="bb-level">1</span></div>
                </div>
                <div class="brick-canvas-wrapper" id="bb-wrapper">
                    <canvas id="brick-canvas" width="800" height="600"></canvas>
                    <div id="bb-overlay" class="brick-overlay">
                        <div class="brick-overlay-title">BRICK BREAKER</div>
                        <div class="brick-overlay-sub">Smash the bricks. Catch the power-ups.<br>Don't let the ball fall.</div>
                        <button id="bb-start-btn" class="brick-start-btn">Start Mission</button>
                    </div>
                </div>
            </div>
        `;
        currentGameCleanup = initBrickBreakerLogic();
    }

    function initBrickBreakerLogic() {
        const canvas = document.getElementById('brick-canvas');
        if (!canvas) return () => { };
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('bb-score');
        const livesEl = document.getElementById('bb-lives');
        const levelEl = document.getElementById('bb-level');
        const overlay = document.getElementById('bb-overlay');
        const startBtn = document.getElementById('bb-start-btn');
        const wrapper = document.getElementById('bb-wrapper');

        // Game Constants
        const PADDLE_HEIGHT = 15;
        const PADDLE_WIDTH = 120;
        const BALL_RADIUS = 8;
        const BRICK_ROWS = 5;
        const BRICK_COLS = 10;
        const BRICK_PADDING = 10;
        const BRICK_OFFSET_TOP = 40;
        const BRICK_OFFSET_LEFT = 35;
        const BRICK_COLORS = ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

        // Game State
        let score = 0;
        let lives = 3;
        let level = 1;
        let gameActive = false;
        let animationId;
        let shakeTime = 0;
        
        let paddle = { x: (canvas.width - PADDLE_WIDTH) / 2, y: canvas.height - 30, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, color: '#fff' };
        let balls = [];
        let bricks = [];
        let powerUps = [];
        let particles = [];
        
        let rightPressed = false;
        let leftPressed = false;
        let fireballActive = 0; // Timer for fireball
        let widePaddleActive = 0; // Timer for wide paddle

        function initLevel() {
            const rows = BRICK_ROWS + Math.floor(level / 2);
            const cols = BRICK_COLS;
            // Corrected formula for perfect centering: use (cols - 1) gaps
            const bWidth = (canvas.width - (BRICK_OFFSET_LEFT * 2) - ((cols - 1) * BRICK_PADDING)) / cols;
            const bHeight = 25;

            bricks = [];
            for (let c = 0; c < cols; c++) {
                bricks[c] = [];
                for (let r = 0; r < rows; r++) {
                    bricks[c][r] = { 
                        x: 0, y: 0, status: 1, 
                        color: BRICK_COLORS[r % BRICK_COLORS.length],
                        isPowerUp: Math.random() < 0.15 
                    };
                }
            }
            
            // Reset ball
            balls = [{
                x: canvas.width / 2,
                y: canvas.height - 50,
                dx: 4 + level,
                dy: -(4 + level),
                radius: BALL_RADIUS,
                color: '#fff'
            }];
            
            paddle.width = PADDLE_WIDTH;
            fireballActive = 0;
            widePaddleActive = 0;
        }

        function createParticles(x, y, color) {
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    size: Math.random() * 4,
                    life: 1.0,
                    color: color
                });
            }
        }

        function spawnPowerUp(x, y) {
            const types = ['M', 'W', 'F'];
            const type = types[Math.floor(Math.random() * types.length)];
            powerUps.push({ x, y, type, dy: 3, radius: 15 });
        }

        function drawBricks() {
            const cols = bricks.length;
            const rows = bricks[0].length;
            const bWidth = (canvas.width - (BRICK_OFFSET_LEFT * 2) - ((cols - 1) * BRICK_PADDING)) / cols;
            const bHeight = 25;

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX = (c * (bWidth + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                        const brickY = (r * (bHeight + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        bricks[c][r].w = bWidth;
                        bricks[c][r].h = bHeight;

                        ctx.beginPath();
                        ctx.roundRect(brickX, brickY, bWidth, bHeight, 4);
                        ctx.fillStyle = bricks[c][r].color;
                        ctx.fill();
                        ctx.closePath();
                        
                        // Subtle inner highlight for "glow" look without performance hit
                        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(brickX + 1, brickY + 1, bWidth - 2, bHeight - 2);
                    }
                }
            }
        }

        function drawPaddle() {
            ctx.beginPath();
            ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
            ctx.fillStyle = widePaddleActive > 0 ? '#10b981' : '#fff';
            ctx.fill();
            ctx.closePath();
        }

        function drawBall(ball) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = fireballActive > 0 ? '#ef4444' : '#fff';
            ctx.fill();
            ctx.closePath();
            
            if (fireballActive > 0) {
                // Trail effect
                ctx.beginPath();
                ctx.arc(ball.x - ball.dx, ball.y - ball.dy, ball.radius * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.fill();
                ctx.closePath();
            }
        }

        function drawPowerUps() {
            powerUps.forEach((p, index) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.type, p.x, p.y);
                ctx.closePath();
            });
        }

        function drawParticles() {
            particles.forEach((p, index) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.closePath();
                ctx.globalAlpha = 1.0;
            });
        }

        function collisionDetection() {
            bricks.forEach(column => {
                column.forEach(b => {
                    if (b.status === 1) {
                        balls.forEach(ball => {
                            if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
                                if (fireballActive <= 0) ball.dy = -ball.dy;
                                b.status = 0;
                                score += 10;
                                scoreEl.innerText = score;
                                shakeTime = 5;
                                createParticles(b.x + b.w / 2, b.y + b.h / 2, b.color);
                                
                                if (b.isPowerUp) spawnPowerUp(b.x + b.w / 2, b.y + b.h / 2);
                                
                                // Check for level clear
                                if (bricks.every(col => col.every(br => br.status === 0))) {
                                    level++;
                                    levelEl.innerText = level;
                                    initLevel();
                                }
                            }
                        });
                    }
                });
            });
        }

        function update() {
            if (!gameActive) return;

            // Clear Canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Screen Shake
            if (shakeTime > 0) {
                ctx.save();
                const dx = (Math.random() - 0.5) * 6;
                const dy = (Math.random() - 0.5) * 6;
                ctx.translate(dx, dy);
                shakeTime--;
            }

            drawBricks();
            drawPaddle();
            drawPowerUps();
            drawParticles();
            balls.forEach(drawBall);

            if (shakeTime > 0) ctx.restore();

            // Ball Physics
            balls.forEach((ball, bIndex) => {
                if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
                    ball.dx = -ball.dx;
                }
                if (ball.y + ball.dy < ball.radius) {
                    ball.dy = -ball.dy;
                } else if (ball.y + ball.dy > canvas.height - ball.radius - 15) {
                    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                        // Paddle hit - angle calculation
                        let hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                        ball.dx = hitPos * 8;
                        ball.dy = -Math.abs(ball.dy);
                    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
                        // Ball lost
                        balls.splice(bIndex, 1);
                        if (balls.length === 0) {
                            lives--;
                            livesEl.innerText = lives;
                            if (lives === 0) {
                                gameOver();
                            } else {
                                balls.push({
                                    x: canvas.width / 2,
                                    y: canvas.height - 50,
                                    dx: 4 + level,
                                    dy: -(4 + level),
                                    radius: BALL_RADIUS,
                                    color: '#fff'
                                });
                                fireballActive = 0;
                                widePaddleActive = 0;
                                paddle.width = PADDLE_WIDTH;
                            }
                        }
                    }
                }
                ball.x += ball.dx;
                ball.y += ball.dy;
            });

            // PowerUp Physics
            powerUps.forEach((p, index) => {
                p.y += p.dy;
                if (p.x > paddle.x && p.x < paddle.x + paddle.width && p.y > paddle.y && p.y < paddle.y + paddle.height) {
                    // Activate PowerUp
                    if (p.type === 'M') {
                        // Multi-ball
                        const b = balls[0] || { x: canvas.width/2, y: canvas.height-50, dx: 5, dy: -5 };
                        balls.push({ ...b, dx: -b.dx, dy: b.dy });
                        balls.push({ ...b, dx: b.dx * 0.5, dy: b.dy * 1.5 });
                    } else if (p.type === 'W') {
                        // Wide Paddle
                        paddle.width = PADDLE_WIDTH * 2;
                        widePaddleActive = 300; // 5 seconds at 60fps
                    } else if (p.type === 'F') {
                        // Fireball
                        fireballActive = 300;
                    }
                    powerUps.splice(index, 1);
                } else if (p.y > canvas.width) {
                    powerUps.splice(index, 1);
                }
            });

            // Timers
            if (widePaddleActive > 0) {
                widePaddleActive--;
                if (widePaddleActive === 0) paddle.width = PADDLE_WIDTH;
            }
            if (fireballActive > 0) fireballActive--;

            // Particle Physics
            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                if (p.life <= 0) particles.splice(index, 1);
            });

            // Paddle Movement
            if (rightPressed && paddle.x < canvas.width - paddle.width) {
                paddle.x += 8;
            } else if (leftPressed && paddle.x > 0) {
                paddle.x -= 8;
            }

            collisionDetection();
            animationId = requestAnimationFrame(update);
        }

        function gameOver() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            document.querySelector('.brick-overlay-title').innerText = 'GAME OVER';
            document.querySelector('.brick-overlay-sub').innerHTML = `Final Score: <span>${score}</span><br>Reached Level: <span>${level}</span>`;
            document.getElementById('bb-start-btn').innerText = 'Retry Mission';
            overlay.style.display = 'flex';
            setTimeout(() => window.showLossScreen(`You failed the mission, ${playerName}. The bricks won.`), 500);
        }

        function startMission() {
            score = 0; lives = 3; level = 1;
            scoreEl.innerText = '0';
            livesEl.innerText = '3';
            levelEl.innerText = '1';
            overlay.style.display = 'none';
            gameActive = true;
            initLevel();
            update();
        }

        startBtn.onclick = startMission;

        // Listeners
        const handleKeyDown = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
        };
        const handleKeyUp = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
        };
        const handleMouse = (e) => {
            const rect = canvas.getBoundingClientRect();
            const root = document.documentElement;
            const mouseX = e.clientX - rect.left - root.scrollLeft;
            paddle.x = mouseX - paddle.width / 2;
            if (paddle.x < 0) paddle.x = 0;
            if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
        };
        const handleTouch = (e) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const touchX = touch.clientX - rect.left;
            paddle.x = touchX - paddle.width / 2;
            if (paddle.x < 0) paddle.x = 0;
            if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouse);
        canvas.addEventListener('touchmove', handleTouch, { passive: false });

        return () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouse);
            canvas.removeEventListener('touchmove', handleTouch);
        };
    }

    // --- MEMORY GLITCH ---
    function loadMemoryGlitch() {
        gameContainer.innerHTML = `
            <div class="glitch-container">
                <div class="glitch-stats">
                    <div class="glitch-stat">
                        <span class="label">Level</span>
                        <span class="value" id="glitch-level">1</span>
                    </div>
                    <div class="glitch-stat">
                        <span class="label">Ghosts</span>
                        <span class="value" id="glitch-ghosts">0</span>
                    </div>
                </div>
                <div style="position: relative;">
                    <div id="glitch-status-indicator" class="glitch-indicator">SYSTEM RECORDING...</div>
                    <canvas id="glitch-canvas" width="900" height="540"></canvas>
                </div>
                <div class="glitch-controls">
                    <button id="glitch-start-btn" class="btn-play">Initialize Sequence</button>
                </div>
            </div>
        `;
        currentGameCleanup = initMemoryGlitchLogic();
    }

    function initMemoryGlitchLogic() {
        const canvas = document.getElementById('glitch-canvas');
        if (!canvas) return () => {};
        const ctx = canvas.getContext('2d');
        const levelEl = document.getElementById('glitch-level');
        const ghostsEl = document.getElementById('glitch-ghosts');
        const startBtn = document.getElementById('glitch-start-btn');
        const statusIndicator = document.getElementById('glitch-status-indicator');

        const GRID_SIZE = 30;
        const ROWS = canvas.height / GRID_SIZE;
        const COLS = canvas.width / GRID_SIZE;

        let level = 1;
        let gameActive = false;
        let isDead = false;
        let animationId = null;
        let player = { x: 0, y: 0, targetX: 0, targetY: 0, color: '#00ffff' };
        let currentPath = [];
        let pastGhosts = [];
        let ghostFrame = 0;
        let currentLevelData = [];
        
        const ghostColors = ['#ff00ff', '#00ff00', '#ffff00', '#ff8000', '#ff0000', '#8000ff'];

        const LEVELS = [
            [
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
                "WS...........................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W...........................GW",
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
            ],
            [
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
                "WS.........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W............................W", // Top gap
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W............................W", // Middle gap
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W........W",
                "W..........W........W.......GW",
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
            ],
            [
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
                "WS...........................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W.WWWWWWWWWWWWWWWWWWWWWWWWWW.W",
                "W............................W",
                "W...........................GW",
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
            ],
            [
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
                "WS...........................W",
                "W............................W",
                "W............................W",
                "W...WWWWWWWWWWWWWWWWWWWWWW...W",
                "W...W....................W...W",
                "W...W...WWWWWWWWWWWWWW...W...W",
                "W...W...W............W...W...W",
                "W...W...W...WWWWWW...W...W...W",
                "W...W...W...W....G...W...W...W", // Goal in center
                "W...W...W...W........W...W...W",
                "W...W...W...WWWWWWWWWW...W...W",
                "W...W...W................W...W",
                "W...W...WWWWWWWWWWWWWWWWWW...W",
                "W...W........................W",
                "W...WWWWWWWWWWWWWWWWWWWWWWWWWW",
                "W............................W",
                "W............................W",
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
            ],
            [
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
                "WS...........................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "W............................W",
                "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
            ]
        ];

        let survivalMode = false;
        let survivalTimeRemaining = 150; // 2:30
        let lastTimeUpdate = 0;
        let aiGhost = { x: 0, y: 0, color: '#ff0000' };

        function initLevel(lvlIdx) {
            isDead = false;
            survivalMode = (lvlIdx === 5);
            if (survivalMode) {
                survivalTimeRemaining = 90; // Balanced to 1:30
                lastTimeUpdate = Date.now();
                aiGhost = { 
                    x: canvas.width - 45, 
                    y: canvas.height - 45, 
                    color: '#ff0000' 
                };
                if (statusIndicator) {
                    statusIndicator.innerText = "SURVIVE: 02:30";
                    statusIndicator.style.color = "#ff0000";
                }
            }
            const layout = LEVELS[Math.min(lvlIdx - 1, LEVELS.length - 1)];
            currentLevelData = [];
            for (let r = 0; r < ROWS; r++) {
                currentLevelData[r] = [];
                for (let c = 0; c < COLS; c++) {
                    const char = layout[r][c];
                    currentLevelData[r][c] = char;
                    if (char === 'S') {
                        player.x = c * GRID_SIZE + GRID_SIZE / 2;
                        player.y = r * GRID_SIZE + GRID_SIZE / 2;
                        player.targetX = player.x;
                        player.targetY = player.y;
                    }
                }
            }
            currentPath = [];
            ghostFrame = 0;
            levelEl.innerText = lvlIdx === 5 ? "SURVIVAL" : lvlIdx;
            ghostsEl.innerText = survivalMode ? "AI" : pastGhosts.length;
            if (!survivalMode && statusIndicator) {
                statusIndicator.innerText = "SYSTEM RECORDING...";
                statusIndicator.style.color = "#00ffff";
            }
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += GRID_SIZE) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            }

            // Draw Walls & Goal
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = currentLevelData[r][c];
                    if (cell === 'W') {
                        ctx.fillStyle = '#1e293b';
                        ctx.fillRect(c * GRID_SIZE + 2, r * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        ctx.strokeRect(c * GRID_SIZE + 2, r * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                    } else if (cell === 'G') {
                        const time = Date.now() / 500;
                        const glow = 10 + Math.sin(time) * 5;
                        ctx.shadowBlur = glow;
                        ctx.shadowColor = '#00ff00';
                        ctx.fillStyle = '#00ff00';
                        ctx.beginPath();
                        ctx.arc(c * GRID_SIZE + GRID_SIZE / 2, r * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // Draw Ghosts
            if (!survivalMode) {
                pastGhosts.forEach((ghost, index) => {
                    const pos = ghost.path[ghostFrame % ghost.path.length];
                    if (pos) {
                        // Fade in effect during grace period
                        const alpha = ghostFrame < 60 ? ghostFrame / 60 : 1.0;
                        ctx.globalAlpha = alpha;
                        
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = ghost.color;
                        ctx.fillStyle = ghost.color;
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
                        ctx.fill();

                        // Draw trail
                        ctx.beginPath();
                        ctx.strokeStyle = ghost.color;
                        ctx.lineWidth = 2;
                        ctx.globalAlpha = alpha * 0.3;
                        const ghostCycleFrame = ghostFrame % ghost.path.length;
                        const startIdx = Math.max(0, ghostCycleFrame - 20);
                        if (ghost.path[startIdx]) {
                            ctx.moveTo(ghost.path[startIdx].x, ghost.path[startIdx].y);
                            for (let i = startIdx + 1; i <= ghostCycleFrame; i++) {
                                if (ghost.path[i]) ctx.lineTo(ghost.path[i].x, ghost.path[i].y);
                            }
                            ctx.stroke();
                        }
                        ctx.globalAlpha = 1.0;
                        ctx.shadowBlur = 0;
                    }
                });
            }

            // Draw Player
            ctx.shadowBlur = 20;
            ctx.shadowColor = player.color;
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw current path trail
            if (currentPath.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = player.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.5;
                const startIdx = Math.max(0, currentPath.length - 30);
                ctx.moveTo(currentPath[startIdx].x, currentPath[startIdx].y);
                for (let i = startIdx + 1; i < currentPath.length; i++) {
                    ctx.lineTo(currentPath[i].x, currentPath[i].y);
                }
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }

            if (isDead) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.font = 'bold 80px "Outfit"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Glitch effect for text
                const offset = Math.sin(Date.now() / 50) * 5;
                ctx.fillStyle = '#ff00ff';
                ctx.fillText('YOU DIED', canvas.width / 2 + offset, canvas.height / 2);
                ctx.fillStyle = '#00ffff';
                ctx.fillText('YOU DIED', canvas.width / 2 - offset, canvas.height / 2);
                ctx.fillStyle = '#ff0000';
                ctx.fillText('YOU DIED', canvas.width / 2, canvas.height / 2);

                ctx.font = '20px "Outfit"';
                ctx.fillStyle = '#fff';
                ctx.fillText('MEMORY CORRUPTION DETECTED', canvas.width / 2, canvas.height / 2 + 60);
            }
        }

        function update() {
            if (!gameActive) return;

            // Smooth movement towards target
            const speed = 6; // Buffed speed for survival mode
            if (player.x < player.targetX) player.x = Math.min(player.x + speed, player.targetX);
            if (player.x > player.targetX) player.x = Math.max(player.x - speed, player.targetX);
            if (player.y < player.targetY) player.y = Math.min(player.y + speed, player.targetY);
            if (player.y > player.targetY) player.y = Math.max(player.y - speed, player.targetY);

            // Record path
            currentPath.push({ x: player.x, y: player.y });

            // Survival Mode Logic
            if (survivalMode) {
                // AI Ghost Movement (Intelligent but Slow, gets faster over time)
                const timePassed = 90 - survivalTimeRemaining;
                const speedMultiplier = 1 + (Math.floor(timePassed / 30) * 0.25);
                const aiSpeed = 1.2 * speedMultiplier;
                if (aiGhost.x < player.x) aiGhost.x += aiSpeed;
                if (aiGhost.x > player.x) aiGhost.x -= aiSpeed;
                if (aiGhost.y < player.y) aiGhost.y += aiSpeed;
                if (aiGhost.y > player.y) aiGhost.y -= aiSpeed;

                // Collision with AI Ghost
                const adx = player.x - aiGhost.x;
                const ady = player.y - aiGhost.y;
                const adist = Math.sqrt(adx * adx + ady * ady);
                if (adist < 20) {
                    gameOver("CAUGHT BY THE SYSTEM: SEQUENCE TERMINATED");
                }

                // Update Timer
                const now = Date.now();
                if (now - lastTimeUpdate >= 1000) {
                    survivalTimeRemaining--;
                    lastTimeUpdate = now;
                    if (statusIndicator) {
                        const mins = Math.floor(survivalTimeRemaining / 60);
                        const secs = survivalTimeRemaining % 60;
                        statusIndicator.innerText = `SURVIVE: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    }
                    if (survivalTimeRemaining <= 0) {
                        winLevel();
                        return;
                    }
                }
            } else {
                // Check Goal (Standard Levels)
                const gridX = Math.floor(player.x / GRID_SIZE);
                const gridY = Math.floor(player.y / GRID_SIZE);
                if (currentLevelData[gridY] && currentLevelData[gridY][gridX] === 'G') {
                    winLevel();
                    return;
                }

                // Check Ghost Collision - Add grace period of 60 frames (approx 1s)
                if (ghostFrame > 60) {
                    if (statusIndicator && ghostFrame === 61) {
                        statusIndicator.innerText = "GHOSTS MATERIALIZED - AVOID!";
                        statusIndicator.style.color = "#ff00ff";
                    }
                    pastGhosts.forEach(ghost => {
                        const pos = ghost.path[ghostFrame % ghost.path.length];
                        if (pos) {
                            const dx = player.x - pos.x;
                            const dy = player.y - pos.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 15) {
                                gameOver("MEMORY COLLISION: SEQUENCE TERMINATED");
                            }
                        }
                    });
                } else if (statusIndicator) {
                    statusIndicator.innerText = "CALIBRATING MEMORY (STAY CLEAR)...";
                    statusIndicator.style.color = "#00ffff";
                }
            }

            ghostFrame++;
            draw();
            animationId = requestAnimationFrame(update);
        }

        function winLevel() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            
            if (survivalMode) {
                showCelebration(`You have outlived the system, ${playerName}. Sequence completed.`);
                return;
            }

            // Save current path as a ghost
            pastGhosts.push({
                path: [...currentPath],
                color: ghostColors[pastGhosts.length % ghostColors.length]
            });

            level++;
            if (level === 5) {
                // Show Survival Mode Rules Overlay
                gameActive = false;
                const canvasRect = canvas.getBoundingClientRect();
                const overlay = document.createElement('div');
                overlay.className = 'glitch-survival-overlay';
                overlay.innerHTML = `
                    <div class="survival-content">
                        <h2>⚠️ SYSTEM OVERRIDE ⚠️</h2>
                        <h3>LEVEL 5: SURVIVAL MODE</h3>
                        <p>The rules have changed. The computer ghost has taken control of the arena.</p>
                        <ul>
                            <li><strong>OBJECTIVE:</strong> STAY ALIVE for 1 minute 30 seconds.</li>
                            <li><strong>THREAT:</strong> The AI ghost is intelligent but slow.</li>
                            <li><strong>INTENSITY:</strong> The AI gets FASTER every 30 seconds.</li>
                            <li><strong>ADVANTAGE:</strong> Your speed has been buffed.</li>
                        </ul>
                        <button id="start-survival-btn" class="btn-play">BREAK THE SYSTEM</button>
                    </div>
                `;
                gameContainer.appendChild(overlay);

                document.getElementById('start-survival-btn').onclick = () => {
                    overlay.remove();
                    initLevel(level);
                    gameActive = true;
                    update();
                };
            } else if (level > LEVELS.length) {
                showCelebration(`You have outplayed your past, ${playerName}. The loop is broken.`);
            } else {
                if (statusIndicator) {
                    statusIndicator.innerText = "MEMORY LOADED. RE-INITIALIZING...";
                    statusIndicator.style.color = "#00ffff";
                }
                setTimeout(() => {
                    initLevel(level);
                    gameActive = true;
                    update();
                }, 1500);
            }
        }

        function gameOver(msg) {
            gameActive = false;
            isDead = true;
            draw(); // Draw final frame with overlay
            cancelAnimationFrame(animationId);
            if (statusIndicator) {
                statusIndicator.innerText = "YOU DIED: SEQUENCE TERMINATED";
                statusIndicator.style.color = "#ff0000";
            }
            if (startBtn) {
                startBtn.style.display = 'block';
                startBtn.innerText = 'RESTORE MEMORY (RETRY)';
            }
        }

        function handleInput(e) {
            if (!gameActive) return;
            const key = e.key;
            let nextX = player.targetX;
            let nextY = player.targetY;

            if (key === 'ArrowUp' || key === 'w' || key === 'W') nextY -= GRID_SIZE;
            if (key === 'ArrowDown' || key === 's' || key === 'S') nextY += GRID_SIZE;
            if (key === 'ArrowLeft' || key === 'a' || key === 'A') nextX -= GRID_SIZE;
            if (key === 'ArrowRight' || key === 'd' || key === 'D') nextX += GRID_SIZE;

            const gridX = Math.floor(nextX / GRID_SIZE);
            const gridY = Math.floor(nextY / GRID_SIZE);

            if (currentLevelData[gridY] && currentLevelData[gridY][gridX] !== 'W') {
                player.targetX = nextX;
                player.targetY = nextY;
            }
        }

        startBtn.onclick = () => {
            if (gameActive) return;
            pastGhosts = [];
            level = 1;
            initLevel(level);
            gameActive = true;
            startBtn.style.display = 'none';
            update();
        };

        window.addEventListener('keydown', handleInput);

        return () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleInput);
        };
    }

}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
