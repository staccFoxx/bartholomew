/* Bartholomew Security — Site-Wide Light Snowfall Overlay */
(function () {
  if (window.__btpSnowInit) return;
  window.__btpSnowInit = true;

  function boot() {
    // Remove any legacy inline snow nodes if present
    const legacyCanvas = document.getElementById('holidaySnowCanvas');
    if (legacyCanvas) legacyCanvas.remove();
    const legacyBtn = document.getElementById('holidayToggleBtn');
    if (legacyBtn) legacyBtn.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'btpHolidaySnow';
    canvas.className = 'btp-snow-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btpSnowToggle';
    btn.className = 'btp-snow-toggle';
    btn.title = 'Toggle Winter Snowfall';
    btn.innerHTML = '<span>&#10052;</span><span id="btpSnowLabel">Snow: ON</span>';
    document.body.appendChild(btn);

    const lbl = document.getElementById('btpSnowLabel');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let enabled = localStorage.getItem('btp_holiday_snow') !== 'off';
    let w = 0;
    let h = 0;
    let flakes = [];
    let rafId = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createFlakes() {
      // Crisp, light snowfall across 3 depth layers
      const count = Math.min(115, Math.max(55, Math.floor(w / 15)));
      flakes = Array.from({ length: count }, () => {
        const depth = Math.random(); // 0 = far, 1 = near
        const r = 1.1 + depth * 2.6;
        const roll = Math.random();
        const color = roll < 0.10
          ? '253, 230, 138'   // warm champagne glint
          : roll < 0.16
            ? '186, 230, 253' // icy frost blue
            : '248, 252, 255'; // pure crisp snow
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          vy: 0.45 + depth * 1.15,
          vx: (Math.random() - 0.5) * 0.45,
          phase: Math.random() * Math.PI * 2,
          sway: 0.25 + depth * 0.55,
          alpha: 0.35 + depth * 0.55,
          color
        };
      });
    }

    let t = 0;
    function tick() {
      if (!enabled) return;
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.vy;
        f.x += f.vx + Math.sin(t + f.phase) * f.sway;
        if (f.y > h + 8) {
          f.y = -8;
          f.x = Math.random() * w;
        }
        if (f.x > w + 8) f.x = -8;
        if (f.x < -8) f.x = w + 8;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + f.color + ',' + f.alpha.toFixed(2) + ')';
        ctx.shadowBlur = f.r > 2.4 ? 6 : 0;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(tick);
    }

    function sync() {
      document.body.classList.toggle('btp-snow-off', !enabled);
      btn.setAttribute('aria-pressed', String(enabled));
      if (lbl) lbl.textContent = enabled ? 'Snow: ON' : 'Snow: OFF';
      if (enabled && !rafId) {
        tick();
      } else if (!enabled && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        ctx.clearRect(0, 0, w, h);
      }
    }

    btn.addEventListener('click', function () {
      enabled = !enabled;
      localStorage.setItem('btp_holiday_snow', enabled ? 'on' : 'off');
      sync();
    });

    window.addEventListener('resize', function () {
      resize();
      createFlakes();
    });

    resize();
    createFlakes();
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
