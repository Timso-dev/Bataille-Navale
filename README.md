# 🚢 Bataille Navale

Un jeu de bataille navale (touché-coulé) complet en JavaScript, déployable sur GitHub Pages. Interface moderne avec IA intégrée et fonctionnalités avancées.

## 🎮 Aperçu du jeu

![Bataille Navale](https://img.shields.io/badge/Game-Bataille%20Navale-blue?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**🚀 [Jouer maintenant](https://Timso-dev.github.io/bataille-navale/)**

## 📋 Règles du jeu

### 🎯 **Objectif**
Coulez tous les navires ennemis avant que l'ordinateur ne coule les vôtres !

### 🚢 **Flotte disponible**
- **1 Porte-avions** 🛩️ (5 cases)
- **1 Cuirassé** 🚢 (4 cases)  
- **1 Croiseur** ⛵ (3 cases)
- **1 Sous-marin** 🔱 (3 cases)
- **1 Destroyer** 🚤 (2 cases)

### 🎮 **Déroulement**

#### **Phase 1 : Placement**
1. Sélectionnez un navire dans la liste
2. Cliquez sur la grille pour le placer
3. Utilisez 'R' ou le bouton rotation pour changer l'orientation
4. Option placement aléatoire disponible

#### **Phase 2 : Bataille**
1. Cliquez sur la grille ennemie pour tirer
2. 🎯 **Touché** : case rouge avec explosion
3. 💧 **Raté** : case grise avec éclaboussure  
4. ☠️ **Coulé** : navire entier marqué
5. Alternance joueur/IA jusqu'à victoire

### 🏆 **Victoire**
Premier à couler tous les navires adverses !

## ✨ Fonctionnalités

### 🎨 **Interface utilisateur**
- **Design moderne** avec thème naval
- **Grilles 10×10** avec coordonnées A-J / 1-10
- **Feedback visuel** complet (explosions, éclaboussures)
- **Interface responsive** mobile/desktop
- **Animations fluides** pour toutes les interactions

### 🧠 **Gameplay intelligent**
- **Placement automatique** des navires IA
- **Validation des règles** (pas de navires adjacents)
- **Détection automatique** des navires coulés
- **Statistiques en temps réel** (précision, navires restants)
- **Système de tours** alterné

### 💾 **Fonctionnalités avancées**
- **Sauvegarde/Chargement** de partie (localStorage)
- **Placement aléatoire** des navires
- **Rotation** des navires (touche R)
- **Effacement** rapide du plateau
- **Modal de fin** avec statistiques détaillées

## 🏗️ Structure du projet

```
bataille-navale/
├── index.html          # Interface utilisateur complète
├── style.css           # Design responsive et animations  
├── script.js           # Logique de jeu et IA
└── README.md           # Documentation
```

## 🛠️ Technologies utilisées

- **HTML5** : Structure sémantique et accessibilité
- **CSS3** : Grid layout, animations, responsive design
- **JavaScript ES6+** : Classes, modules, async/await
- **LocalStorage** : Persistance des données
- **CSS Grid** : Disposition des grilles de jeu
- **GitHub Pages** : Hébergement gratuit

## 🚀 Installation et déploiement

### **Déploiement GitHub Pages**

1. **Créer un dépôt**
   ```bash
   # Sur GitHub, créez un dépôt nommé "bataille-navale"
   ```

2. **Cloner et ajouter les fichiers**
   ```bash
   git clone https://github.com/Timso-dev/bataille-navale.git
   cd bataille-navale
   
   # Ajoutez les 3 fichiers : index.html, style.css, script.js
   git add .
   git commit -m "Ajout du jeu de bataille navale"
   git push origin main
   ```

3. **Activer GitHub Pages**
   - Aller dans Settings → Pages
   - Source : "Deploy from a branch"
   - Branch : `main` → Folder : `/ (root)`
   - Sauvegarder

4. **Accéder au jeu**
   - URL : `https://Timso-dev.github.io/bataille-navale/`
   - Le déploiement prend 2-10 minutes

### **Test en local**

```bash
# Télécharger le projet
git clone https://github.com/Timso-dev/bataille-navale.git
cd bataille-navale

# Serveur local (optionnel)
python -m http.server 8000
# ou
npx serve

# Ouvrir index.html dans le navigateur
```

## 🎯 Architecture technique

### **Classe principale : BattleshipGame**

```javascript
class BattleshipGame {
    constructor() {
        this.ships = []; // Configuration des navires
        this.gameState = {
            phase: 'placement',      // État du jeu
            playerBoard: [],         // Grille joueur 10x10
            aiBoard: [],            // Grille IA 10x10
            currentTurn: 'player',   // Tour actuel
            selectedShip: null,      // Navire sélectionné
            shipOrientation: 'horizontal'
        };
    }
}
```

### **Structure de données**

#### **Plateau de jeu**
```javascript
// Chaque case contient :
{
    hasShip: false,     // Présence d'un navire
    isHit: false,       // Case touchée
    shipId: null,       // ID du navire
    shipPart: null      // Partie du navire (0-4)
}
```

#### **Navires**
```javascript
{
    id: 'player_ship_0_0',    // Identifiant unique
    type: 0,                   // Index du type de navire
    positions: [{row, col}],   // Positions occupées
    hits: 0,                   // Nombre de touches
    sunk: false               // Navire coulé
}
```

### **Algorithmes clés**

#### **Placement des navires**
```javascript
isValidPlacement(positions) {
    return positions.every(pos => {
        // Vérifier limites du plateau
        if (pos.row < 0 || pos.row >= 10) return false;
        
        // Vérifier absence de navire
        if (this.gameState.playerBoard[pos.row][pos.col].hasShip) 
            return false;
        
        // Vérifier pas de navires adjacents
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                // Logique d'adjacence...
            }
        }
        
        return true;
    });
}
```

#### **Intelligence artificielle**
```javascript
getAIShot() {
    // IA simple : tir aléatoire intelligent
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
```

#### **Détection de victoire**
```javascript
checkVictory() {
    const playerShipsSunk = this.gameState.playerShips.filter(s => s.sunk).length;
    const aiShipsSunk = this.gameState.aiShips.filter(s => s.sunk).length;
    
    return aiShipsSunk === this.ships.length || 
           playerShipsSunk === this.ships.length;
}
```

## 🎨 Design et UX

### **Système de couleurs**
- **🌊 Eau** : Bleu ciel (#87CEEB)
- **🚢 Navire** : Bleu marine (#2a5298)  
- **🎯 Touché** : Rouge (#dc3545) + 💥
- **💧 Raté** : Gris (#6c757d) + 💧
- **☠️ Coulé** : Noir (#343a40) + ☠️

### **Animations CSS**
```css
@keyframes firing {
    0% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(0.9); }
    75% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.cell.firing {
    animation: firing 0.6s ease;
}
```

### **Responsive design**
- **Desktop** : Grilles côte à côte
- **Tablet** : Grilles empilées  
- **Mobile** : Interface optimisée tactile

## 📊 Fonctionnalités avancées

### **Statistiques de jeu**
- Nombre de tirs effectués
- Précision de tir (pourcentage)
- Navires coulés vs total
- Temps de partie (future version)

### **Sauvegarde intelligente**
```javascript
saveGame() {
    const saveData = {
        gameState: this.gameState,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    localStorage.setItem('battleshipGame', JSON.stringify(saveData));
}
```

### **Contrôles clavier**
- **R** : Rotation des navires
- **Échap** : Annuler sélection
- **Espace** : Placement aléatoire

## 🔧 Personnalisation

### **Modifier la flotte**
```javascript
this.ships = [
    { name: 'Nouveau navire', size: 6, icon: '🛳️', count: 1 },
    // Ajoutez vos navires personnalisés
];
```

### **Changer la taille du plateau**
```javascript
// Dans createEmptyBoard()
return Array(12).fill().map(() => Array(12).fill({
    // Plateau 12x12 au lieu de 10x10
}));
```

### **IA plus intelligente**
```javascript
getAIShot() {
    // Implémenter algorithme de recherche
    // - Mode "chasse" : tir aléatoire
    // - Mode "destruction" : cibler navire touché
    // - Probabilités basées sur taille des navires
}
```

## 🐛 Debug et développement

### **Mode debug**
```javascript
// Dans la console navigateur
game.gameState.aiBoard.forEach(row => {
    console.log(row.map(cell => cell.hasShip ? 'S' : '~').join(''));
});
```

### **Tests automatisés**
```javascript
function testShipPlacement() {
    const game = new BattleshipGame();
    const positions = [{row: 0, col: 0}, {row: 0, col: 1}];
    console.assert(game.isValidPlacement(positions), 'Placement valide');
}
```

## 🚀 Améliorations futures

### **Version 2.0**
- [ ] **Multijoueur en ligne** (WebSockets)
- [ ] **Modes de difficulté** IA
- [ ] **Thèmes visuels** (pirate, futuriste, etc.)
- [ ] **Sons et effets** audio
- [ ] **Animations 3D** avec CSS transforms

### **Version 2.1**
- [ ] **Parties classées** avec système ELO
- [ ] **Replay des parties** 
- [ ] **Tournois automatisés**
- [ ] **Chat en temps réel**
- [ ] **Statistiques globales**

### **Version 2.2**
- [ ] **Variantes de jeu** (navires spéciaux, mines)
- [ ] **Éditeur de flottes** personnalisées
- [ ] **Mode campagne** solo
- [ ] **Défis quotidiens**
- [ ] **Leaderboards mondiaux**

## 📱 Compatibilité

### **Navigateurs supportés**
- ✅ Chrome 70+
- ✅ Firefox 65+  
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Safari iOS 12+
- ✅ Chrome Android 70+

### **Fonctionnalités requises**
- JavaScript ES6+ (classes, arrow functions)
- CSS Grid Layout
- LocalStorage API
- Flexbox

## 🤝 Contributions

Les contributions sont les bienvenues !

### **Comment contribuer**
1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/amelioration`)
3. **Commiter** (`git commit -m 'Ajout fonctionnalité X'`)
4. **Pousser** (`git push origin feature/amelioration`)
5. **Ouvrir** une Pull Request

### **Types de contributions**
- 🐛 **Corrections de bugs**
- ✨ **Nouvelles fonctionnalités**  
- 📚 **Amélioration documentation**
- 🎨 **Améliorations UI/UX**
- ⚡ **Optimisations performance**

### **Standards de code**
- Code ES6+ moderne
- Commentaires JSDoc
- Noms de variables explicites
- Fonctions < 50 lignes
- Tests unitaires pour logique critique

## 📜 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

### **Utilisation libre**
- ✅ Usage commercial
- ✅ Modification du code  
- ✅ Distribution
- ✅ Usage privé

## 🎓 Contexte pédagogique

Projet idéal pour apprendre :

### **Concepts JavaScript**
- **Programmation orientée objet** (classes, encapsulation)
- **Manipulation DOM** avancée
- **Gestion d'événements** complexes  
- **Algorithmes de jeu** (placement, IA)
- **Persistance de données** (localStorage)

### **Concepts CSS**
- **CSS Grid** pour layouts complexes
- **Animations et transitions**
- **Design responsive** multi-device
- **Variables CSS** et thèmes
- **Pseudo-éléments** pour effets visuels

### **Architecture logicielle**
- **Séparation des responsabilités**
- **Gestion d'état** centralisée
- **Modularité** et réutilisabilité
- **Debugging** et tests
- **Déploiement** web moderne

## 📞 Support

- **Documentation** : Ce README
- **Issues** : [Signaler un problème](https://github.com/Timso-dev/bataille-navale/issues)
- **Discussions** : [Forum communautaire](https://github.com/Timso-dev/bataille-navale/discussions)

## 🏆 Crédits

- **Développement** : Votre nom
- **Design** : Inspiré des jeux classiques de bataille navale
- **Icônes** : Emojis standards Unicode
- **Inspiration** : Jeux Hasbro et versions numériques

---

**⭐ Mettez une étoile si vous avez aimé ce projet !**

*Bon amusement et que le meilleur stratège gagne !* ⚓
