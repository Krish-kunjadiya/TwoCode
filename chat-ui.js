'use strict';
// Robo's chat in the island (like Coucou): drop Robo on something on your screen and the island opens here,
// with what he looked at in a little pill on top ("● Chrome · Wat is een API?"). Ask, and ask on: the
// conversation stays until you start a new one. Without anything picked it is just a chat with Robo.
// Robo sits bottom left (drawn on the canvas behind this page), the questions are pills on the right,
// his answers plain text on the left. The answers come from the AI in Settings → AI (buddy-main.cjs).
(function robotChat() {
  const api = window.twocode;
  if (!api?.buddyAsk) return;
  const root = document.createElement('section'); root.id = 'twocode-chat'; document.body.appendChild(root);
  const style = document.createElement('style'); style.textContent = `
#twocode-chat{position:absolute;z-index:60;display:none;color:#f2f2f4;font:12.5px/1.5 Inter, "Segoe UI",sans-serif;pointer-events:auto}
#twocode-chat *{box-sizing:border-box}
#twocode-chat .cr-top{position:absolute;left:16px;right:12px;top:4px;height:28px;display:flex;align-items:center;gap:8px}
#twocode-chat .cr-ctx{flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:7px;padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.08);font-size:11.5px;font-weight:600;color:#e8e8ef;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#twocode-chat .cr-ctx i{width:7px;height:7px;border-radius:50%;background:#5ee07a;box-shadow:0 0 6px #5ee07a;flex:none}
#twocode-chat .cr-ctx button{border:0;background:transparent;color:#9a9aa6;cursor:pointer;font-size:12px;padding:0 0 0 4px}
#twocode-chat .cr-ctx img{width:30px;height:19px;object-fit:cover;border-radius:5px;cursor:zoom-in;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.25)}
#twocode-chat .cr-ctx span{overflow:hidden;text-overflow:ellipsis}
#twocode-chat .cr-via{flex:none;font-size:10.5px;color:#8a8a96;border:0;background:transparent;padding:0;font-family:inherit}
#twocode-chat .cr-via.off{color:#ffb4a8;cursor:pointer;text-decoration:underline}
#twocode-chat .cr-pick{flex:none;display:flex;padding:2px;border-radius:999px;background:rgba(255,255,255,.07)}
#twocode-chat .cr-pick button{border:0;border-radius:999px;padding:3px 10px;background:transparent;color:#9a9aa6;font:600 11px Inter, "Segoe UI", sans-serif;cursor:pointer;display:flex;align-items:center;gap:5px}
#twocode-chat .cr-pick button i{width:7px;height:7px;border-radius:50%;background:var(--c)}
#twocode-chat .cr-pick button.on{background:rgba(255,255,255,.16);color:#fff}
#twocode-chat .cr-fix{display:inline-block;margin-top:6px;border:0;border-radius:999px;padding:5px 12px;background:#fff;color:#111;font:700 11.5px Inter, "Segoe UI", sans-serif;cursor:pointer}
#twocode-chat .cr-new{margin-left:auto;flex:none;border:0;border-radius:999px;padding:4px 11px;background:rgba(255,255,255,.08);color:#c9c9d2;font:600 11px Inter, "Segoe UI", sans-serif;cursor:pointer}
#twocode-chat .cr-new:hover{background:rgba(255,255,255,.14);color:#fff}
#twocode-chat .cr-msgs{position:absolute;left:20px;right:16px;top:40px;bottom:68px;overflow:auto;display:flex;flex-direction:column;gap:12px;padding-right:4px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.15) transparent}
#twocode-chat .cr-me{align-self:flex-end;max-width:70%;text-align:right;font-weight:500;font-size:13px;color:rgba(255,255,255,.5)}
#twocode-chat .cr-ai{align-self:flex-start;max-width:100%;font:17px/1.48 Inter, "Segoe UI",sans-serif;letter-spacing:-.1px;color:#fff;user-select:text}
#twocode-chat .cr-ai p{margin:0 0 9px}#twocode-chat .cr-ai p:last-child{margin-bottom:0}
#twocode-chat .cr-ai ul,#twocode-chat .cr-ai ol{margin:2px 0 7px;padding-left:18px}#twocode-chat .cr-ai li{margin:2px 0}
#twocode-chat .cr-ai code{font:13px "Cascadia Code",Consolas,monospace;background:rgba(255,255,255,.1);border-radius:7px;padding:2px 7px;color:#fff}
#twocode-chat .cr-ai pre{margin:6px 0 9px;padding:10px 13px;border-radius:12px;background:rgba(255,255,255,.07);font:12.5px/1.5 "Cascadia Code",Consolas,monospace;color:#fff;white-space:pre-wrap;user-select:text}
#twocode-chat .cr-err{color:#ffb4a8}
#twocode-chat .cr-wait{align-self:flex-start;display:flex;gap:5px;padding:6px 2px}
#twocode-chat .cr-wait i{width:6px;height:6px;border-radius:50%;background:#fff;animation:crb 1s infinite}
#twocode-chat .cr-wait i:nth-child(2){animation-delay:.15s}#twocode-chat .cr-wait i:nth-child(3){animation-delay:.3s}
@keyframes crb{0%,100%{opacity:.3;transform:none}50%{opacity:1;transform:translateY(-3px)}}
#twocode-chat .cr-fixes{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:5px}
#twocode-chat .cr-fixes li{background:rgba(255,255,255,.06);border-radius:10px;padding:6px 9px;font-size:11.5px}
#twocode-chat .cr-fixes del{color:#ff8f8f}#twocode-chat .cr-fixes ins{color:#9be37a;text-decoration:none}
#twocode-chat .cr-fixes small{display:block;color:#8a8a96}
#twocode-chat .cr-act{margin-top:10px;border:0;border-radius:999px;padding:8px 15px;background:#fff;color:#141416;font:600 12.5px Inter, "Segoe UI", sans-serif;cursor:pointer}
#twocode-chat .cr-chips{position:absolute;left:16px;right:16px;bottom:66px;display:flex;flex-wrap:wrap;gap:8px}
#twocode-chat .cr-chips button{border:0;border-radius:999px;padding:7px 14px;background:rgba(255,255,255,.1);color:#fff;font:600 12.5px Inter, "Segoe UI",sans-serif;cursor:pointer}
#twocode-chat .cr-chips button:hover{background:rgba(255,255,255,.15)}
#twocode-chat .cr-input{position:absolute;left:12px;right:12px;bottom:10px;height:46px;display:flex;align-items:center;border-radius:23px;background:rgba(255,255,255,.09);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}
#twocode-chat .cr-input:focus-within{box-shadow:inset 0 0 0 1px rgba(255,255,255,.24)}
#twocode-chat .cr-input input{flex:1;min-width:0;height:100%;border:0;background:transparent;color:#fff;font:14px Inter, "Segoe UI",sans-serif;padding:0 12px;outline:none;user-select:text;caret-color:#fff;caret-animation:manual}
#twocode-chat .cr-in.cr-me{animation:crme .32s cubic-bezier(.2,1.3,.4,1) both}#twocode-chat .cr-in.cr-ai{animation:crai .45s cubic-bezier(.2,.9,.3,1) both}
@keyframes crme{from{opacity:0;transform:translate(14px,6px) scale(.92)}to{opacity:1;transform:none}}@keyframes crai{from{opacity:0;transform:translateY(8px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
#twocode-chat .cr-done{display:inline-flex;align-items:center;gap:6px;margin-bottom:6px;padding:3px 10px 3px 8px;border-radius:999px;background:rgba(126,230,162,.14);color:#8ff0b0;font-size:11.5px;font-weight:700;animation:crpop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes crpop{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:none}}
#twocode-chat .cr-diff{margin:8px 0 2px;border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);background:rgba(0,0,0,.28)}
#twocode-chat .cr-file{padding:5px 10px;font-size:11px;font-weight:600;color:#c9c9d6;background:rgba(255,255,255,.05)}
#twocode-chat .cr-diff pre{margin:0;padding:4px 10px;font:11.5px/1.5 "Cascadia Code",Consolas,monospace;white-space:pre-wrap;user-select:text}
#twocode-chat .cr-diff .cr-del{background:rgba(255,92,92,.13);color:#ffb1aa}#twocode-chat .cr-diff .cr-add{background:rgba(126,230,162,.13);color:#a9f5c4}
#twocode-chat .cr-ask{margin-top:9px;font-weight:600}
#twocode-chat .cr-yn{display:flex;gap:6px;margin-top:2px}#twocode-chat .cr-yn .cr-act{margin-top:6px}
#twocode-chat .cr-no{margin-top:6px;border:0;border-radius:999px;padding:6px 13px;background:rgba(255,255,255,.09);color:#e8e8ef;font:600 11.5px Inter, "Segoe UI", sans-serif;cursor:pointer}
#twocode-chat .cr-wait span{margin-left:6px;font-size:13px;color:rgba(255,255,255,.7)}
#twocode-chat .cr-chips button.cr-hot{background:#fff;color:#141416}
#twocode-chat .cr-input input::placeholder{color:#8a8a96}
#twocode-chat .cr-input button{width:32px;height:32px;margin-right:7px;border:0;border-radius:50%;background:#fff;color:#111;font:700 14px Inter, "Segoe UI", sans-serif;cursor:pointer;flex:none}
#twocode-chat .cr-input button:disabled{opacity:.4;cursor:default}
#twocode-chat .cr-shot{position:absolute;inset:40px 14px 12px 14px;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(10,10,18,.94);border-radius:14px;cursor:zoom-out}
#twocode-chat .cr-shot img{max-width:100%;max-height:calc(100% - 24px);border-radius:8px;box-shadow:0 0 0 1px rgba(255,255,255,.2)}
#twocode-chat .cr-shot small{color:#a9a9b6;font-size:11px}
#twocode-chat .cr-eyes{flex:none;display:flex;gap:6px;padding-left:18px}
#twocode-chat .cr-eyes i{width:7px;height:10px;border-radius:50%;background:#e3ffd4;box-shadow:0 0 8px rgba(190,255,200,.7)}
#twocode-chat.cr-busy .cr-eyes i{animation:crlook 1.2s ease-in-out infinite}
@keyframes crlook{0%,100%{transform:translateX(0)}30%{transform:translateX(-2px)}70%{transform:translateX(2px)}}
#twocode-chat .cr-keys{display:inline-flex;gap:7px;vertical-align:middle;margin:3px 0}
#twocode-chat kbd.cr-key{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:40px;height:36px;padding:0 13px;border-radius:11px;background:rgba(255,255,255,.13);box-shadow:inset 0 -2px 0 rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.08);font:600 14px Inter, "Segoe UI",sans-serif;color:#fff}
#twocode-chat kbd.cr-key svg{width:13px;height:13px}
#twocode-chat .cr-hello{display:flex;flex-direction:column;gap:6px;margin-top:6px}
#twocode-chat .cr-hello b{font:600 26px/1.15 Inter, "Segoe UI",sans-serif;letter-spacing:-.5px;color:#fff}
#twocode-chat .cr-hello span{font-size:14px;color:rgba(255,255,255,.55)}
/* ---- the island's own look (like iMessage and the Dynamic Island): your question in a grey bubble, the answer big and white ---- */
#twocode-chat{font-family:Inter,"Segoe UI",sans-serif}
#twocode-chat .cr-top{left:16px;right:16px;top:2px;height:30px}
#twocode-chat .cr-ctx{background:#1c1c1e;padding:5px 12px;font-size:13px}
#twocode-chat .cr-via{font-size:13px;color:#8e8e93}
#twocode-chat .cr-pick{background:#1c1c1e}
#twocode-chat .cr-pick button{font-size:13px;color:#8e8e93;padding:4px 12px}
#twocode-chat .cr-pick button.on{background:#3a3a3c;color:#fff}
#twocode-chat .cr-new{background:#2c2c2e;color:#fff;font-size:13px;padding:5px 12px}
#twocode-chat .cr-new:hover{background:#3a3a3c}
#twocode-chat .cr-msgs{left:16px;right:16px;top:40px;bottom:62px;gap:14px}
#twocode-chat .cr-me{max-width:70%;padding:8px 14px;border-radius:18px;background:#2c2c2e;color:#fff;font-size:15px;line-height:20px;font-weight:400;text-align:left}
#twocode-chat .cr-ai{font:17px/24px Inter,"Segoe UI",sans-serif;letter-spacing:-.3px;color:#fff}
#twocode-chat .cr-ai code{background:#2c2c2e;border-radius:6px}
#twocode-chat .cr-ai pre{background:#1c1c1e;border-radius:12px}
#twocode-chat kbd.cr-key{height:32px;min-width:34px;padding:0 12px;border-radius:8px;background:#2c2c2e;box-shadow:inset 0 -2px 0 #000;font-size:15px}
#twocode-chat .cr-hello b{font-size:26px;font-weight:650;letter-spacing:-.35px}
#twocode-chat .cr-hello span{font-size:15px;color:#8e8e93}
#twocode-chat .cr-chips{left:16px;right:16px;bottom:62px}
#twocode-chat .cr-chips button{background:#1c1c1e;color:#fff;font:500 15px Inter,"Segoe UI",sans-serif;padding:8px 14px}
#twocode-chat .cr-chips button:hover{background:#2c2c2e}
#twocode-chat .cr-chips button:active,#twocode-chat .cr-new:active{transform:scale(.97);transition:transform .1s ease-out}
#twocode-chat .cr-chips button.cr-hot{background:#fff;color:#000}
#twocode-chat .cr-input{left:16px;right:16px;bottom:8px;height:44px;border-radius:22px;background:#1c1c1e;box-shadow:none}
#twocode-chat .cr-input:focus-within{box-shadow:none;background:#2c2c2e}
#twocode-chat .cr-input input{font:15px Inter,"Segoe UI",sans-serif}
#twocode-chat .cr-input input::placeholder{color:#8e8e93}
#twocode-chat .cr-input button{width:32px;height:32px;margin-right:6px;background:#fff;color:#000}
#twocode-chat .cr-eyes{padding-left:16px}
#twocode-chat .cr-eyes i{width:6px;height:9px;box-shadow:none;background:#effff0}
#twocode-chat .cr-act{background:#fff;color:#000;font:600 15px Inter,"Segoe UI",sans-serif;padding:10px 16px}
#twocode-chat .cr-no{background:#2c2c2e;font:600 15px Inter,"Segoe UI",sans-serif;padding:10px 16px}
#twocode-chat .cr-wait i{background:#8e8e93}
#twocode-chat .cr-wait span{color:#8e8e93;font-size:15px}
/* v3, calm: grey buttons with a white symbol, the likely one white; rounded rectangles instead of pills */
#twocode-chat .cr-chips{gap:8px}
#twocode-chat .cr-chips button{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 14px 0 11px;border-radius:10px;background:#1c1c1e;color:#fff;font:600 14px Inter,"Segoe UI",sans-serif}
#twocode-chat .cr-chips button:hover{background:#2c2c2e}
#twocode-chat .cr-chips button svg{flex:none;color:#fff;opacity:.8}
#twocode-chat .cr-chips button.cr-hot{background:#fff;color:#000}
#twocode-chat .cr-chips button.cr-hot svg{color:#000}
#twocode-chat .cr-hello b{font-size:28px;font-weight:700;letter-spacing:-.5px}
#twocode-chat .cr-input{border-radius:12px}
#twocode-chat .cr-input button{border-radius:8px;background:#fff;color:#000}
#twocode-chat .cr-input button:hover{background:#e5e5ea}
#twocode-chat .cr-me{border-radius:16px}
/* compact (notch-app size) */
#twocode-chat .cr-hello b{font-size:19px;letter-spacing:-.2px}
#twocode-chat .cr-hello span{font-size:12px}
#twocode-chat .cr-chips{bottom:50px;gap:6px}
#twocode-chat .cr-chips button{height:28px;padding:0 10px 0 8px;font-size:12px;border-radius:8px;gap:5px}
#twocode-chat .cr-chips button svg{width:13px;height:13px}
#twocode-chat .cr-input{height:36px;bottom:6px;border-radius:10px}
#twocode-chat .cr-input input{font-size:13px}
#twocode-chat .cr-input button{width:26px;height:26px;margin-right:5px;border-radius:7px}
#twocode-chat .cr-msgs{top:30px;bottom:50px;gap:10px}
#twocode-chat .cr-me{font-size:13px;line-height:18px;padding:6px 12px;border-radius:14px}
#twocode-chat .cr-ai{font-size:14px;line-height:20px;letter-spacing:-.1px}
#twocode-chat kbd.cr-key{height:24px;min-width:26px;padding:0 8px;border-radius:6px;font-size:12px}
#twocode-chat .cr-via{font-size:11px}
#twocode-chat .cr-new{font-size:11px;padding:3px 10px}
#twocode-chat .cr-wait span{font-size:13px}
#twocode-chat .cr-act,#twocode-chat .cr-no,#twocode-chat .cr-new{border-radius:10px}
/* v9 start: Robo's eyes in the middle (on the canvas), a greeting under them, the choices in one row */
#twocode-chat{pointer-events:none}
#twocode-chat > *{pointer-events:auto}
#twocode-chat .cr-top{pointer-events:none}
#twocode-chat .cr-top > *{pointer-events:auto}
#twocode-chat .cr-msgs:empty{display:none}
#twocode-chat .cr-start{position:absolute;left:16px;right:16px;top:76px;display:flex;flex-direction:column;align-items:center;text-align:center;pointer-events:none;animation:cr-up .35s cubic-bezier(.2,.8,.2,1) both}
@keyframes cr-up{from{opacity:0;transform:translateY(6px)}}
#twocode-chat .cr-start > b{font-size:17px;line-height:22px;font-weight:600;letter-spacing:-.25px;color:#fff;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#twocode-chat .cr-start > span{margin-top:2px;font-size:12px;line-height:16px;color:#8e8e93}
#twocode-chat .cr-list{display:flex;justify-content:center;gap:8px;margin-top:16px;max-width:100%;pointer-events:auto}
#twocode-chat .cr-row{flex:none;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px 0 10px;border:0;border-radius:10px;background:#1c1c1e;color:#fff;font:500 12.5px Inter,"Segoe UI",sans-serif;white-space:nowrap;cursor:pointer;transition:background .15s}
#twocode-chat .cr-row:hover{background:#2c2c2e}
#twocode-chat .cr-row:active{transform:scale(.97);transition:transform .1s ease-out}
#twocode-chat .cr-row svg{flex:none;color:var(--k)}
#twocode-chat .cr-row.cr-hot{background:#fff;color:#000;font-weight:600}
#twocode-chat .cr-row.cr-hot svg{color:#000}
#twocode-chat .cr-input{left:16px;right:16px;bottom:6px;height:36px;border-radius:18px;background:#1c1c1e}
#twocode-chat .cr-input:focus-within{background:#2c2c2e}
#twocode-chat .cr-input input{padding:0 14px;font-size:13px}
#twocode-chat .cr-input button{width:28px;height:28px;margin-right:4px;border-radius:50%;background:#fff;color:#000;font-weight:700}
#twocode-chat .cr-input button:hover{background:#e5e5ea}
#twocode-chat .cr-via{font-size:11px;color:#8e8e93}
#twocode-chat .cr-new{height:24px;padding:0 10px;border-radius:8px;background:#1c1c1e;color:#fff;font-size:11px}
#twocode-chat .cr-new:hover{background:#2c2c2e}
#twocode-chat .cr-me{background:#2c2c2e;color:#fff}`;
  document.head.appendChild(style);

  const esc = s => String(s ?? '').replace(/[&<>"]/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));
  function md(text) { // **bold**, `code`, ``` code blocks ```, "- " and "1." lists, paragraphs; everything else stays plain text
    const KEY = '(?:Windows|Win|Ctrl|Alt|Shift|Tab|Esc|Enter|Spatie|Space|Delete|Del|Backspace|PrtSc|F\\d{1,2}|[A-Z0-9])';
    const combo = new RegExp(`\\b(?:Windows|Win|Ctrl|Alt|Shift)(?:\\s*\\+\\s*${KEY})+\\b`, 'g'), onlyKeys = new RegExp(`^${KEY}(?:\\s*\\+\\s*${KEY})*$`);
    const WIN = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6.5" height="6.5" rx="1"/><rect x="8.5" y="1" width="6.5" height="6.5" rx="1"/><rect x="1" y="8.5" width="6.5" height="6.5" rx="1"/><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1"/></svg>';
    const caps = c => `<span class="cr-keys">${c.split(/\s*\+\s*/).map(k => `<kbd class="cr-key">${/^win/i.test(k) ? WIN + 'Win' : k}</kbd>`).join('')}</span>`;
    const inline = s => s.split(/(`[^`]+`)/).map(part => /^`[^`]+`$/.test(part)
      ? (onlyKeys.test(part.slice(1, -1)) && /\+/.test(part) ? caps(part.slice(1, -1)) : `<code>${part.slice(1, -1)}</code>`)
      : part.replace(combo, caps)).join('').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    const lines = esc(text).split('\n'); let html = '', list = null, block = null, para = [];
    const flush = () => { if (para.length) { html += '<p>' + inline(para.join('<br>')) + '</p>'; para = []; } };
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const line of lines) {
      if (/^\s*```/.test(line)) { if (block) { html += `<pre>${block.join('\n')}</pre>`; block = null; } else { flush(); close(); block = []; } continue; }
      if (block) { block.push(line); continue; }
      const item = line.match(/^\s*(?:([-•*])|(\d+)[.)])\s+(.*)$/);
      if (item) { flush(); const kind = item[1] ? 'ul' : 'ol'; if (list !== kind) { close(); html += `<${kind}>`; list = kind; } html += '<li>' + inline(item[3]) + '</li>'; continue; }
      if (!line.trim()) { flush(); close(); continue; }
      close(); para.push(line);
    }
    if (block) html += `<pre>${block.join('\n')}</pre>`;
    flush(); close();
    return html;
  }

  // context: what Robo looked at ({ app, title, word, picture }) or null; messages: { who: 'me' | 'ai', ... }
  let waitingFix = false, waitingType = '';
  let context = null, messages = [], waiting = false, visible = false, holdUntil = 0, zoom = false, readFrom = false, toEnd = false;
  // Which AI answers: the ones connected in TwoCode → Verbindingen (Claude Code → Claude, Codex → Codex).
  // { agents: [{ id, name }], current } — null until asked. Two connected: a little switch in the top bar.
  let aiState = null;
  const AI_DOT = { claudecode: '#d97757', codex: '#3b82f6' };
  const refreshAi = () => api.buddyAi?.().then(n => { if (JSON.stringify(n) !== JSON.stringify(aiState)) { aiState = n; render(); } }).catch(() => {});
  // Dutch or English, like the rest of the island (Instellingen → Taal)
  const WORDS = {
    nl: { chips: [['explain', 'Leg uit'], ['spelling', 'Klopt mijn spelling?'], ['translate', 'Vertaal'], ['summary', 'Vat samen']],
      seen: 'Dit heeft Robo gezien', part: 'Dit stukje scherm', forget: 'Niet meer naar kijken', which: 'Welke AI antwoordt', gives: 'Deze AI geeft de antwoorden',
      connect: 'Verbind Claude Code of Codex', fresh: 'Nieuw gesprek', sent: 'Dit heeft Robo gezien en naar de AI gestuurd · klik om te sluiten',
      login: 'Log in met ChatGPT', openCx: 'Open Verbindingen', clean: 'Ik zie geen fouten. Netjes! 🎉', toWord: '✓ Zet in Word (als wijzigingen)',
      more: 'Ga verder…', about: 'Vraag iets over wat hier staat…', any: 'Vraag Robo iets…', hello: 'Wat kan ik voor je doen?', helloSub: 'Vraag iets, of kies hieronder.', sees: a => `Ik zie ${a}. Wat wil je weten?`, label: 'Je vraag aan Robo', send: 'Versturen',
      wrong: 'Er ging iets mis.', browser: 'Kijk in je browser…', loggedIn: 'Gelukt! Stel je vraag nog een keer. 🎉', noLogin: 'Inloggen lukte niet.', fixChip: 'Los het op', fixMore: 'Los het voor me op', fixed: p => `Opgelost in ${p}`, fixing: p => `Robo zoekt de fix in ${p}…`, thinking: 'Even kijken…',
      mayI: f => `Mag ik ${f} aanpassen?`, yes: '✓ Ja, pas het aan', no: 'Nee', saidYes: 'Ja, doe maar', saidNo: 'Nee, laat maar', noChange: 'Oké, ik verander niks.', typing: f => `Robo typt in ${f}…`, line: n => `regel ${n}`,
      inWord: 'Bezig in Word…', applied: (a, t) => `${a} van de ${t} verbeteringen staan in Word, als wijzigingen. Klik in Word op Accepteren of Weigeren.`, failed: 'Dat lukte niet.' },
    en: { chips: [['explain', 'Explain'], ['spelling', 'Check my spelling'], ['translate', 'Translate'], ['summary', 'Summarize']],
      seen: 'This is what Robo saw', part: 'This part of the screen', forget: 'Stop looking at this', which: 'Which AI answers', gives: 'This AI gives the answers',
      connect: 'Connect Claude Code or Codex', fresh: 'New chat', sent: 'Robo saw this and sent it to the AI · click to close',
      login: 'Sign in with ChatGPT', openCx: 'Open Connections', clean: 'No mistakes. Nice! 🎉', toWord: '✓ Put in Word (as changes)',
      more: 'Continue…', about: 'Ask about what is here…', any: 'Ask Robo something…', hello: 'What can I do for you?', helloSub: 'Ask anything, or pick one below.', sees: a => `I see ${a}. What do you want to know?`, label: 'Your question for Robo', send: 'Send',
      wrong: 'Something went wrong.', browser: 'Check your browser…', loggedIn: 'Done! Ask your question again. 🎉', noLogin: 'Signing in did not work.', fixChip: 'Fix it', fixMore: 'Fix it for me', fixed: p => `Fixed in ${p}`, fixing: p => `Robo is finding the fix in ${p}…`, thinking: 'Taking a look…',
      mayI: f => `May I change ${f}?`, yes: '✓ Yes, fix it', no: 'No', saidYes: 'Yes, go ahead', saidNo: 'No, leave it', noChange: 'Okay, I won\'t change anything.', typing: f => `Robo is typing in ${f}…`, line: n => `line ${n}`,
      inWord: 'Working in Word…', applied: (a, t) => `${a} of the ${t} fixes are in Word, as changes. Click Accept or Reject in Word.`, failed: 'That did not work.' }
  };
  const L = () => WORDS[window.__twocodePrefs?.().lang === 'en' ? 'en' : 'nl'];

  function render() {
    const keep = root.querySelector('input')?.value || '', focused = document.activeElement === root.querySelector('input'), wasTop = root.querySelector('.cr-msgs')?.scrollTop || 0;
    const photo = context?.picture ? `<img src="${esc(context.picture)}" data-do="zoom" alt="" title="${L().seen}">` : '';
    const pill = context ? `<div class="cr-ctx"><i></i>${photo}<span>${esc(context.app || L().part)}</span><button type="button" data-do="forget" title="${L().forget}">✕</button></div>` : '';
    const agents = aiState?.agents || [];
    const via = !aiState ? '' : agents.length > 1
      ? `<div class="cr-pick" title="${L().which}">${agents.map(a => `<button type="button" data-ai="${a.id}" class="${a.id === aiState.current ? 'on' : ''}" style="--c:${AI_DOT[a.id]}"><i></i>${esc(a.name)}</button>`).join('')}</div>`
      : agents.length ? (messages.length || waiting ? `<span class="cr-via" title="${L().gives}">via ${esc(agents[0].name)}</span>` : '')
      : `<button type="button" class="cr-via off" data-do="setup">${L().connect}</button>`;
    const ctx = `<div class="cr-top">${pill}${via}${messages.length ? `<button type="button" class="cr-new" data-do="new">${L().fresh}</button>` : ''}</div>`;
    const shot = zoom && context?.picture ? `<div class="cr-shot" data-do="zoom"><img src="${esc(context.picture)}" alt=""><small>${L().sent}</small></div>` : '';
    const lastAnswer = [...messages].reverse().find(m => m.who === 'ai' && !m.error);
    const msgs = messages.map(m => {
      const fresh = m.fresh ? ' cr-in' : ''; m.fresh = false;
      if (m.who === 'me') return `<div class="cr-me${fresh}">${esc(m.text)}</div>`;
      if (m.error) {
        const fix = m.fix === 'login' ? `<button type="button" class="cr-fix" data-do="login">${L().login}</button>`
          : m.fix === 'connect' ? `<button type="button" class="cr-fix" data-do="setup">${L().openCx}</button>` : '';
        return `<div class="cr-ai cr-err">${esc(m.error)}${fix ? '<br>' + fix : ''}</div>`;
      }
      let html = md(m.text || '');
      if (m.fixes) {
        html += m.fixes.length ? `<ul class="cr-fixes">${m.fixes.map(f => `<li>p. ${esc(f.page ?? '?')} · <del>${esc(f.find)}</del> → <ins>${esc(f.replace)}</ins>${f.why ? `<small>${esc(f.why)}</small>` : ''}</li>`).join('')}</ul>` : `<div>${L().clean}</div>`;
        if (m.fixes.length && !m.applied) html += `<button type="button" class="cr-act" data-do="apply">${L().toWord}</button>`;
        if (m.applied) html += `<div style="margin-top:6px;color:#9be37a">${esc(m.applied)}</div>`;
      }
      const diff = list => `<div class="cr-diff">${list.map(c => `<div class="cr-file">${esc(c.file)} · ${esc(L().line(c.line))}</div><pre class="cr-del">- ${esc(c.find)}</pre><pre class="cr-add">+ ${esc(c.replace)}</pre>`).join('')}</div>`;
      if (m.plan) {
        html += diff(m.plan.changes);
        if (!m.decided) html += `<div class="cr-ask">${esc(L().mayI([...new Set(m.plan.changes.map(c => c.file.split('/').pop()))].join(', ')))}</div><div class="cr-yn"><button type="button" class="cr-act" data-do="fix-yes">${L().yes}</button><button type="button" class="cr-no" data-do="fix-no">${L().no}</button></div>`;
      }
      if (m.fixed) html = `<div class="cr-done">✓ ${esc(L().fixed(m.project || ''))}</div>` + html + (m.changes?.length ? diff(m.changes) : '');
      if (m === lastAnswer && context?.project && !m.fixed && !m.fixes && !m.plan && !waiting) html += `<button type="button" class="cr-act" data-kind="fix">${L().fixMore}</button>`;
      return `<div class="cr-ai${fresh}">${html}</div>`;
    }).join('') + '' + (waiting ? `<div class="cr-wait"><i></i><i></i><i></i><span>${esc(waitingType ? L().typing(waitingType) : waitingFix ? L().fixing(context?.project || '') : L().thinking)}</span></div>` : '');
    const chipList = context?.project ? [L().chips[0], ['fix', L().fixChip], ...L().chips.slice(1, 3)] : L().chips;
    const CHIP = { explain: ['#0091ff', '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>'],
      spelling: ['#30d158', '<path d="m4 12.5 4 4L18 6"/><path d="M14 18h6"/>'], translate: ['#00d2e0', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'],
      summary: ['#bf5af2', '<path d="M5 6h14M5 12h14M5 18h8"/>'], fix: ['#ff9230', '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'] };
    // the start: Robo's own eyes big in the middle (drawn on the island by __twocodeDrawChat, so you can grab him and drag him
    // onto something on your screen), a greeting, and the things he can do in one row
    const rows = chipList.map(([k, label]) => { const [colour, icon] = CHIP[k] || ['#8e8e93', ''];
      return `<button type="button" data-kind="${k}" class="cr-row${k === 'fix' ? ' cr-hot' : ''}" style="--k:${colour}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>${label}</button>`; }).join('');
    const en = window.__twocodePrefs?.().lang === 'en';
    const hi = context?.app ? L().sees(context.app) : en ? 'What can I do for you?' : 'Wat kan ik voor je doen?';
    const hiSub = context?.app ? (en ? 'Pick one, or type your question.' : 'Kies er een, of typ je vraag.') : en ? 'Drag me onto something on your screen, or ask below.' : 'Sleep mij naar iets op je scherm, of vraag het hieronder.';
    const chips = !messages.length && !waiting ? `<div class="cr-start"><b>${esc(hi)}</b><span>${esc(hiSub)}</span><div class="cr-list">${rows}</div></div>` : '';
    const placeholder = messages.length ? L().more : context ? L().about : L().any;
    root.innerHTML = `${ctx}${shot}<div class="cr-msgs">${msgs}</div>${chips}
      <div class="cr-input"><input type="text" maxlength="2000" placeholder="${placeholder}" aria-label="${L().label}"><button type="button" data-do="send" ${waiting ? 'disabled' : ''} aria-label="${L().send}">↑</button></div>`;
    root.classList.toggle('cr-busy', waiting);
    const input = root.querySelector('input'); input.value = keep; if (focused) input.focus();
    // a new answer: show it from its start (with your question above it), not its end
    const list = root.querySelector('.cr-msgs'), mine = [...list.querySelectorAll('.cr-me')].pop();
    if (toEnd) list.scrollTop = list.scrollHeight; // a proposal: straight to "may I change…?" and its buttons
    else if (readFrom && mine) list.scrollTop = Math.max(0, mine.offsetTop - 4); else list.scrollTop = waiting ? list.scrollHeight : wasTop;
    readFrom = false; toEnd = false;
  }

  async function ask(kind, text) {
    if (waiting) return;
    const label = text || (kind === 'fix' ? L().fixChip : L().chips.find(([k]) => k === kind)?.[1])?.replace(/^\p{Extended_Pictographic}\S*\s/u, '') || '';
    const history = messages.filter(m => !m.error).map(m => ({ who: m.who, text: String(m.text || '').slice(0, 2000) })).slice(-8);
    messages.push({ who: 'me', text: label, fresh: true }); waiting = true; waitingFix = kind === 'fix'; render();
    window.__twocodeChime?.('send');
    window.__twocodeFeel?.('focus', 60000);
    let r;
    try { r = await api.buddyAsk(kind, text, history, window.__twocodePrefs?.().lang === 'en' ? 'en' : 'nl'); } catch (e) { r = { ok: false, error: String(e?.message || e) }; }
    waiting = false; readFrom = true; holdUntil = performance.now() + 10000; shineUntil = performance.now() + 4000; // stay open a moment so you see the answer
    if (r?.ok && r.plan) { toEnd = true; holdUntil = performance.now() + 30000; } // waiting for your yes
    messages.push(r?.ok ? { who: 'ai', text: r.answer || '', fixes: r.word ? r.fixes || [] : null, fixed: !!r.fixed, project: r.project || '', plan: r.plan || null, fresh: true } : { who: 'ai', error: r?.error || L().wrong, fix: r?.fix || '', fresh: true });
    waitingFix = false;
    if (r?.ok && r.fixed) { window.__twocodeCelebrate?.('fix', 70); window.__twocodeFeel?.('heart', 2600); } // a fix landed: fanfare, confetti, a jump
    else { window.__twocodeChime?.(r?.ok ? 'reply' : 'error'); window.__twocodeFeel?.(r?.ok ? 'heart' : 'sad', 1800); }
    render();
  }

  root.addEventListener('click', async e => {
    if (e.target.closest('[data-do="zoom"]')) { zoom = !zoom; render(); return; }
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.kind) return ask(b.dataset.kind, '');
    const act = b.dataset.do, input = root.querySelector('input');
    if (act === 'send') { const text = input.value.trim(); if (text) { input.value = ''; ask('free', text); } }
    if (act === 'new') { messages = []; render(); input?.focus(); }
    if (act === 'forget') { context = null; zoom = false; api.buddyForget?.(); render(); }
    if (act === 'setup') api.settingsOpen?.('connect');
    if (b.dataset.ai) { aiState = await api.buddyUseAi?.(b.dataset.ai) || aiState; render(); }
    if (act === 'login') {
      b.disabled = true; b.textContent = L().browser;
      const r = await api.buddyLogin?.();
      messages.push(r?.ok ? { who: 'ai', text: L().loggedIn } : { who: 'ai', error: r?.error || L().noLogin });
      render();
    }
    if (act === 'fix-yes' || act === 'fix-no') {
      const m = [...messages].reverse().find(x => x.plan && !x.decided); if (!m || waiting) return;
      m.decided = true;
      if (act === 'fix-no') { api.buddyCancelFix?.(); messages.push({ who: 'me', text: L().saidNo, fresh: true }, { who: 'ai', text: L().noChange, fresh: true }); window.__twocodeChime?.('reply'); render(); return; }
      messages.push({ who: 'me', text: L().saidYes, fresh: true }); waiting = true; waitingType = m.plan.changes[0]?.file.split('/').pop() || ''; render();
      window.__twocodeChime?.('send'); window.__twocodeFeel?.('focus', 60000);
      let r; try { r = await api.buddyApplyFix(); } catch (err) { r = { ok: false, error: String(err?.message || err) }; }
      waiting = false; waitingType = ''; readFrom = true; holdUntil = performance.now() + 12000; shineUntil = performance.now() + 4000;
      messages.push(r?.ok ? { who: 'ai', text: r.answer || '', fixed: true, project: r.project || '', changes: r.changes || [], fresh: true } : { who: 'ai', error: r?.error || L().wrong, fresh: true });
      if (r?.ok) { window.__twocodeCelebrate?.('fix', 70); window.__twocodeFeel?.('heart', 2600); } else { window.__twocodeChime?.('error'); window.__twocodeFeel?.('sad', 1800); }
      render(); return;
    }
    if (act === 'apply') {
      b.disabled = true; b.textContent = L().inWord;
      const r = await api.buddyApply();
      const m = [...messages].reverse().find(x => x.fixes);
      if (m) m.applied = r?.ok ? L().applied(r.applied, r.total) : r?.error || L().failed;
      render();
    }
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); const text = e.target.value.trim(); if (text) { e.target.value = ''; ask('free', text); } }
  });
  // typing keeps the island open and clickable (like the other pages with a text field)
  root.addEventListener('focusin', () => { projectInputFocused = true; sendInteractive(true); });
  root.addEventListener('focusout', () => { setTimeout(() => { projectInputFocused = root.contains(document.activeElement); }, 0); });

  // Robo dropped on something: the island opens here with what he saw (buddy-main.cjs).
  api.onBuddyChat?.(ctx => {
    context = ctx && ctx.app !== undefined ? ctx : null; messages = []; waiting = false; zoom = false; holdUntil = performance.now() + 15000;
    if (ctx?.ai && typeof ctx.ai === 'object') aiState = ctx.ai;
    setView('chat'); setMode('expanded'); render();
    setTimeout(() => root.querySelector('input')?.focus(), 350);
  });

  // ---- the chat uses the whole island (no card in it); shared with the Claude Code page (ai-monitor-ui.js) ----
  function stageRect(area) { return { x: area.x - 16, y: area.y - 2, width: area.width + 32, height: Math.max(80, area.height + 4) }; } // the page keeps 16px inside: lines up with the frame
  window.__twocodeStageRect = stageRect;
  // Places a DOM page on the stage (8px in from the island's edge; the page keeps 16px inside, so 24 like the header).
  window.__twocodePlaceOnStage = (el, area) => window.__twocodePage.place(el, stageRect(area));
  // While Robo thinks, a soft rainbow light runs round the edge of the island (like Siri); it fades out when he answers.
  let shineUntil = 0, ring = 0;
  window.__twocodeChatShine = () => { shineUntil = performance.now() + 4000; };
  const RAINBOW = ['#ff6b9d', '#ffb86b', '#ffe56b', '#6bffb5', '#6bc5ff', '#a07bff', '#ff6b9d'];
  const bigRobo = () => currentView === 'chat' && mode === 'expanded' && visible && !messages.length && !waiting;
  window.__twocodeRoboBig = bigRobo; // the header leaves its own little eyes out then (there is only one Robo)
  window.__twocodeDrawChat = () => {
    hit.ghost = null;
    if (bigRobo() && root.style.left) {
      const cx = parseFloat(root.style.left) + root.offsetWidth / 2, cy = parseFloat(root.style.top) + 46;
      window.__twocodeIslandEyes?.(cx, cy, 2.8);
      hit.ghost = { x: cx - 46, y: cy - 28, width: 92, height: 56 };
    }
    ring += ((waiting ? 1 : 0) - ring) * 0.08;
    if (ring < 0.01) return;
    const ib = islandBounds, r = visual.radius, t = performance.now();
    const g = ctx.createConicGradient(t / 700, ib.x + ib.width / 2, ib.height / 2);
    RAINBOW.forEach((c, i) => g.addColorStop(i / (RAINBOW.length - 1), c));
    ctx.save(); islandPath(ib.x, 0, ib.width, ib.height, r); ctx.clip();
    ctx.globalAlpha = ring * 0.9; ctx.strokeStyle = g;
    ctx.filter = 'blur(9px)'; ctx.lineWidth = 18; islandPath(ib.x, 0, ib.width, ib.height, r); ctx.stroke();
    ctx.filter = 'none'; ctx.lineWidth = 2.5; islandPath(ib.x, 0, ib.width, ib.height, r); ctx.stroke();
    ctx.restore();
  };

  // for videos and tests: show a conversation (and Robo thinking) without asking a real AI
  window.__twocodeChatDemo = ({ list, thinking } = {}) => { if (list) messages = list.map(m => ({ ...m })); waiting = Boolean(thinking); render(); };

  function loop() {
    const show = currentView === 'chat' && mode === 'expanded';
    const display = show ? 'block' : 'none'; if (root.style.display !== display) root.style.display = display;
    if (show) {
      window.__twocodePlaceOnStage(root, contentRect()); // the whole block is Robo's
      if (waiting || performance.now() < holdUntil) leaveStartedAt = null; // the island does not fold away mid-conversation
      if (!visible) { render(); refreshAi(); }
    } else if (visible && root.contains(document.activeElement)) { document.activeElement.blur(); projectInputFocused = false; }
    visible = show;
    requestAnimationFrame(loop);
  }
  render();
  requestAnimationFrame(loop);
})();
