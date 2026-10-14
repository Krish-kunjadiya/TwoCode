// twocode-progress-v1
'use strict';
(function projectUI() {
  let project = null;
  let messages = [];
  let ai = null;
  let busy = false;
  let loaded = false;
  let visible = false;

  let error = '';
  let status = '';
  let draft = '';
  let canUndo = false;

  let percent = 0;
  let waiting = false;
  let progressState = 'idle';
  let startedAt = 0;
  let elapsed = 0;

  try {
    projectInput.style.display = 'none';
    UI.PROJECT_H = 300;
  } catch {}

  const root = document.createElement('div');
  root.id = 'twocode-project-v2';
  document.body.appendChild(root);

  const style = document.createElement('style');

  style.textContent = `
#twocode-project-v2 {
  position:absolute;
  z-index:50;
  display:none;
  color:#edf3e8;
  font:10px/15px Arial,sans-serif;
  pointer-events:auto;
}
#twocode-project-v2 * {
  box-sizing:border-box;
}
#twocode-project-v2 .tc-shell {
  height:100%;
  display:flex;
  flex-direction:column;
  min-height:0;
}
#twocode-project-v2 .tc-head {
  display:flex;
  align-items:center;
  gap:7px;
  margin-bottom:8px;
  flex:none;
}
#twocode-project-v2 .tc-heading {
  flex:1;
  min-width:0;
}
#twocode-project-v2 .tc-label {
  font-size:8px;
  color:#acc39c;
  letter-spacing:.1em;
  font-weight:bold;
}
#twocode-project-v2 .tc-title {
  font-size:14px;
  font-weight:bold;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
#twocode-project-v2 button {
  border:0;
  cursor:pointer;
  font:700 9px Arial,sans-serif;
  border-radius:14px;
  padding:8px 11px;
  background:#20281e;
  color:#d4e0cc;
}
#twocode-project-v2 button:hover {
  background:#2d3829;
}
#twocode-project-v2 button:disabled {
  opacity:.5;
  cursor:default;
}
#twocode-project-v2 .tc-messages {
  flex:1;
  min-height:0;
  overflow-y:auto;
  padding-right:4px;
}
#twocode-project-v2 .tc-messages::-webkit-scrollbar {
  width:4px;
}
#twocode-project-v2 .tc-messages::-webkit-scrollbar-thumb {
  background:#394333;
  border-radius:4px;
}
#twocode-project-v2 .tc-empty {
  height:100%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:5px;
}
#twocode-project-v2 .tc-empty strong {
  font-size:15px;
  color:#f4f7ef;
}
#twocode-project-v2 .tc-muted {
  color:#a3b09a;
  font-size:9px;
  line-height:14px;
}
#twocode-project-v2 .tc-message {
  max-width:94%;
  border-radius:10px;
  padding:7px 10px;
  margin-bottom:6px;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
  background:#161d14;
  color:#e3ebdc;
}
#twocode-project-v2 .tc-user {
  margin-left:auto;
  background:#2b3823;
}
#twocode-project-v2 .tc-progress {
  flex:none;
  margin:4px 0 3px;
}
#twocode-project-v2 .tc-progress-row {
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:5px;
}
#twocode-project-v2 .tc-status {
  flex:1;
  min-width:0;
  min-height:14px;
  font-size:10px;
  color:#e8f6d8;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
#twocode-project-v2 .tc-progress-meta {
  color:#cbd4c4;
  font-size:9px;
  flex:none;
  font-variant-numeric:tabular-nums;
}
#twocode-project-v2 .tc-progress-track {
  height:6px;
  border-radius:8px;
  background:#35412b;
  position:relative;
  overflow:hidden;
}
#twocode-project-v2 .tc-progress-fill {
  height:100%;
  border-radius:8px;
  background:#c6e994;
  transition:width .35s ease;
}
#twocode-project-v2 .tc-progress-waiting .tc-progress-track:after {
  content:'';
  position:absolute;
  inset:0;
  width:30%;
  background:linear-gradient(90deg,transparent,#f0ffcd99,transparent);
  animation:tc-progress-pulse 1.5s linear infinite;
}
#twocode-project-v2 .tc-progress-error .tc-progress-fill {
  background:#f2aa9b;
}
#twocode-project-v2 .tc-progress-error .tc-status {
  color:#ffc1b7;
}
@keyframes tc-progress-pulse {
  from { transform:translateX(-100%); }
  to { transform:translateX(440%); }
}
@media(prefers-reduced-motion:reduce) {
  #twocode-project-v2 .tc-progress-fill {
    transition:none;
  }
  #twocode-project-v2 .tc-progress-track:after {
    animation:none;
  }
}
#twocode-project-v2 .tc-error {
  color:#ffc1b7;
  font-size:9px;
  margin-bottom:4px;
  max-height:43px;
  overflow:auto;
}
#twocode-project-v2 .tc-compose {
  display:flex;
  gap:7px;
  flex:none;
  margin-top:5px;
  align-items:flex-end;
}
#twocode-project-v2 textarea {
  flex:1;
  min-width:0;
  resize:none;
  min-height:36px;
  max-height:64px;
  border:1px solid #414d38;
  border-radius:13px;
  background:#171e14;
  color:#eff5e8;
  padding:9px 11px;
  font:10px/15px Arial,sans-serif;
  outline:none;
}
#twocode-project-v2 textarea:focus {
  border-color:#c6e994;
}
#twocode-project-v2 .tc-primary {
  background:#c6e994;
  color:#11170c;
  min-height:36px;
}
#twocode-project-v2 .tc-primary:hover {
  background:#ddf8b9;
}
`;

  document.head.appendChild(style);

  const esc = text =>
    String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  function focused(value) {
    try {
      projectInputFocused = value;
      if (value) sendInteractive(true);
    } catch {}
  }

  root.addEventListener('focusin', () => focused(true));

  root.addEventListener('focusout', () => {
    setTimeout(() => {
      focused(root.contains(document.activeElement));
    }, 0);
  });

  function scroll() {
    requestAnimationFrame(() => {
      const box = root.querySelector('.tc-messages');
      if (box) box.scrollTop = box.scrollHeight;
    });
  }

  window.__twocodeProjectIndicator ||= { state: 'idle' };

  function setIndicator(state) {
    window.__twocodeProjectIndicator = {
      state,
      at: Date.now()
    };
  }

  function begin(text) {
    setIndicator('running');
    busy = true;
    error = '';
    status = text;
    percent = 0;
    waiting = true;
    progressState = 'running';
    startedAt = performance.now();
    elapsed = 0;
  }

  function finish(ok, text, answer = '') {
    setIndicator(
      !ok
        ? 'error'
        : /\?\s*(?:$|\n)/.test(answer)
          ? 'question'
          : 'ready'
    );

    elapsed = Math.floor(
      (performance.now() - startedAt) / 1000
    );

    busy = false;
    waiting = false;
    progressState = ok ? 'done' : 'error';

    if (ok) {
      percent = 100;
      status = text;
    } else if (!status.startsWith('Gestopt')) {
      status = 'Gestopt · ' + status;
    }
  }

  function meta() {
    return `${percent}% van stappen · ${elapsed}s`;
  }

  function updateProgress() {
    const text = root.querySelector('.tc-status');
    if (text) text.textContent = status;

    const label = root.querySelector('.tc-progress-meta');
    if (label) label.textContent = meta();

    const fill = root.querySelector('.tc-progress-fill');
    if (fill) fill.style.width = `${percent}%`;

    const track = root.querySelector('.tc-progress-track');
    if (track) {
      track.setAttribute('aria-valuenow', String(percent));
    }

    const box = root.querySelector('.tc-progress');

    if (box) {
      box.classList.toggle(
        'tc-progress-waiting',
        busy && waiting
      );

      box.classList.toggle(
        'tc-progress-error',
        progressState === 'error'
      );
    }
  }

  async function load() {
    try {
      const selected = await window.twocode.projectV2Get();

      if (!selected?.ok) {
        throw new Error(
          selected?.error || 'Project kon niet worden geladen.'
        );
      }

      ai = await window.twocode.projectV2AiStatus();

      if (!selected.selected) {
        project = null;
        messages = [];
        canUndo = false;
        return;
      }

      const result = await window.twocode.projectAgentGet();

      if (!result?.ok) {
        throw new Error(
          result?.error || 'Projectchat kon niet worden geladen.'
        );
      }

      project = result.project;
      messages = result.messages || [];
      canUndo = Boolean(result.undo);
    } catch (failure) {
      error = failure.message;
    } finally {
      loaded = true;
      render();
    }
  }

  async function choose() {
    if (busy) return;
    error = '';

    try {
      const result = await window.twocode.projectV2Choose();

      if (result?.cancelled) return;

      if (!result?.ok) {
        throw new Error(
          result?.error || 'Projectmap kiezen is mislukt.'
        );
      }

      draft = '';
      progressState = 'idle';
      status = '';
      percent = 0;

      await load();
      await openCode();
    } catch (failure) {
      error = failure.message;
      render();
    }
  }

  async function openCode() {
    if (busy || !project) return;

    try {
      const result = await window.twocode.projectAgentOpen();

      if (!result?.ok) {
        throw new Error(
          result?.error || 'VS Code openen is mislukt.'
        );
      }
    } catch (failure) {
      error = failure.message;
      render();
    }
  }

  async function send() {
    if (
      busy ||
      !project ||
      !ai?.ready ||
      !draft.trim()
    ) {
      return;
    }

    const request = draft.trim();
    draft = '';

    begin('Project controleren…');

    messages.push({
      role: 'user',
      text: request
    });

    render();
    scroll();

    let ok = false;
    let done = '';
    let answer = '';

    try {
      const result = await window.twocode.projectAgentSend(
        request
      );

      answer = result?.answer || '';

      if (result?.messages) {
        messages = result.messages;
      }

      if (result?.undo) {
        canUndo = true;
      }

      if (!result?.ok) {
        throw new Error(
          result?.error || 'De opdracht is gestopt.'
        );
      }

      ok = true;

      done = result.applied
        ? '✓ Wijzigingen opgeslagen'
        : '✓ Analyse klaar';
    } catch (failure) {
      error = failure.message;
    } finally {
      finish(ok, done, answer);
      render();
      scroll();
    }
  }

  async function undo() {
    if (busy || !canUndo) return;

    begin('Backups controleren…');
    render();

    let ok = false;

    try {
      const result = await window.twocode.projectAgentUndo();

      if (!result?.ok) {
        throw new Error(
          result?.error || 'Terugdraaien is gestopt.'
        );
      }

      messages = result.messages || [];
      canUndo = false;
      ok = true;
    } catch (failure) {
      error = failure.message;
    } finally {
      finish(ok, '✓ Vorige opdracht teruggedraaid');
      render();
      scroll();
    }
  }

  function settings() {
    localStorage.setItem('twocode:settings-tab', 'ai');

    window.dispatchEvent(
      new CustomEvent('twocode:open-ai-settings')
    );

    try {
      setView('settings');
    } catch {}
  }

  function render() {
    const ready = Boolean(ai?.ready);

    root.innerHTML = `
      <div class="tc-shell">
        <div class="tc-head">
          <div class="tc-heading">
            <div class="tc-label">PROJECT · HELE MAP</div>
            <div class="tc-title">
              ${esc(project?.name || 'Project koppelen')}
            </div>
          </div>

          ${project ? `
            <button
              type="button"
              id="tc-agent-open"
              ${busy ? 'disabled' : ''}
            >VS Code</button>
          ` : ''}

          ${canUndo ? `
            <button
              type="button"
              id="tc-agent-undo"
              ${busy ? 'disabled' : ''}
            >Ongedaan maken</button>
          ` : ''}

          <button
            type="button"
            id="tc-agent-choose"
            ${busy ? 'disabled' : ''}
          >${project ? 'Andere map' : 'Kies map'}</button>
        </div>

        <div class="tc-messages">
          ${messages.length
            ? messages.map(message => `
              <div class="tc-message ${
                message.role === 'user' ? 'tc-user' : ''
              }">${esc(message.text)}</div>
            `).join('')
            : `
              <div class="tc-empty">
                <strong>${
                  project
                    ? 'Wat wil je veranderen?'
                    : 'Koppel je projectmap'
                }</strong>
                <div class="tc-muted">${
                  project
                    ? 'Beschrijf je idee. TwoCode kiest zelf de juiste bestanden, opent ze in VS Code en voert je opdracht uit.'
                    : 'Kies één lokale map. Daarna praat je met TwoCode over het hele project.'
                }</div>
              </div>
            `
          }
        </div>

        ${error ? `
          <div class="tc-error">${esc(error)}</div>
        ` : ''}

        ${progressState !== 'idle' ? `
          <div class="tc-progress ${
            busy && waiting ? 'tc-progress-waiting' : ''
          } ${
            progressState === 'error' ? 'tc-progress-error' : ''
          }">
            <div class="tc-progress-row">
              <div
                class="tc-status"
                role="status"
                aria-live="polite"
              >${esc(status)}</div>
              <span class="tc-progress-meta">${meta()}</span>
            </div>

            <div
              class="tc-progress-track"
              role="progressbar"
              aria-label="Voortgang van werkstappen"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${percent}"
            >
              <div
                class="tc-progress-fill"
                style="width:${percent}%"
              ></div>
            </div>
          </div>
        ` : ''}

        ${project && !ready ? `
          <button type="button" id="tc-agent-ai">
            Open Instellingen → AI
          </button>
        ` : ''}

        ${project && ready ? `
          <div class="tc-compose">
            <textarea
              rows="1"
              maxlength="5000"
              placeholder="Bijvoorbeeld: maak de Spotify-balk rustiger"
              ${busy ? 'disabled' : ''}
            ></textarea>

            <button
              type="button"
              class="tc-primary"
              id="tc-agent-send"
              ${busy ? 'disabled' : ''}
            >Verstuur</button>
          </div>
        ` : ''}
      </div>
    `;

    root.querySelector('#tc-agent-choose')
      ?.addEventListener('click', choose);

    root.querySelector('#tc-agent-open')
      ?.addEventListener('click', openCode);

    root.querySelector('#tc-agent-undo')
      ?.addEventListener('click', undo);

    root.querySelector('#tc-agent-ai')
      ?.addEventListener('click', settings);

    root.querySelector('#tc-agent-send')
      ?.addEventListener('click', send);

    const input = root.querySelector('textarea');

    if (input) {
      input.value = draft;

      input.addEventListener('input', () => {
        draft = input.value;
      });

      input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          send();
        }
      });
    }
  }

  window.twocode.onProjectAgentProgress(data => {
    if (data.root !== project?.path || !busy) return;

    status = data.text;

    if (Number.isFinite(data.percent)) {
      percent = Math.max(
        percent,
        Math.min(99, Math.max(0, Math.floor(data.percent)))
      );
    }

    waiting = data.waiting !== false;
    updateProgress();
  });

  window.addEventListener(
    'twocode:ai-settings-changed',
    async () => {
      try {
        ai = await window.twocode.projectV2AiStatus();
      } catch (failure) {
        error = failure.message;
      }

      render();
    }
  );

  try {
    drawProject = function (area) {
      const x = area.x + 43;
      const y = area.y + area.height / 2;

      drawGhost(x, y, 58);

      hit.ghost = {
        x: x - 40,
        y: y - 36,
        width: 80,
        height: 72
      };
    };
  } catch {}

  function loop() {
    if (busy) {
      const seconds = Math.floor(
        (performance.now() - startedAt) / 1000
      );

      if (seconds !== elapsed) {
        elapsed = seconds;

        const label = root.querySelector('.tc-progress-meta');
        if (label) label.textContent = meta();
      }
    }

    let show = false;

    try {
      show =
        currentView === 'project' &&
        mode === 'expanded' &&
        visual.width > 600 &&
        visual.height > 230;
    } catch {}

    if (show) {
      const area = contentRect();

      root.style.display = 'block';
      root.style.left = `${area.x + 88}px`;
      root.style.top = `${area.y}px`;
      root.style.width = `${Math.max(100, area.width - 88)}px`;
      root.style.height = `${area.height}px`;

      if (!visible) {
        visible = true;
        if (!loaded) load();
      }
    } else {
      root.style.display = 'none';

      if (visible) {
        visible = false;
        focused(false);
      }
    }

    try {
      if (projectInput.style.display !== 'none') projectInput.style.display = 'none';
    } catch {}

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
