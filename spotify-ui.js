'use strict';
// Spotify screen: album cover, song, progress bar (click to jump) and previous / play-pause / next.
// Replaces the old drawSpotify in mascot.html, which only showed the song title.
(function spotifyScreen() {
  const api = window.twocode;
  // Colour of the album cover (extras-ui.js), Spotify green as fallback.
  const accent = () => window.__twocodeAlbumColour || '#1ed760';
  const time = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const position = () => Math.min(spotifyState.duration_ms || 0,
    (spotifyState.progress_ms || 0) + (spotifyState.is_playing ? performance.now() - spotifySyncAt : 0));

  // Vector media icons (crisper than text glyphs).
  function mediaIcon(kind, x, y, s, colour) {
    ctx.save(); ctx.fillStyle = colour; ctx.beginPath();
    const tri = (x0, dir) => { ctx.moveTo(x0, y - s / 2); ctx.lineTo(x0 + dir * s * 0.75, y); ctx.lineTo(x0, y + s / 2); ctx.closePath(); };
    if (kind === 'play') tri(x - s * 0.3, 1);
    else if (kind === 'pause') { ctx.roundRect(x - s * 0.4, y - s / 2, s * 0.28, s, 2); ctx.roundRect(x + s * 0.12, y - s / 2, s * 0.28, s, 2); }
    else { const d = kind === 'next' ? 1 : -1; tri(x - d * s * 0.6, d); tri(x - d * s * 0.05, d); ctx.roundRect(x + d * s * 0.7 - (d > 0 ? 0 : s * 0.16), y - s / 2, s * 0.16, s, 1); }
    ctx.fill(); ctx.restore();
  }
  window.__twocodeMediaIcon = mediaIcon;
  function control3(x, y, r, kind, key, primary) {
    const bounds = { x: x - r, y: y - r, width: r * 2, height: r * 2 }, over = inside(pointer.x, pointer.y, bounds);
    if (primary || over) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = primary ? '#f4f7f0' : 'rgba(255,255,255,.08)'; ctx.fill(); ctx.restore(); }
    mediaIcon(kind, x, y, primary ? 15 : 13, primary ? '#050605' : (over ? '#fff' : '#d9dfd4'));
    hit[key] = bounds;
  }

  // Wide, low player (inspired by NotchNook / Alcove / Apple's Dynamic Island): a big album cover on the left,
  // then the song with a live visualizer, a long progress bar, and big controls. The album colour lights it up.
  drawSpotify = function (content) {
    const left = content.x + 4, right = content.x + content.width - 6, top = content.y + 2, track = spotifyState.track;
    hit.ghost = null;
    if (!spotifyConnected) {
      window.__twocodeIcon?.('music', left + 24, top + 40, 30);
      text('Spotify koppelen', left + 56, top + 36, 19, '#fff', 700);
      text('Dan zie en bedien je je muziek hier.', left + 56, top + 56, 12, '#9aa596');
      pill(left + 56, top + 74, 190, '♫', 'Koppel Spotify', 'spConnect');
      return;
    }
    const size = Math.min(content.height - 4, 132), art = albumImage?.complete && albumImage.naturalWidth, colour = accent();
    // soft album-coloured glow behind the cover (a radial gradient: no hard edges)
    if (art) {
      const gx = left + size / 2, gy = top + size / 2, glow = ctx.createRadialGradient(gx, gy, size * 0.2, gx, gy, size * 2.1);
      glow.addColorStop(0, colour.replace('rgb(', 'rgba(').replace(')', ',.38)').replace(/^#(..)(..)(..)$/, (m, r, g, b) => `rgba(${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)},.38)`));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.fillStyle = glow; ctx.beginPath(); ctx.roundRect(left + size / 2, top, right - left - size / 2, size, 16); ctx.fill(); ctx.restore(); // starts behind the cover: no edges
    }
    // cover
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    box(left, top, size, size, 16, '#1b211a'); ctx.restore();
    if (art) { ctx.save(); ctx.beginPath(); ctx.roundRect(left, top, size, size, 16); ctx.clip(); ctx.drawImage(albumImage, left, top, size, size); ctx.restore(); }
    else window.__twocodeIcon?.('music', left + size / 2, top + size / 2, 40, '#5d6858');

    const x = left + size + 24, w = right - x, vizW = 130;
    // title + artist, visualizer on the right
    if (!track) {
      text('Er speelt nu niks', x, top + 30, 18, '#fff', 700, 'left', w - vizW - 16);
      text('Start muziek in Spotify, of druk op afspelen.', x, top + 50, 12.5, 'rgba(235,240,230,.6)', 500, 'left', w - vizW - 16);
      hit.spTitle = { x, y: top + 10, width: w - vizW, height: 28 };
    } else {
      const over = inside(pointer.x, pointer.y, { x, y: top + 10, width: w - vizW - 16, height: 28 });
      text(track.name, x, top + 30, 18, over ? colour : '#fff', 700, 'left', w - vizW - 16);
      text(track.artist, x, top + 50, 12.5, 'rgba(235,240,230,.62)', 500, 'left', w - vizW - 16);
      hit.spTitle = { x, y: top + 10, width: w - vizW - 16, height: 28 };
    }
    if (spotifyState.is_playing && window.__twocodeBars) window.__twocodeBars(right - vizW, right, top + 30, 18, 30);
    else for (let i = 0; i < 18; i++) box(right - vizW + i * (vizW / 18) + 1.5, top + 29, vizW / 18 - 3, 2, 1, 'rgba(255,255,255,.16)');

    // long progress bar with times
    const barY = top + 76, part = spotifyState.duration_ms ? position() / spotifyState.duration_ms : 0;
    const overBar = inside(pointer.x, pointer.y, { x, y: barY - 8, width: w, height: 18 }), bh = overBar ? 6 : 4;
    box(x, barY - bh / 2, w, bh, 3, 'rgba(255,255,255,.14)');
    box(x, barY - bh / 2, Math.max(bh, w * part), bh, 3, overBar ? colour : '#f4f7f0');
    if (overBar) { ctx.save(); ctx.beginPath(); ctx.arc(x + w * part, barY, 6, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); }
    hit.spSeek = { x, y: barY - 8, width: w, height: 18 };
    text(time(position()), x, barY + 17, 10, 'rgba(235,240,230,.5)', 600);
    text(spotifyState.duration_ms ? '-' + time(spotifyState.duration_ms - position()) : '0:00', right, barY + 17, 10, 'rgba(235,240,230,.5)', 600, 'right');

    // controls, centred under the bar
    const cy = top + size - 18, cx = x + w / 2;
    control3(cx - 58, cy, 18, 'prev', 'spPrev');
    control3(cx, cy, 21, spotifyState.is_playing ? 'pause' : 'play', 'spPlay', true);
    control3(cx + 58, cy, 18, 'next', 'spNext');
    // open in Spotify (small, right)
    const ox = right - 14, overOpen = inside(pointer.x, pointer.y, { x: ox - 16, y: cy - 16, width: 32, height: 32 });
    window.__twocodeIcon?.('music', ox, cy, 16, overOpen ? colour : 'rgba(235,240,230,.55)');
    hit.spOpen = { x: ox - 16, y: cy - 16, width: 32, height: 32 };
  };

  async function control(action) {
    window.dispatchEvent(new CustomEvent('twocode:badge', { detail: 'dj' }));
    if (action === 'play' || action === 'pause') { spotifyState.is_playing = action === 'play'; spotifySyncAt = performance.now(); }
    try { const result = await api.spotifyControl(action); if (!result?.ok && result?.error) console.warn('[TwoCode spotify]', result.error); } catch {}
    setTimeout(() => refreshSpotify(), 350);
  }
  // ---- swipe for music: drag left/right over the island (or swipe with two fingers on the touchpad) ----
  // left = next song, right = previous song. Works on the small island and on the Spotify page.
  let drag = null, swallowClick = false, wheelX = 0, wheelAt = 0, lastSwipe = 0;
  const canSwipe = (x, y) => spotifyConnected && spotifyState.track && inside(x, y, islandBounds) && (mode === 'compact' || currentView === 'spotify');
  function swipe(dir) {
    if (performance.now() - lastSwipe < 700) return; lastSwipe = performance.now();
    window.__twocodeFlash?.(dir > 0 ? '⏭  Volgend nummer' : '⏮  Vorig nummer', 900);
    window.__twocodeKick?.(dir > 0 ? -0.05 : 0.05);
    control(dir > 0 ? 'next' : 'previous');
  }
  canvas.addEventListener('pointerdown', e => { drag = canSwipe(e.clientX, e.clientY) ? { x: e.clientX, y: e.clientY } : null; });
  canvas.addEventListener('pointerup', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = null;
    if (Math.abs(dx) > 48 && Math.abs(dy) < 36) { swallowClick = true; swipe(dx < 0 ? 1 : -1); }
  });
  // on window (capture) so it runs before every other click handler: a swipe is not a click
  window.addEventListener('click', e => { if (swallowClick) { swallowClick = false; e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  canvas.addEventListener('wheel', e => {
    if (!canSwipe(e.clientX, e.clientY) || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const now = performance.now(); if (now - wheelAt > 250) wheelX = 0; wheelAt = now; wheelX += e.deltaX;
    if (Math.abs(wheelX) > 90) { swipe(wheelX > 0 ? 1 : -1); wheelX = 0; }
  }, { passive: true });
  canvas.addEventListener('click', async event => {
    if (currentView !== 'spotify' || mode !== 'expanded') return;
    const x = event.clientX, y = event.clientY, hits = {
      spPrev: () => control('previous'), spNext: () => control('next'),
      spPlay: () => control(spotifyState.is_playing ? 'pause' : 'play'), spOpen: () => control('open'), spTitle: () => control('open'),
      spConnect: async () => { try { await api.spotifyConnect(); } catch {} refreshSpotify(); },
      spSeek: () => {
        const bar = hit.spSeek, ms = Math.round(((x - bar.x) / bar.width) * (spotifyState.duration_ms || 0));
        spotifyState.progress_ms = ms; spotifySyncAt = performance.now(); api.spotifySeek(ms).catch(() => {});
      }
    };
    for (const [key, run] of Object.entries(hits)) {
      if (inside(x, y, hit[key])) { event.preventDefault(); event.stopImmediatePropagation(); run(); return; }
    }
  }, true);
})();
