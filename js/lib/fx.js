// Canvas confetti burst for a flawless run. Adapted from the fireworks in the
// source flashcards repo (credited in the README), retimed and recoloured to
// the Brazilian palette.

function launchFireworks() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'fireworks-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#009c3b', '#ffdf00', '#ffffff', '#4f8ef7', '#2ec25f'];
  const particles = [];
  let bursts = 0;

  function burst(x, y) {
    const n = 34 + Math.floor(Math.random() * 18);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.3;
      const speed = 2 + Math.random() * 3.6;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.012,
        size: 1.6 + Math.random() * 2.2,
        color: Math.random() < 0.25 ? COLORS[Math.floor(Math.random() * COLORS.length)] : color
      });
    }
  }

  function scheduleBurst() {
    if (bursts >= 6) return;
    bursts++;
    burst(W * (0.2 + Math.random() * 0.6), H * (0.18 + Math.random() * 0.4));
    setTimeout(scheduleBurst, 260 + Math.random() * 320);
  }
  scheduleBurst();

  let raf = 0;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx *= 0.99;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (particles.length || bursts < 6) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  }
  frame();
}

/* The one toast (the #toast pill in every shell). Lives here, not in daily.js,
   because every page loads fx.js — the /ingles/ and /noruegues/ shells have no
   Daily tab, and until 1.18 their sync toasts silently went nowhere. */
let _toastTimer = 0;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}
