// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let gameSpeed = 100; // Initial speed in milliseconds

// Initialize high score display
document.getElementById('highScore').textContent = highScore;

// Event Listeners for keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case ' ':
            e.preventDefault();
            if (gameRunning) pauseGame();
            break;
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('statusText').textContent = 'Game Running...';
        gameLoop = setInterval(update, gameSpeed);
    }
}

function pauseGame() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (gamePaused) {
            clearInterval(gameLoop);
            document.getElementById('statusText').textContent = 'Game Paused - Press PAUSE to Resume';
        } else {
            document.getElementById('statusText').textContent = 'Game Running...';
            gameLoop = setInterval(update, gameSpeed);
        }
    }
}

function resetGame() {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 15 };
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameSpeed = 100; // Reset speed
    gameRunning = false;
    gamePaused = false;
    document.getElementById('score').textContent = '0';
    document.getElementById('statusText').textContent = 'Press START or use arrow keys to play';
    draw();
}

function update() {
    // Update direction
    direction = nextDirection;

    // Calculate new head position
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision - WRAP AROUND instead of ending game
    head.x = (head.x + tileCount) % tileCount;
    head.y = (head.y + tileCount) % tileCount;

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        
        // Increase game speed - decrease interval by 5% for every 50 points
        const speedIncrease = Math.floor(score / 50);
        gameSpeed = Math.max(30, 100 - speedIncrease * 5); // Minimum speed of 30ms
        
        // Restart the game loop with new speed if game is running
        if (gameRunning && !gamePaused) {
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
        
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    draw();
}

function generateFood() {
    let newFood;
    let foodOnSnake;

    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Check if food spawns on snake
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);

    food = newFood;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional)
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - brighter color
            ctx.fillStyle = '#00ff00';
        } else {
            // Body - darker green
            ctx.fillStyle = '#00cc00';
        }
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);

        // Draw eye on head
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = 2;
            if (direction.x === 1) {
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 13, eyeSize, eyeSize);
            } else if (direction.x === -1) {
                ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + 13, eyeSize, eyeSize);
            } else if (direction.y === -1) {
                ctx.fillRect(segment.x * gridSize + 5, segment.y * gridSize + 6, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 13, segment.y * gridSize + 6, eyeSize, eyeSize);
            } else {
                ctx.fillRect(segment.x * gridSize + 5, segment.y * gridSize + 12, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 13, segment.y * gridSize + 12, eyeSize, eyeSize);
            }
        }
    });

    // Draw food
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    // Draw food shine
    ctx.fillStyle = '#ff8888';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2 - 3, food.y * gridSize + gridSize / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();
}

function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    gamePaused = false;

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    document.getElementById('statusText').textContent = `Game Over! Final Score: ${score} 💀`;
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
}

// Initial draw
draw();
