const socket = io('http://localhost:3000');
socket.emit('match:join', { matchId: 'demo-match-1' });

const score = document.getElementById('score');
const clock = document.getElementById('clock');
const alertBox = document.getElementById('alert');

socket.on('score:update', ({ score: liveScore }) => {
  score.textContent = `${liveScore.A} - ${liveScore.B}`;
});

socket.on('timer:update', ({ clock: liveClock }) => {
  const mm = String(Math.floor(liveClock.elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(liveClock.elapsedSeconds % 60).padStart(2, '0');
  clock.textContent = `${mm}:${ss}`;
});

socket.on('match:event:new', (event) => {
  const label = {
    GOAL: '⚽ BUT',
    YELLOW_CARD: '🟨 CARTON JAUNE',
    RED_CARD: '🟥 CARTON ROUGE',
    SUBSTITUTION: '🔁 CHANGEMENT',
    CORNER: '🚩 CORNER'
  }[event.type] || event.type;

  alertBox.textContent = `${label} • ${event.minute}'`;
  alertBox.classList.add('visible');
  window.setTimeout(() => alertBox.classList.remove('visible'), 2200);
});
