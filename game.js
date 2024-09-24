const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player1, player2, powerUp, obstacles = [];
let gameOver = false;
let currentLevel = 1;
let playerType = 'warrior';
let gameStarted = false;
let backgroundImage;

function loadBackgroundImage() {
    return new Promise((resolve, reject) => {
        backgroundImage = new Image();
        backgroundImage.onload = () => resolve(backgroundImage);
        backgroundImage.onerror = reject;
        backgroundImage.src = 'Designer (3).png';
    });
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText('2D Fighting Game', canvas.width / 2 - 180, canvas.height / 2 - 100);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Player Type: ${playerType}`, canvas.width / 2 - 70, canvas.height / 2);
    ctx.fillText(`Press 'T' to toggle player type`, canvas.width / 2 - 120, canvas.height / 2 + 50);
    ctx.fillText(`Press 'Enter' to start game`, canvas.width / 2 - 100, canvas.height / 2 + 100);
}

function gameLoop() {
    if (!gameStarted) {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = 'rgba(0, 100, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    for (let obstacle of obstacles) {
        obstacle.draw(ctx);
    }

    console.log(`Level: ${currentLevel}, Player1 position: x=${player1.x}, y=${player1.y}`);
    console.log(`Obstacles: ${obstacles.map(o => `(${o.x},${o.y},${o.width},${o.height})`).join(', ')}`);
    player1.update(canvas.width, canvas.height);
    console.log(`Player1 updated position: x=${player1.x}, y=${player1.y}`);

    checkObstacleCollision(player1, obstacles);
    checkObstacleCollision(player2, obstacles);

    updateAI(player2, player1, powerUp, obstacles);

    player1.draw(ctx);
    player2.draw(ctx);

    checkCollision(player1, player2);
    checkCollision(player2, player1);

    if (powerUp) {
        powerUp.draw(ctx);
        checkPowerUpCollision(player1, powerUp);
        checkPowerUpCollision(player2, powerUp);
    } else if (Math.random() < 0.001) {
        powerUp = new PowerUp(canvas.width, canvas.height);
    }

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Player 1: ${player1.score}`, 10, 30);
    ctx.fillText(`Player 2: ${player2.score}`, canvas.width - 150, 30);
    ctx.fillText(`Level: ${currentLevel}`, canvas.width / 2 - 30, 30);

    if (player1.health <= 0 || player2.health <= 0) {
        if (currentLevel < 2 && player1.health > 0) {
            currentLevel++;
            startGame();
        } else {
            // Game over logic
        }
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    const groundLevel = canvas.height - 50;
    let player1X, player2X;
    do {
        player1X = 50;
        player2X = canvas.width - 100;
    } while (obstacles.some(obs => 
        (player1X < obs.x + obs.width + 10 && player1X + 50 > obs.x - 10) ||
        (player2X < obs.x + obs.width + 10 && player2X + 50 > obs.x - 10)
    ));

    player1 = createPlayer(player1X, groundLevel - 100, '#3498db', true, playerType);
    player2 = createPlayer(player2X, groundLevel - 100, '#e74c3c', false, 'warrior');
    powerUp = null;
    obstacles = initObstacles(canvas.width, canvas.height, currentLevel) || [];
}

function createPlayer(x, y, color, isHuman, type) {
    return type === 'archer' ? new Archer(x, y, color, isHuman) : new Player(x, y, color, isHuman);
}

function resizeCanvas() {
    const gameContainer = document.getElementById('game-container');
    canvas.width = gameContainer.clientWidth;
    canvas.height = gameContainer.clientHeight;
}

async function initGame() {
    resizeCanvas();
    try {
        await loadBackgroundImage();
    } catch (error) {
        console.error('Failed to load background image:', error);
    }
    startNewGame();
}

function startNewGame() {
    currentLevel = 1;
    gameStarted = false;
    gameOver = false;
    playerType = 'warrior';
    drawStartScreen();
}

function handleKeyDown(e) {
    if (gameOver && e.key === 'r') {
        startNewGame();
        return;
    }

    if (!gameStarted) {
        if (e.key === 't') {
            togglePlayerType();
            drawStartScreen();
        } else if (e.key === 'Enter') {
            startGame();
        }
        return;
    }

    switch (e.key) {
        case 'a': player1.moveLeft(); break;
        case 'd': player1.moveRight(); break;
        case 'w': player1.jump(); break;
        case 's':
            if (player1 instanceof Archer) player1.aim('down');
            else player1.attack();
            break;
        case 'q':
            if (player1 instanceof Archer) player1.aim('up');
            break;
        case ' ':
            if (player1 instanceof Archer) player1.attack();
            else player1.block();
            break;
    }
}

function handleKeyUp(e) {
    if (e.key === 'a' || e.key === 'd') player1.stopMoving();
}

function handleResize() {
    resizeCanvas();
    if (player1 && player2) {
        const groundLevel = canvas.height - 50;
        player1.groundLevel = player2.groundLevel = groundLevel - player1.height;
        player1.y = player2.y = groundLevel - player1.height;
        player2.x = canvas.width - 100;
    }
    obstacles = initObstacles(canvas.width, canvas.height, currentLevel) || [];
    if (!gameStarted) drawStartScreen();
}

function togglePlayerType() {
    playerType = playerType === 'warrior' ? 'archer' : 'warrior';
    document.getElementById('playerType').textContent = `Player Type: ${playerType}`;
}

if (canvas) {
    window.addEventListener('resize', handleResize);
    initGame().then(() => gameLoop());
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('toggleType').addEventListener('click', () => {
        if (!gameStarted) {
            togglePlayerType();
            drawStartScreen();
        }
    });
    document.getElementById('newGame').addEventListener('click', startNewGame);
} else {
    console.error('Canvas element not found');
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        // Wood texture
        const woodColor = '#8B4513'; // SaddleBrown
        ctx.fillStyle = woodColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Wood grain
        ctx.strokeStyle = '#A0522D'; // Sienna
        ctx.lineWidth = 2;
        for (let i = 0; i < this.height; i += 5) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + i);
            ctx.lineTo(this.x + this.width, this.y + i);
            ctx.stroke();
        }

        // Outline
        ctx.strokeStyle = '#4B3621'; // Dark brown
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

function initObstacles(width, height, level) {
    const obstacles = [];
    const numObstacles = level * 3; // Increase obstacles with level
    const groundLevel = height - 50;

    for (let i = 0; i < numObstacles; i++) {
        let x, y, w, h;
        do {
            w = Math.random() * 50 + 30; // Slightly wider obstacles
            h = Math.random() * 100 + 30; // Slightly taller obstacles
            x = Math.random() * (width - w);
            y = groundLevel - h;
        } while (obstacles.some(obs => 
            x < obs.x + obs.width + 30 && 
            x + w + 30 > obs.x && 
            y < obs.y + obs.height + 30 && 
            y + h + 30 > obs.y
        ));

        obstacles.push(new Obstacle(x, y, w, h));
    }

    return obstacles;
}