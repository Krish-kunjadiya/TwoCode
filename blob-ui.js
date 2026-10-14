'use strict';
// Switching apps (Spotify, Tray, Settings …): the island squishes into a small blob, the app's Robo does
// his own little act (dances, types, times, files, copies, writes, tinkers), then the island springs open
// with a burst in the app's colour. Settings → Animaties → App-animaties turns it off.
(function blobSwitch() {
  const ICON = { spotify: 'music', monitor: 'terminal', assistant: 'terminal', tray: 'tray', focus: 'timer', clips: 'copy', note: 'note', settings: 'gear', home: 'home', apps: 'home', shortcuts: 'home', mirror: 'home' };
  const COLOUR = { music: '#1ed760', terminal: '#ff9a3d', timer: '#ffb35c', tray: '#5b8cff', copy: '#22c7b4', note: '#f5b92e', gear: '#9b7cff', home: '#9fd45a' };
  const SQUISH = 170, ACT = 380, HIDE = 260, FADE = 200, BURST = 520; // ms
  const BLOB = { width: 236, height: 72, radius: 36 };
  const ROOTS = '#twocode-ai-monitor,#twocode-settings-v2,#twocode-extras,#twocode-focus,#twocode-tools';
  const style = document.createElement('style');
  style.textContent = `body.tc-blobbing :is(${ROOTS}){opacity:0 !important;transition:none !important}`;
  document.head.appendChild(style);
  const on = () => window.__twocodePrefs?.().appAnim !== false;
  const clamp = v => Math.max(0, Math.min(1, v)), ease = v => 1 - Math.pow(1 - clamp(v), 3);
  const back = v => { v = clamp(v); return 1 + 2.2 * Math.pow(v - 1, 3) + 1.2 * Math.pow(v - 1, 2); };

  let blob = null; // { start, opened, view, icon, bits }
  const base = setView;
  setView = function (next) {
    const pressedAgo = performance.now() - (window.__twocodeIconPressAt || 0);
    if (!blob && pressedAgo < 200) { window.__twocodeIconPressAt = 0; setTimeout(() => setView(next), 200 - pressedAgo); return; } // let the click squash play first
    if (blob && !blob.opened) { blob.view = next; blob.icon = ICON[next] || 'home'; return; } // clicked again while squishing: go there instead
    if (!on() || window.__twocodeDragging?.() || mode !== 'expanded' || !introFinished || next === currentView || next === 'project' || currentView === 'project' || transition) return base(next);
    const now = performance.now(), icon = ICON[next] || 'home';
    blob = { start: now, opened: 0, view: next, icon, bits: Array.from({ length: 16 }, (_, i) => ({ a: i / 16 * Math.PI * 2 + Math.random() * 0.4, r: 0.6 + Math.random() * 0.6, s: 0.7 + Math.random() * 0.6, spin: Math.random() * 6 - 3 })) };
    transition = { from: { ...visual }, to: BLOB, started: now, duration: SQUISH, ease: 'in' };
    document.body.classList.add('tc-blobbing');
    tone(520, 260, 0.08, 0.016); // a soft "blop" in
    setTimeout(() => {
      blob.opened = performance.now();
      base(blob.view);
      if (transition) { transition.duration = 640; transition.bounce = true; transition.ease = null; }
      tone(300, 820, 0.11, 0.018); // ... and "blop" out
      setTimeout(() => document.body.classList.remove('tc-blobbing'), HIDE);
    }, SQUISH + ACT);
  };

  // ---- each app's little act, around his icon in the middle of the blob (k: 0 → 1 over the act) ----
  const ACTS = {
    music(c, x, y, k, t) { // dancing equaliser + notes floating up
      for (let i = 0; i < 4; i++) { const h = 8 + 16 * Math.abs(Math.sin(t / 110 + i * 1.3)); c.fillStyle = COLOUR.music; c.beginPath(); c.roundRect(x + 36 + i * 9, y + 12 - h, 6, h, 3); c.fill(); }
      for (let i = 0; i < 2; i++) { const p = (k * 1.4 + i * 0.5) % 1; c.globalAlpha = Math.sin(p * Math.PI); glyph(c, '♪', x - 44 - i * 10, y + 10 - p * 26, 16, '#fff'); c.globalAlpha = 1; }
    },
    terminal(c, x, y, k, t) { // types ">_ claude" next to him
      const s = '> claude', n = Math.min(s.length, Math.floor(k * 1.5 * s.length));
      c.font = '700 14px "Cascadia Code", Consolas, monospace'; c.fillStyle = COLOUR.terminal; c.textBaseline = 'middle'; c.fillText(s.slice(0, n), x + 34, y + 1);
      if (Math.floor(t / 180) % 2 === 0) { const w = c.measureText(s.slice(0, n)).width; c.fillRect(x + 36 + w, y - 7, 7, 14); }
    },
    timer(c, x, y, k) { // a ring fills up around him
      c.lineCap = 'round'; c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(x, y, 31, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = COLOUR.timer; c.shadowColor = COLOUR.timer; c.shadowBlur = 10; c.beginPath(); c.arc(x, y, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(k * 1.15)); c.stroke(); c.shadowBlur = 0;
    },
    tray(c, x, y, k) { // little sheets of paper drop into his box
      for (let i = 0; i < 3; i++) { const p = clamp(k * 1.6 - i * 0.28); if (p <= 0 || p >= 1) continue; c.save(); c.globalAlpha = 1 - p * 0.3; c.translate(x - 12 + i * 12, y - 26 + p * 28); c.rotate((i - 1) * 0.4 * (1 - p)); c.fillStyle = '#fff'; c.fillRect(-5, -7, 10, 13); c.fillStyle = COLOUR.tray; c.fillRect(-3, -3, 6, 1.5); c.fillRect(-3, 0, 4, 1.5); c.restore(); }
    },
    copy(c, x, y, k, t, size) { // two copies of him slide out to the sides
      const d = 44 * ease(k * 1.3);
      for (const s of [-1, 1]) { c.save(); c.globalAlpha = 0.35; window.__twocodeAppIcon?.(x - size * 0.4 + s * d, y - size * 0.4, size * 0.8, 'copy'); c.restore(); }
    },
    note(c, x, y, k) { // a pencil writes a wavy line next to him
      const len = 70 * ease(k * 1.2), x0 = x + 34;
      c.strokeStyle = COLOUR.note; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath();
      for (let i = 0; i <= len; i += 2) c.lineTo(x0 + i, y + 6 + Math.sin(i / 5) * 4);
      c.stroke();
      c.save(); c.translate(x0 + len, y + 6 + Math.sin(len / 5) * 4); c.rotate(-0.8); c.fillStyle = '#ffcc33'; c.fillRect(-2, -16, 4, 13); c.fillStyle = '#f2d7b0'; c.beginPath(); c.moveTo(-2, -3); c.lineTo(2, -3); c.lineTo(0, 1); c.closePath(); c.fill(); c.fillStyle = '#ff6b6b'; c.fillRect(-2, -19, 4, 3); c.restore();
    },
    gear(c, x, y, k, t) { // two gears turn next to him
      gearShape(c, x + 44, y - 6, 12, t / 200, COLOUR.gear); gearShape(c, x + 60, y + 12, 8, -t / 140, '#c9b3ff');
      gearShape(c, x - 46, y + 8, 9, -t / 160, '#c9b3ff');
    },
    home(c, x, y, k) { // little hearts pop up
      for (let i = 0; i < 3; i++) { const p = clamp(k * 1.5 - i * 0.25); if (p <= 0 || p >= 1) continue; c.globalAlpha = Math.sin(p * Math.PI); heart(c, x + (i - 1) * 30, y - 18 - p * 22, 5 + i, '#ff5c8a'); c.globalAlpha = 1; }
    }
  };
  const glyph = (c, ch, x, y, size, colour) => { c.font = `700 ${size}px "Segoe UI Symbol", sans-serif`; c.fillStyle = colour; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, x, y); c.textAlign = 'left'; };
  function gearShape(c, x, y, r, rot, colour) {
    c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = colour; c.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.72 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.fillStyle = '#1d1b26'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, Math.PI * 2); c.fill(); c.restore();
  }
  function heart(c, x, y, s, colour) {
    c.fillStyle = colour; c.beginPath(); c.moveTo(x, y + s); c.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.4, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.6, y - s * 1.4, x + s * 1.6, y - s * 0.2, x, y + s); c.fill();
  }
  // The burst when the island opens: bits in the app's colour fly out from the middle.
  const BITS = { music: '♪♫', terminal: '{}<>;/', timer: '', tray: '', copy: '', note: '', gear: '', home: '' };
  function burst(c, x, y, o) {
    const p = clamp(o / BURST); if (p >= 1) return;
    const col = COLOUR[blob.icon] || COLOUR.home, chars = BITS[blob.icon], R = 300;
    if (blob.icon === 'timer') { c.strokeStyle = col; c.lineWidth = 3 * (1 - p); c.globalAlpha = 1 - p; c.beginPath(); c.arc(x, y, 30 + R * 0.8 * ease(p), 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1; }
    blob.bits.forEach((b, i) => {
      const d = R * b.r * ease(p), bx = x + Math.cos(b.a) * d, by = y + Math.abs(Math.sin(b.a)) * d * 0.55 - Math.max(0, -Math.sin(b.a)) * 12 * p;
      c.save(); c.globalAlpha = (1 - p) * 0.9; c.translate(bx, by); c.rotate(b.spin * p);
      if (chars) glyph(c, chars[i % chars.length], 0, 0, 14 * b.s, i % 3 ? col : '#ffffff');
      else if (blob.icon === 'home') heart(c, 0, 0, 4 * b.s, i % 2 ? '#ff5c8a' : col);
      else if (blob.icon === 'gear') gearShape(c, 0, 0, 5 * b.s, 0, col);
      else if (blob.icon === 'tray' || blob.icon === 'copy' || blob.icon === 'note') { c.fillStyle = i % 2 ? '#ffffff' : col; c.fillRect(-4 * b.s, -5 * b.s, 8 * b.s, 10 * b.s); }
      else { c.fillStyle = i % 2 ? '#ffffff' : col; c.beginPath(); c.arc(0, 0, 3 * b.s, 0, Math.PI * 2); c.fill(); }
      c.restore();
    });
  }
  function drawScene() {
    const t = performance.now(), s = t - blob.start, o = blob.opened ? t - blob.opened : 0;
    const cx = islandBounds.x + islandBounds.width / 2, cy = BLOB.height / 2 + 2 + (blob.opened ? 30 * ease(o / HIDE) : 0), c = ctx; // stays on top while the island opens below
    const col = COLOUR[blob.icon] || COLOUR.home, pop = back(s / 260), gone = blob.opened ? clamp(o / HIDE) : 0;
    const size = 46 * pop * (1 + gone * 0.5);
    c.save();
    // a soft glow in the app's colour behind him
    const glow = c.createRadialGradient(cx, cy, 0, cx, cy, 90); glow.addColorStop(0, col + '55'); glow.addColorStop(1, col + '00');
    c.globalAlpha = (1 - gone) * clamp(s / 200); c.fillStyle = glow; c.fillRect(cx - 120, cy - 60, 240, 120);
    c.globalAlpha = 1 - gone;
    const hop = blob.icon === 'home' || blob.icon === 'music' ? -Math.abs(Math.sin(s / 140)) * 4 : 0;
    ACTS[blob.icon]?.(c, cx, cy, clamp((s - 120) / ACT), t, size);
    window.__twocodeAppIcon?.(cx - size / 2, cy - size / 2 + hop, size, blob.icon);
    c.restore();
    if (blob.opened) burst(c, cx, cy, o);
  }
  const baseSmall = drawSmall;
  drawSmall = function () { if (blob && mode === 'expanded') return drawScene(); return baseSmall(); };
  const baseExpanded = drawExpanded;
  drawExpanded = function (alpha) {
    if (!blob) return baseExpanded(alpha);
    const t = performance.now();
    if (!blob.opened || t - blob.opened < HIDE - 60) { drawScene(); return; }
    const o = t - blob.opened, k = Math.min(1, (o - (HIDE - 60)) / FADE);
    const out = baseExpanded(alpha * k);
    burst(ctx, islandBounds.x + islandBounds.width / 2, BLOB.height / 2 + 32, o); // the last bits fly over the page
    if (k >= 1 && o > BURST) blob = null;
    return out;
  };
})();
