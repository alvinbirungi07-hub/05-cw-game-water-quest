const GOAL_CANS = 20;
const GAME_TIME = 30;
let currentCans = 0;
let timeLeft = GAME_TIME;
let gameActive = false;
let spawnInterval;
let timerInterval;
let confettiTimeout;

const winningMessages = [
  'Amazing work! Clean water is within reach.',
  'You did it! Every can helped make an impact.',
  'Quest complete! That was a powerful splash.'
];

const losingMessages = [
  'Nice try! Every tap makes a difference.',
  'The quest continues. Ready for another round?',
  'Keep going! You were closer than you think.'
];

const currentCansElement = document.getElementById('current-cans');
const timerElement = document.getElementById('timer');
const achievementElement = document.getElementById('achievements');
const startButton = document.getElementById('start-game');
const resetButton = document.getElementById('reset-game');
const confettiElement = document.getElementById('confetti');

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

function spawnWaterCan() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));
  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  const can = document.createElement('button');
  can.type = 'button';
  if (Math.random() < 0.25) {
    can.className = 'obstacle';
    can.textContent = 'MUD';
    can.setAttribute('aria-label', 'Avoid mud, lose one point');
    can.addEventListener('click', hitObstacle);
  } else {
    can.className = 'water-can';
    can.setAttribute('aria-label', 'Collect water can');
    can.addEventListener('click', collectWaterCan);
  }
  randomCell.appendChild(can);
}

function updateScore(animationClass = 'score-bump') {
  currentCansElement.textContent = currentCans;
  currentCansElement.classList.remove('score-bump', 'penalty-bump');
  void currentCansElement.offsetWidth;
  currentCansElement.classList.add(animationClass);
}

function collectWaterCan(event) {
  if (!gameActive) return;
  currentCans += 1;
  updateScore();
  event.currentTarget.closest('.grid-cell').classList.add('collected');
  event.currentTarget.remove();
  if (currentCans >= GOAL_CANS) endGame();
}

function hitObstacle(event) {
  if (!gameActive) return;
  currentCans = Math.max(0, currentCans - 1);
  updateScore('penalty-bump');
  achievementElement.textContent = 'Mud splash! -1 point.';
  event.currentTarget.closest('.grid-cell').classList.add('penalized');
  event.currentTarget.remove();
}

function updateTimer() {
  timerElement.textContent = timeLeft;
  timerElement.classList.toggle('urgent', timeLeft <= 10);
}

function startGame() {
  if (gameActive) return;
  clearConfetti();
  currentCans = 0;
  timeLeft = GAME_TIME;
  gameActive = true;
  currentCansElement.textContent = currentCans;
  achievementElement.textContent = 'Find a can!';
  startButton.textContent = 'Game in progress';
  startButton.disabled = true;
  updateTimer();
  createGrid();
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, 1000);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (!gameActive) return;
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));
  const messages = currentCans >= GOAL_CANS ? winningMessages : losingMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];
  achievementElement.textContent = `${message} Score: ${currentCans}.`;
  startButton.disabled = false;
  startButton.textContent = currentCans >= GOAL_CANS ? 'Play again' : 'Try again';
  if (currentCans >= GOAL_CANS) showConfetti();
}

function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearConfetti();
  currentCans = 0;
  timeLeft = GAME_TIME;
  currentCansElement.textContent = currentCans;
  updateTimer();
  achievementElement.textContent = 'Ready for another mission.';
  startButton.disabled = false;
  startButton.textContent = 'Start game';
  createGrid();
}

function showConfetti() {
  clearConfetti();
  const colors = ['#ffc907', '#2e9df7', '#4fcb53', '#ff902a', '#f16061'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--confetti-color', colors[i % colors.length]);
    piece.style.setProperty('--confetti-x', `${Math.random() * 100}%`);
    piece.style.setProperty('--confetti-delay', `${Math.random() * 0.35}s`);
    piece.style.setProperty('--confetti-rotation', `${Math.random() * 360}deg`);
    confettiElement.appendChild(piece);
  }
  confettiTimeout = setTimeout(clearConfetti, 2800);
}

function clearConfetti() {
  clearTimeout(confettiTimeout);
  confettiElement.innerHTML = '';
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
