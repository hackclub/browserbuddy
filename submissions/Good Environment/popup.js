let score = 100;

function updateScore() {
  document.getElementById('score').innerText = `Environment Health: ${score}`;
}

function makeGoodChoice() {
  score += 10;
  updateScore();
}

function makeBadChoice() {
  score -= 15;
  updateScore();
}

function resetGame() {
  score = 100;
  updateScore();
}

document.addEventListener('DOMContentLoaded', updateScore);
