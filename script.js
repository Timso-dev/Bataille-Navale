class BattleshipGame {
    constructor() {
        // Configuration des navires
        this.ships = [
            { name: 'Porte-avions', size: 5, icon: '🛩️', count: 1 },
            { name: 'Cuirassé', size: 4, icon: '🚢', count: 1 },
            { name: 'Croiseur', size: 3, icon: '⛵', count: 1 },
            { name: 'Sous-marin', size: 3, icon: '🔱', count: 1 },
            { name: 'Destroyer', size: 2, icon: '🚤', count: 1 }
        ];

        // État du jeu
        this.gameState = {
            phase: 'placement', // 'placement', 'battle', 'ended'
            currentTurn: 'player', // 'player', 'ai'
            playerBoard: this.createEmptyBoard(),
            aiBoard: this.createEmptyBoard(),
            playerShips: [],
            aiShips: [],
            selectedShip: null,
            shipOrientation: 'horizontal', // 'horizontal', 'vertical'
            shots: { player: 0, ai: 0 },
            hits: { player: 0, ai: 0 }
        };

        this.initializeDOM();
        this.setupEventListeners();
        this.createBoards();
        this.createShipsList();
        this.updateDisplay();
    }

    createEmptyBoard() {
        return Array(10).fill().map(() => Array(10).fill({
            hasShip: false,
            isHit: false,
            shipId: null,
            shipPart: null
        }));
    }

    initializeDOM() {
        // Éléments du DOM
        this.playerBoardEl = document.getElementById('playerBoard');
        this.enemyBoardEl = document.getElementById('enemyBoard');
        this.shipsListEl = document.getElementById('shipsList');
        this.gamePhaseEl = document.getElementById('gamePhase');
        this.currentTurnEl = document.getElementById('currentTurn');
        this.shotCountEl = document.getElementById('shotCount');
        this.accuracyEl = document.getElementById('accuracy');
        this.playerShipsLeftEl = document.getElementById('playerShipsLeft');
        this.aiShipsLeftEl = document.getElementById('aiShipsLeft');
        this.messageEl = document.getElementById('message');
        
        // Boutons
        this.rotateBtn = document.getElementById('rotateBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.startBtn = document.getElementById('startBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.loadBtn = document.getElementById('loadBtn');
        
        // Modal
        this.gameOverModal = document.getElementById('gameOverModal');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverStats = document.getElementById('gameOverStats');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
    }

    setupEventListeners() {
        // Boutons de contrôle
        this.rotateBtn.addEventListener('click', () => this.rotateShip());
        this.randomBtn.addEventListener('click', () => this.randomPlacement());
        this.clearBtn.addEventListener('click', () => this.clearBoard());
        this.startBtn.addEventListener('click', () => this.startGame());
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.saveBtn.addEventListener('click', () => this.saveGame());
        this.loadBtn.addEventListener('click', () => this.loadGame());
        
        // Modal
        this.playAgainBtn.addEventListener('click', () => this.newGame());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.rotateShip();
            }
        });
    }

    createBoards() {
        this.createBoard(this.playerBoardEl, 'player');
        this.createBoard(this.enemyBoardEl, 'enemy');
    }

    createBoard(boardElement, boardType) {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.boardType = boardType;
                
                if (boardType === 'player') {
                    cell.addEventListener('click', (e) => this.handlePlayerBoardClick(e));
                    cell.addEventListener('mouseover', (e) => this.handlePlayerBoardHover(e));
                    cell.addEventListener('mouseleave', (e) => this.clearPreview());
                } else {
                    cell.addEventListener('click', (e) => this.handleEnemyBoardClick(e));
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    createShipsList() {
        this.shipsListEl.innerHTML = '';
        
        this.ships.forEach((shipType, index) => {
            for (let i = 0; i < shipType.count; i++) {
                const shipElement = document.createElement('div');
                shipElement.className = 'ship-item';
                shipElement.dataset.shipIndex = index;
                shipElement.dataset.shipInstance = i;
                
                shipElement.innerHTML = `
                    <div class="ship-info">
                        <span class="ship-icon">${shipType.icon}</span>
                        <div class="ship-details">
                            <span class="ship-name">${shipType.name}</span>
                            <span class="ship-size">${shipType.size} cases</span>
                        </div>
                    </div>
                    <div class="ship-visual">
                        ${Array(shipType.size).fill().map(() => '<div class="ship-segment"></div>').join('')}
                    </div>
                `;
                
                shipElement.addEventListener('click', () => this.selectShip(index, i));
                this.shipsListEl.appendChild(shipElement);
            }
        });
    }

    selectShip(shipIndex, instanceIndex) {
        if (this.gameState.phase !== 'placement') return;
        
        // Déselectionner l'ancien navire
        document.querySelectorAll('.ship-item').forEach(el => el.classList.remove('selected'));
        
        // Sélectionner le nouveau navire
        const shipElement = document.querySelector(`[data-ship-index="${shipIndex}"][data-ship-instance="${instanceIndex}"]`);
        
        if (shipElement.classList.contains('placed')) {
            this.gameState.selectedShip = null;
            return;
        }
        
        shipElement.classList.add('selected');
        this.gameState.selectedShip = { shipIndex, instanceIndex };
        this.showMessage('Cliquez sur la grille pour placer le navire', 'info');
    }

    handlePlayerBoardClick(event) {
        if (this.gameState.phase !== 'placement' || !this.gameState.selectedShip) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        this.placeShip(row, col);
    }

    handlePlayerBoardHover(event) {
        if (this.gameState.phase !== 'placement' || !this.gameState.selectedShip) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        this.showShipPreview(row, col);
    }

    showShipPreview(row, col) {
        this.clearPreview();
        
        const ship = this.ships[this.gameState.selectedShip.shipIndex];
        const positions = this.getShipPositions(row, col, ship.size, this.gameState.shipOrientation);
        const isValid = this.isValidPlacement(positions);
        
        positions.forEach(pos => {
            if (pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10) {
                const cell = this.playerBoardEl.children[pos.row * 10 + pos.col];
                cell.classList.add(isValid ? 'preview' : 'invalid-preview');
            }
        });
    }

    clearPreview() {
        document.querySelectorAll('.preview, .invalid-preview').forEach(cell => {
            cell.classList.remove('preview', 'invalid-preview');
        });
    }

    placeShip(row, col) {
        const ship = this.ships[this.gameState.selectedShip.shipIndex];
        const positions = this.getShipPositions(row, col, ship.size, this.gameState.shipOrientation);
        
        if (!this.isValidPlacement(positions)) {
            this.showMessage('Placement invalide!', 'error');
            return;
        }
        
        // Créer le navire
        const newShip = {
            id: `player_ship_${this.gameState.selectedShip.shipIndex}_${this.gameState.selectedShip.instanceIndex}`,
            type: this.gameState.selectedShip.shipIndex,
            positions: positions,
            hits: 0,
            sunk: false
        };
        
        // Placer sur le plateau
        positions.forEach((pos, index) => {
            this.gameState.playerBoard[pos.row][pos.col] = {
                hasShip: true,
                isHit: false,
                shipId: newShip.id,
                shipPart: index
            };
        });
        
        this.gameState.playerShips.push(newShip);
        
        // Mettre à jour l'affichage
        this.updatePlayerBoard();
        
        // Marquer le navire comme placé
        const shipElement = document.querySelector(`[data-ship-index="${this.gameState.selectedShip.shipIndex}"][data-ship-instance="${this.gameState.selectedShip.instanceIndex}"]`);
        shipElement.classList.add('placed');
        shipElement.classList.remove('selected');
        
        this.gameState.selectedShip = null;
        this.clearPreview();
        
        // Vérifier si tous les navires sont placés
        if (this.gameState.playerShips.length === this.ships.length) {
            this.startBtn.disabled = false;
            this.showMessage('Tous les navires sont placés! Vous pouvez commencer.', 'success');
        }
        
        this.updateDisplay();
    }

    getShipPositions(startRow, startCol, size, orientation) {
        const positions = [];
        
        for (let i = 0; i < size; i++) {
            if (orientation === 'horizontal') {
                positions.push({ row: startRow, col: startCol + i });
            } else {
                positions.push({ row: startRow + i, col: startCol });
            }
        }
        
        return positions;
    }

    isValidPlacement(positions) {
        return positions.every(pos => {
            // Vérifier les limites du plateau
            if (pos.row < 0 || pos.row >= 10 || pos.col < 0 || pos.col >= 10) {
                return false;
            }
            
            // Vérifier qu'il n'y a pas déjà un navire
            if (this.gameState.playerBoard[pos.row][pos.col].hasShip) {
                return false;
            }
            
            // Vérifier qu'il n'y a pas de navire adjacent
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const newRow = pos.row + dr;
                    const newCol = pos.col + dc;
                    
                    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
                        if (this.gameState.playerBoard[newRow][newCol].hasShip) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
        });
    }

    rotateShip() {
        if (this.gameState.phase !== 'placement') return;
        
        this.gameState.shipOrientation = this.gameState.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        this.showMessage(`Orientation: ${this.gameState.shipOrientation}`, 'info');
    }

    randomPlacement() {
        if (this.gameState.phase !== 'placement') return;
        
        this.clearBoard();
        
        this.ships.forEach((shipType, shipIndex) => {
            for (let instance = 0; instance < shipType.count; instance++) {
                let placed = false;
                let attempts = 0;
                
                while (!placed && attempts < 100) {
                    const row = Math.floor(Math.random() * 10);
                    const col = Math.floor(Math.random() * 10);
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    
                    const positions = this.getShipPositions(row, col, shipType.size, orientation);
                    
                    if (this.isValidPlacement(positions)) {
                        const newShip = {
                            id: `player_ship_${shipIndex}_${instance}`,
                            type: shipIndex,
                            positions: positions,
                            hits: 0,
                            sunk: false
                        };
                        
                        positions.forEach((pos, index) => {
                            this.gameState.playerBoard[pos.row][pos.col] = {
                                hasShip: true,
                                isHit: false,
                                shipId: newShip.id,
                                shipPart: index
                            };
                        });
                        
                        this.gameState.playerShips.push(newShip);
                        placed = true;
                    }
                    
                    attempts++;
                }
            }
        });
        
        this.updatePlayerBoard();
        this.markAllShipsAsPlaced();
        this.startBtn.disabled = false;
        this.showMessage('Placement aléatoire terminé!', 'success');
        this.updateDisplay();
    }

    markAllShipsAsPlaced() {
        document.querySelectorAll('.ship-item').forEach(el => {
            el.classList.add('placed');
            el.classList.remove('selected');
        });
        this.gameState.selectedShip = null;
    }

    clearBoard() {
        if (this.gameState.phase !== 'placement') return;
        
        this.gameState.playerBoard = this.createEmptyBoard();
        this.gameState.playerShips = [];
        this.updatePlayerBoard();
        
        document.querySelectorAll('.ship-item').forEach(el => {
            el.classList.remove('placed', 'selected');
        });
        
        this.gameState.selectedShip = null;
        this.startBtn.disabled = true;
        this.showMessage('Plateau effacé', 'info');
        this.updateDisplay();
    }

    startGame() {
        if (this.gameState.playerShips.length !== this.ships.length) {
            this.showMessage('Placez tous vos navires avant de commencer!', 'error');
            return;
        }
        
        this.gameState.phase = 'battle';
        this.placeAIShips();
        this.updateDisplay();
        this.showMessage('La bataille commence! À vous de jouer.', 'success');
    }

    placeAIShips() {
        this.gameState.aiBoard = this.createEmptyBoard();
        this.gameState.aiShips = [];
        
        this.ships.forEach((shipType, shipIndex) => {
            for (let instance = 0; instance < shipType.count; instance++) {
                let placed = false;
                let attempts = 0;
                
                while (!placed && attempts < 100) {
                    const row = Math.floor(Math.random() * 10);
                    const col = Math.floor(Math.random() * 10);
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    
                    const positions = this.getShipPositions(row, col, shipType.size, orientation);
                    
                    if (this.isValidAIPlacement(positions)) {
                        const newShip = {
                            id: `ai_ship_${shipIndex}_${instance}`,
                            type: shipIndex,
                            positions: positions,
                            hits: 0,
                            sunk: false
                        };
                        
                        positions.forEach((pos, index) => {
                            this.gameState.aiBoard[pos.row][pos.col] = {
                                hasShip: true,
                                isHit: false,
                                shipId: newShip.id,
                                shipPart: index
                            };
                        });
                        
                        this.gameState.aiShips.push(newShip);
                        placed = true;
                    }
                    
                    attempts++;
                }
            }
        });
    }

    isValidAIPlacement(positions) {
        return positions.every(pos => {
            if (pos.row < 0 || pos.row >= 10 || pos.col < 0 || pos.col >= 10) {
                return false;
            }
            
            if (this.gameState.aiBoard[pos.row][pos.col].hasShip) {
                return false;
            }
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const newRow = pos.row + dr;
                    const newCol = pos.col + dc;
                    
                    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
                        if (this.gameState.aiBoard[newRow][newCol].hasShip) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
        });
    }

    handleEnemyBoardClick(event) {
        if (this.gameState.phase !== 'battle' || this.gameState.currentTurn !== 'player') return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        this.playerShoot(row, col);
    }

    playerShoot(row, col) {
        const cell = this.gameState.aiBoard[row][col];
        
        if (cell.isHit) {
            this.showMessage('Vous avez déjà tiré ici!', 'warning');
            return;
        }
        
        cell.isHit = true;
        this.gameState.shots.player++;
        
        if (cell.hasShip) {
            this.gameState.hits.player++;
            this.showMessage('Touché!', 'success');
            
            // Vérifier si le navire est coulé
            const ship = this.gameState.aiShips.find(s => s.id === cell.shipId);
            ship.hits++;
            
            if (ship.hits === ship.positions.length) {
                ship.sunk = true;
                this.showMessage(`${this.ships[ship.type].name} coulé!`, 'success');
                
                // Marquer toutes les cases du navire comme coulées
                ship.positions.forEach(pos => {
                    this.gameState.aiBoard[pos.row][pos.col].sunk = true;
                });
            }
        } else {
            this.showMessage('Raté!', 'error');
        }
        
        this.updateEnemyBoard();
        this.updateDisplay();
        
        // Vérifier la victoire
        if (this.checkVictory()) return;
        
        // Tour de l'IA
        this.gameState.currentTurn = 'ai';
        setTimeout(() => this.aiTurn(), 1500);
    }

    aiTurn() {
        if (this.gameState.phase !== 'battle' || this.gameState.currentTurn !== 'ai') return;
        
        const shot = this.getAIShot();
        const cell = this.gameState.playerBoard[shot.row][shot.col];
        
        cell.isHit = true;
        this.gameState.shots.ai++;
        
        if (cell.hasShip) {
            this.gameState.hits.ai++;
            this.showMessage('L\'ennemi vous a touché!', 'warning');
            
            const ship = this.gameState.playerShips.find(s => s.id === cell.shipId);
            ship.hits++;
            
            if (ship.hits === ship.positions.length) {
                ship.sunk = true;
                this.showMessage(`Votre ${this.ships[ship.type].name} a été coulé!`, 'error');
                
                ship.positions.forEach(pos => {
                    this.gameState.playerBoard[pos.row][pos.col].sunk = true;
                });
            }
        } else {
            this.showMessage('L\'ennemi a raté!', 'info');
        }
        
        this.updatePlayerBoard();
        this.updateDisplay();
        
        if (this.checkVictory()) return;
        
        this.gameState.currentTurn = 'player';
    }

    getAIShot() {
        // IA simple : tir aléatoire sur les cases non touchées
        const availableCells = [];
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (!this.gameState.playerBoard[row][col].isHit) {
                    availableCells.push({ row, col });
                }
            }
        }
        
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    checkVictory() {
        const playerShipsSunk = this.gameState.playerShips.filter(s => s.sunk).length;
        const aiShipsSunk = this.gameState.aiShips.filter(s => s.sunk).length;
        
        if (aiShipsSunk === this.ships.length) {
            this.endGame('player');
            return true;
        } else if (playerShipsSunk === this.ships.length) {
            this.endGame('ai');
            return true;
        }
        
        return false;
    }

    endGame(winner) {
        this.gameState.phase = 'ended';
        
        const isPlayerWin = winner === 'player';
        this.gameOverTitle.textContent = isPlayerWin ? '🎉 Victoire!' : '💀 Défaite!';
        
        const playerAccuracy = this.gameState.shots.player > 0 ? 
            Math.round((this.gameState.hits.player / this.gameState.shots.player) * 100) : 0;
        
        this.gameOverStats.innerHTML = `
            <div class="stat-row">
                <span>Résultat:</span>
                <span>${isPlayerWin ? 'Victoire' : 'Défaite'}</span>
            </div>
            <div class="stat-row">
                <span>Tirs effectués:</span>
                <span>${this.gameState.shots.player}</span>
            </div>
            <div class="stat-row">
                <span>Tirs réussis:</span>
                <span>${this.gameState.hits.player}</span>
            </div>
            <div class="stat-row">
                <span>Précision:</span>
                <span>${playerAccuracy}%</span>
            </div>
            <div class="stat-row">
                <span>Navires coulés:</span>
                <span>${this.gameState.aiShips.filter(s => s.sunk).length}/${this.ships.length}</span>
            </div>
        `;
        
        this.showModal();
        this.updateDisplay();
    }

    updatePlayerBoard() {
        this.gameState.playerBoard.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = this.playerBoardEl.children[rowIndex * 10 + colIndex];
                
                cellElement.className = 'cell';
                
                if (cell.sunk) {
                    cellElement.classList.add('sunk');
                } else if (cell.isHit && cell.hasShip) {
                    cellElement.classList.add('hit');
                } else if (cell.isHit) {
                    cellElement.classList.add('miss');
                } else if (cell.hasShip) {
                    cellElement.classList.add('ship');
                }
            });
        });
    }

    updateEnemyBoard() {
        this.gameState.aiBoard.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = this.enemyBoardEl.children[rowIndex * 10 + colIndex];
                
                cellElement.className = 'cell';
                
                if (cell.sunk) {
                    cellElement.classList.add('sunk');
                } else if (cell.isHit && cell.hasShip) {
                    cellElement.classList.add('hit');
                } else if (cell.isHit) {
                    cellElement.classList.add('miss');
                }
                // Ne pas montrer les navires ennemis non touchés
            });
        });
    }

    updateDisplay() {
        // Phase du jeu
        const phaseText = {
            'placement': 'Placement des navires',
            'battle': 'Bataille en cours',
            'ended': 'Partie terminée'
        };
        this.gamePhaseEl.textContent = phaseText[this.gameState.phase];
        
        // Tour actuel
        const turnText = this.gameState.currentTurn === 'player' ? 'Joueur' : 'Ordinateur';
        this.currentTurnEl.textContent = turnText;
        
        // Statistiques
        this.shotCountEl.textContent = this.gameState.shots.player;
        const accuracy = this.gameState.shots.player > 0 ? 
            Math.round((this.gameState.hits.player / this.gameState.shots.player) * 100) : 0;
        this.accuracyEl.textContent = `${accuracy}%`;
        
        // Navires restants
        const playerShipsLeft = this.gameState.playerShips.filter(s => !s.sunk).length;
        const aiShipsLeft = this.gameState.aiShips.filter(s => !s.sunk).length;
        this.playerShipsLeftEl.textContent = playerShipsLeft;
        this.aiShipsLeftEl.textContent = aiShipsLeft;
    }

    newGame() {
        this.gameState = {
            phase: 'placement',
            currentTurn: 'player',
            playerBoard: this.createEmptyBoard(),
            aiBoard: this.createEmptyBoard(),
            playerShips: [],
            aiShips: [],
            selectedShip: null,
            shipOrientation: 'horizontal',
            shots: { player: 0, ai: 0 },
            hits: { player: 0, ai: 0 }
        };
        
        this.createBoards();
        this.createShipsList();
        this.startBtn.disabled = true;
        this.closeModal();
        this.updateDisplay();
        this.showMessage('Nouvelle partie! Placez vos navires.', 'info');
    }

    saveGame() {
        try {
            const saveData = {
                gameState: this.gameState,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('battleshipGame', JSON.stringify(saveData));
            this.showMessage('Partie sauvegardée!', 'success');
        } catch (error) {
            this.showMessage('Erreur lors de la sauvegarde', 'error');
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem('battleshipGame');
            if (!saveData) {
                this.showMessage('Aucune partie sauvegardée trouvée', 'error');
                return;
            }
            
            const data = JSON.parse(saveData);
            this.gameState = data.gameState;
            
            this.createBoards();
            this.createShipsList();
            this.markPlacedShips();
            this.updatePlayerBoard();
            this.updateEnemyBoard();
            this.updateDisplay();
            
            this.showMessage('Partie chargée!', 'success');
        } catch (error) {
            this.showMessage('Erreur lors du chargement', 'error');
        }
    }

    markPlacedShips() {
        this.gameState.playerShips.forEach(ship => {
            const shipElement = document.querySelector(`[data-ship-index="${ship.type}"]`);
            if (shipElement) {
                shipElement.classList.add('placed');
            }
        });
        
        if (this.gameState.playerShips.length === this.ships.length) {
            this.startBtn.disabled = false;
        }
    }

    showMessage(text, type = 'info') {
        this.messageEl.textContent = text;
        this.messageEl.className = `message ${type} show`;
        
        setTimeout(() => {
            this.messageEl.classList.remove('show');
        }, 3000);
    }

    showModal() {
        this.gameOverModal.classList.add('show');
    }

    closeModal() {
        this.gameOverModal.classList.remove('show');
    }
}

// Initialiser le jeu
document.addEventListener('DOMContentLoaded', () => {
    new BattleshipGame();
});
