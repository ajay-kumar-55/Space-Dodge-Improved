// Get references to HTML elements
const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");
const pauseMenuEl = document.getElementById("pauseMenu");
const pauseBtnEl = document.getElementById("pauseBtn");
const leftZone = document.getElementById("leftZone");
const rightZone = document.getElementById("rightZone");
const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

// Get actual screen dimensions
let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;

// Game state variables
let playerPos = 1; // Player position: 0=left, 1=center, 2=right
let obstacles = []; // Array to store asteroids
let stars = []; // Array to store stars
let gameRunning = false; // Game starts as NOT running (waiting for play button)
let gamePaused = false; // Is game paused?
let score = 0; // Player score
let selectedDifficulty = "easy"; // Default difficulty

// Difficulty settings
const difficultySettings = {
  easy: {
    moveSpeed: 4, // Slow speed
    spawnRate: 70, // Spawn asteroid every 70 frames
    starSpeedMultiplier: 1, // Normal star speed
    name: "EASY",
  },
  medium: {
    moveSpeed: 6, // Medium speed
    spawnRate: 45, // Spawn asteroid every 45 frames (more asteroids)
    starSpeedMultiplier: 1.5, // 1.5x star speed
    name: "MEDIUM",
  },
  hard: {
    moveSpeed: 9, // Fast speed
    spawnRate: 30, // Spawn asteroid every 30 frames (lots of asteroids!)
    starSpeedMultiplier: 2.2, // 2.2x star speed
    name: "HARD",
  },
};

// Calculate game parameters based on screen size
const laneWidth = gameWidth / 3; // Divide screen into 3 equal lanes
const lanes = [
  laneWidth / 2, // Left lane center
  gameWidth / 2, // Middle lane center
  gameWidth - laneWidth / 2, // Right lane center
];

const obstacleSize = 50; // Fixed size for asteroids
const playerSize = 40; // Fixed size for player
const playerBottom = gameHeight - 100; // Player Y position (100px from bottom)

// Get current difficulty settings
let currentSettings = difficultySettings[selectedDifficulty];
let moveSpeed = currentSettings.moveSpeed;
let spawnRate = currentSettings.spawnRate;
let starSpeedMultiplier = currentSettings.starSpeedMultiplier;

// Position player initially
player.style.left = lanes[playerPos] - 20 + "px"; // Center the triangle
player.style.top = playerBottom + "px";

// Create stars in background
function createStar() {
  const star = document.createElement("div");
  star.className = "star";
  const size = Math.random() * 2 + 1; // Random size 1-3px
  star.style.width = size + "px";
  star.style.height = size + "px";
  star.style.left = Math.random() * gameWidth + "px";
  const startY = Math.random() * gameHeight - gameHeight;
  star.style.top = startY + "px";
  star.style.opacity = Math.random() * 0.5 + 0.5; // Random brightness
  game.appendChild(star);
  // Store star with base speed (will be multiplied by difficulty)
  stars.push({
    element: star,
    y: startY,
    baseSpeed: Math.random() * 2 + 1,
  });
}

// Initialize stars across the screen
function initStars() {
  const starCount = 150; // Fixed number of stars
  for (let i = 0; i < starCount; i++) {
    createStar();
  }
  // Spread initial stars across screen
  stars.forEach((star) => {
    star.y = Math.random() * gameHeight;
    star.element.style.top = star.y + "px";
  });
}

// Create an asteroid obstacle
function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.className = "obstacle";
  obstacle.style.width = obstacleSize + "px";
  obstacle.style.height = obstacleSize + "px";

  const randomLane = Math.floor(Math.random() * 3); // Pick random lane
  obstacle.style.left = lanes[randomLane] - obstacleSize / 2 + "px"; // Center in lane
  obstacle.style.top = -obstacleSize + "px"; // Start above screen
  obstacle.style.transform = "rotate(" + Math.random() * 360 + "deg)"; // Random rotation

  game.appendChild(obstacle);
  obstacles.push({
    element: obstacle,
    y: -obstacleSize,
    lane: randomLane,
  });
}

// Check collision between player and asteroids
function checkCollision() {
  obstacles.forEach((obs) => {
    // Calculate distance between player and asteroid
    const obsCenter = lanes[obs.lane];
    const playerCenter = lanes[playerPos];
    const horizontalDist = Math.abs(obsCenter - playerCenter);
    const verticalDist = Math.abs(obs.y - playerBottom);

    // If in same lane and overlapping vertically
    if (horizontalDist < 30 && verticalDist < 50) {
      gameRunning = false;
      finalScoreEl.textContent = score; // Show final score
      gameOverEl.style.display = "block";
    }
  });
}

// Difficulty button selection
difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Remove selected class from all buttons
    difficultyButtons.forEach((b) => b.classList.remove("selected"));
    // Add selected class to clicked button
    this.classList.add("selected");
    // Update selected difficulty
    selectedDifficulty = this.getAttribute("data-difficulty");
  });

  btn.addEventListener("touchstart", function (e) {
    e.preventDefault();
    // Remove selected class from all buttons
    difficultyButtons.forEach((b) => b.classList.remove("selected"));
    // Add selected class to clicked button
    this.classList.add("selected");
    // Update selected difficulty
    selectedDifficulty = this.getAttribute("data-difficulty");
  });
});

// Start the game when play button is clicked
function startGame() {
  // Apply difficulty settings
  currentSettings = difficultySettings[selectedDifficulty];
  moveSpeed = currentSettings.moveSpeed;
  spawnRate = currentSettings.spawnRate;
  starSpeedMultiplier = currentSettings.starSpeedMultiplier;

  startScreen.style.display = "none"; // Hide start screen
  gameRunning = true; // Set game as running
  update(); // Start the game loop
}

// Play button click handler
playButton.addEventListener("click", startGame);
playButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startGame();
});

// Restart game - go back to main menu
function restartGame() {
  // Reset all game variables
  playerPos = 1;
  score = 0;
  gameRunning = false;
  gamePaused = false;
  frameCount = 0;

  // Clear all obstacles
  obstacles.forEach((obs) => obs.element.remove());
  obstacles = [];

  // Reset player position
  player.style.left = lanes[playerPos] - 20 + "px";

  // Update score display
  scoreEl.textContent = "Score: 0";

  // Hide game over screen
  gameOverEl.style.display = "none";

  // Show start screen again
  startScreen.style.display = "flex";
}

// Restart button handlers
restartButton.addEventListener("click", restartGame);
restartButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  restartGame();
});

// Toggle pause
function togglePause() {
  if (!gameRunning) return; // Can't pause if game over

  gamePaused = !gamePaused;

  if (gamePaused) {
    pauseMenuEl.style.display = "block";
    pauseBtnEl.textContent = "▶ RESUME";
  } else {
    pauseMenuEl.style.display = "none";
    pauseBtnEl.textContent = "⏸ PAUSE";
    update(); // Resume game loop
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  // Pause with P key
  if (e.key === "p" || e.key === "P") {
    togglePause();
    return;
  }

  // Don't move if game over or paused
  if (!gameRunning || gamePaused) return;

  // Move left
  if (e.key === "ArrowLeft" && playerPos > 0) {
    playerPos--;
    player.style.left = lanes[playerPos] - 20 + "px";
  }
  // Move right
  else if (e.key === "ArrowRight" && playerPos < 2) {
    playerPos++;
    player.style.left = lanes[playerPos] - 20 + "px";
  }
});

// Touch controls for mobile
leftZone.addEventListener("touchstart", (e) => {
  e.preventDefault();

  // Resume if paused
  if (gamePaused) {
    togglePause();
    return;
  }

  // Don't move if game over
  if (!gameRunning) return;

  // Move left
  if (playerPos > 0) {
    playerPos--;
    player.style.left = lanes[playerPos] - 20 + "px";
  }
});

rightZone.addEventListener("touchstart", (e) => {
  e.preventDefault();

  // Resume if paused
  if (gamePaused) {
    togglePause();
    return;
  }

  // Don't move if game over
  if (!gameRunning) return;

  // Move right
  if (playerPos < 2) {
    playerPos++;
    player.style.left = lanes[playerPos] - 20 + "px";
  }
});

// Pause button handlers
pauseBtnEl.addEventListener("click", togglePause);
pauseBtnEl.addEventListener("touchstart", (e) => {
  e.preventDefault();
  togglePause();
});

// Main game loop
let frameCount = 0;
function update() {
  // Stop if game over or paused
  if (!gameRunning || gamePaused) return;

  frameCount++;

  // Spawn asteroid based on difficulty spawn rate
  if (frameCount % spawnRate === 0) {
    createObstacle();
  }

  // Move stars down (speed affected by difficulty)
  stars.forEach((star) => {
    star.y += star.baseSpeed * starSpeedMultiplier; // Apply difficulty multiplier
    star.element.style.top = star.y + "px";

    // Reset star to top when it goes off screen
    if (star.y > gameHeight + 10) {
      star.y = -10;
      star.element.style.left = Math.random() * gameWidth + "px";
    }
  });

  // Move asteroids down
  obstacles.forEach((obs, index) => {
    obs.y += moveSpeed;
    obs.element.style.top = obs.y + "px";

    // Remove asteroid if it goes off screen
    if (obs.y > gameHeight + obstacleSize) {
      obs.element.remove();
      obstacles.splice(index, 1);
      score++; // Increase score
      scoreEl.textContent = "Score: " + score;
    }
  });

  // Check for collisions
  checkCollision();

  // Continue loop
  requestAnimationFrame(update);
}

// Start the game (initialize but don't start loop yet)
initStars(); // Create stars in background
// Game loop will start when play button is clicked
