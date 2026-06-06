// tiny, dependency-free confetti burst
export function confetti({ x = 0.5, y = 0.4, count = 90, power = 1 } = {}) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
  const colors = ["#ff5b00", "#ffa14d", "#ffd24d", "#ffffff", "#ff7a2e"];
  const cx = x * W, cy = y * H;
  const parts = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const sp = (4 + Math.random() * 7) * power;
    return {
      x: cx, y: cy,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (4 + Math.random() * 4) * power,
      g: 0.18 + Math.random() * 0.12, r: 3 + Math.random() * 4,
      c: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
      life: 0, max: 60 + Math.random() * 35,
    };
  });
  let raf;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      p.life++; if (p.life > p.max) continue; alive = true;
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      const o = Math.max(0, 1 - p.life / p.max);
      ctx.save(); ctx.globalAlpha = o; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); ctx.restore();
    }
    if (alive) raf = requestAnimationFrame(frame);
    else { cancelAnimationFrame(raf); canvas.remove(); }
  }
  frame();
}
