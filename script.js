/**
 * AIM ARCADE — Tic Tac Toe game controller.
 * The game is intentionally dependency-free; it runs by opening index.html.
 */

// ----- DOM references ------------------------------------------------------
const cells = [...document.querySelectorAll('.cell')];
const status = document.querySelector('#status');
const roundLabel = document.querySelector('#roundLabel');
const xScoreEl = document.querySelector('#xScore');
const oScoreEl = document.querySelector('#oScore');
const newRound = document.querySelector('#newRound');
const resetScores = document.querySelector('#resetScores');
const modeButtons = [...document.querySelectorAll('.mode-button')];
const opponentKey = document.querySelector('#opponentKey');
const oLabel = document.querySelector('#oLabel');
const xKey = document.querySelector('#xKey');
const xLabel = document.querySelector('#xLabel');
const welcomeOverlay = document.querySelector('#welcomeOverlay');
const playerForm = document.querySelector('#playerForm');
const xNameInput = document.querySelector('#xNameInput');
const oNameInput = document.querySelector('#oNameInput');
const oNameField = document.querySelector('#oNameField');
const setupModeButtons = [...document.querySelectorAll('.setup-mode-button')];
const editPlayers = document.querySelector('#editPlayers');
const victoryOverlay = document.querySelector('#victoryOverlay');
const winnerName = document.querySelector('#winnerName');
const nextRound = document.querySelector('#nextRound');

// Every possible row, column, and diagonal that can win a round.
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
const storageKey = 'aim-arcade-player-setup';

// ----- Match state ---------------------------------------------------------
let current = 'X';
let board = Array(9).fill('');
let scores = { X: 0, O: 0 };
let round = 1;
let locked = false; // Prevents input while the CPU is choosing a move.
let mode = 'solo';
let names = { X: 'PLAYER X', O: 'CPU O' };

function setStatus(message, won = false) {
  status.classList.toggle('win', won);
  status.querySelector('span:last-child').textContent = message;
}

function getWinningLine(mark) {
  return winningLines.find(line => line.every(index => board[index] === mark));
}

function renderPlayerNames() {
  xKey.textContent = `${names.X.toUpperCase()} X`;
  opponentKey.textContent = names.O.toUpperCase();
  xLabel.textContent = names.X.toUpperCase();
  oLabel.textContent = names.O.toUpperCase();
}

function finishRound(mark, line) {
  locked = true;
  line.forEach(index => cells[index].classList.add('winner'));

  scores[mark] += 1;
  const scoreElement = mark === 'X' ? xScoreEl : oScoreEl;
  scoreElement.textContent = String(scores[mark]).padStart(2, '0');

  setStatus(`${names[mark]} TAKES THE ROUND`, true);
  winnerName.textContent = names[mark].toUpperCase();

  // A short delay lets the winning squares animate before the modal opens.
  window.setTimeout(() => { victoryOverlay.hidden = false; }, 350);
}

function makeMove(index) {
  // Ignore clicks on occupied squares or while the game is paused.
  if (locked || board[index]) return;

  board[index] = current;
  cells[index].textContent = current;
  cells[index].classList.add(current.toLowerCase());
  cells[index].disabled = true;

  const line = getWinningLine(current);
  if (line) return finishRound(current, line);

  if (board.every(Boolean)) {
    locked = true;
    setStatus('DRAW — THE GRID HOLDS', true);
    return;
  }

  current = current === 'X' ? 'O' : 'X';

  // In solo mode the computer always controls O.
  if (mode === 'solo' && current === 'O') {
    locked = true;
    setStatus('CPU IS THINKING…');
    window.setTimeout(() => {
      locked = false;
      makeMove(getComputerMove());
    }, 450);
  } else {
    setStatus(`${names[current]} TURN — PLACE AN ${current}`);
  }
}

function getComputerMove() {
  const openSquares = () => board
    .map((mark, index) => (mark ? null : index))
    .filter(index => index !== null);

  // First win if possible; otherwise block the player's immediate win.
  for (const mark of ['O', 'X']) {
    for (const index of openSquares()) {
      board[index] = mark;
      const isWinningMove = Boolean(getWinningLine(mark));
      board[index] = '';
      if (isWinningMove) return index;
    }
  }

  // Prefer the center, then a corner, then any remaining square.
  if (!board[4]) return 4;
  const open = openSquares();
  const corners = open.filter(index => [0, 2, 6, 8].includes(index));
  const choices = corners.length ? corners : open;
  return choices[Math.floor(Math.random() * choices.length)];
}

function startRound() {
  round += 1;
  current = 'X';
  board = Array(9).fill('');
  locked = false;
  roundLabel.textContent = `ROUND ${String(round).padStart(2, '0')}`;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
    cell.className = 'cell';
  });
  setStatus(`${names.X} TURN — PLACE AN X`);
}

function resetMatch() {
  victoryOverlay.hidden = true;
  scores = { X: 0, O: 0 };
  xScoreEl.textContent = oScoreEl.textContent = '00';
  round = 0;
  startRound();
}

function selectMode(nextMode) {
  mode = nextMode;
  const localMode = mode === 'local';
  names.O = localMode ? 'PLAYER O' : 'CPU O';
  opponentKey.textContent = names.O;
  oLabel.textContent = names.O;
  modeButtons.forEach(button => button.classList.toggle('selected', button.dataset.mode === mode));
  resetMatch();
}

// ----- Game controls -------------------------------------------------------
cells.forEach((cell, index) => cell.addEventListener('click', () => {
  // The CPU owns O, so only it can place O in solo mode.
  if (!(mode === 'solo' && current === 'O')) makeMove(index);
}));

newRound.addEventListener('click', () => {
  victoryOverlay.hidden = true;
  startRound();
});
nextRound.addEventListener('click', () => {
  victoryOverlay.hidden = true;
  startRound();
});
resetScores.addEventListener('click', resetMatch);
modeButtons.forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode)));

// ----- Player setup and saved preferences ---------------------------------
setupModeButtons.forEach(button => button.addEventListener('click', () => {
  const localMode = button.dataset.setupMode === 'local';
  setupModeButtons.forEach(item => item.classList.toggle('selected', item === button));
  oNameField.hidden = !localMode;
  oNameInput.required = localMode;
}));

playerForm.addEventListener('submit', event => {
  event.preventDefault();
  mode = document.querySelector('.setup-mode-button.selected').dataset.setupMode;
  names.X = xNameInput.value.trim() || 'PLAYER X';
  names.O = mode === 'local' ? (oNameInput.value.trim() || 'PLAYER O') : 'CPU O';

  renderPlayerNames();
  modeButtons.forEach(button => button.classList.toggle('selected', button.dataset.mode === mode));
  localStorage.setItem(storageKey, JSON.stringify({ mode, names }));
  welcomeOverlay.classList.add('hidden');
  resetMatch();
});

editPlayers.addEventListener('click', () => {
  xNameInput.value = names.X;
  oNameInput.value = mode === 'local' ? names.O : '';
  setupModeButtons.forEach(button => button.classList.toggle('selected', button.dataset.setupMode === mode));
  oNameField.hidden = mode !== 'local';
  oNameInput.required = mode === 'local';
  welcomeOverlay.classList.remove('hidden');
});

// Restore names/mode after a page refresh. New visitors see the setup modal.
try {
  const savedSetup = JSON.parse(localStorage.getItem(storageKey));
  if (savedSetup?.names?.X && savedSetup?.mode) {
    mode = savedSetup.mode;
    names = savedSetup.names;
    renderPlayerNames();
    modeButtons.forEach(button => button.classList.toggle('selected', button.dataset.mode === mode));
    welcomeOverlay.classList.add('hidden');
    round = 0;
    startRound();
  }
} catch (_) {
  // Ignore malformed browser storage and leave the setup modal visible.
}
