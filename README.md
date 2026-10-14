<p align="center"><img src="assets/icon-256.png" width="120" alt="Robo"></p>

<h1 align="center">TwoCode</h1>
<p align="center"><b>A Dynamic Island for Windows, with Robo living inside it.</b><br>
Robo shows what Claude Code is doing, asks before your AI does something important, and tells you when the work is done.</p>

---

## Download (Windows)

1. Go to **[Releases](../../releases/latest)** and download **`TwoCode-Windows.zip`**.
2. Right-click the zip → **Extract All…** (for example to `Documents\TwoCode`).
3. Open the `TwoCode` folder and double-click **`TwoCode.exe`**.
4. Windows may show *"Windows protected your PC"*, because the app is new and not signed yet. Click **More info → Run anyway**.

The island appears at the top of your screen and Robo says hi. That's it: no installer, no account.

**Tip:** right-click Robo next to the clock (bottom right) → **Start with Windows**, so TwoCode is always there.

### Closing TwoCode

- The **⏻ button** in the top right of the island → *Quit TwoCode?* → **Yes, quit**, or
- Right-click **Robo next to the clock** → **Quit TwoCode**.

### Updating

Download the new zip from Releases, quit TwoCode, and replace the old folder with the new one. Your settings stay.

---

## What it does

| | |
| --- | --- |
| **Claude Code, live** | See which file Claude reads, what it edits and which command it runs |
| **Allow in one click** | Claude asks permission (say for `git push`)? Allow or Deny right in the island |
| **A sign when it's done** | A chime, a green light and an optional Windows notification |
| **5-hour limit** | A ring shows how much of your Claude limit you've used |
| **Tray, clipboard, note** | Drop files on the island, your last copies, one quick note |
| **Spotify and focus** | Music controls with a real sound wave, and a focus timer |
| **Robo** | Moods, outfits, colours. He blinks, dances to music and gets dizzy if you poke him |

Shortcuts: **Ctrl+Alt+T** opens TwoCode, **Ctrl+Alt+1–6** jumps straight to an app.

## Privacy

TwoCode runs on your own PC. It needs no TwoCode account and sends nothing about your code anywhere. Claude Code's status is read locally. Links you turn on yourself (Spotify, weather, a calendar link) talk directly to that service.

---

## Nederlands: zo download je TwoCode

1. Ga naar **[Releases](../../releases/latest)** en download **`TwoCode-Windows.zip`**.
2. Rechtsklik op de zip → **Alles uitpakken…**
3. Open de map `TwoCode` en dubbelklik op **`TwoCode.exe`**.
4. Zegt Windows *"Uw pc is beveiligd"*? Klik **Meer info → Toch uitvoeren**. Dat komt omdat de app nieuw is.

Afsluiten: de **⏻-knop** rechtsboven in de island, of rechtsklik op **Robo bij de klok** → TwoCode afsluiten.

---

## For developers

Needs [Node.js](https://nodejs.org) and Windows PowerShell 5.1.

```powershell
git clone <this repo>
cd twocode-assistent-electron
npm ci
npm start
```

`npm test` runs the tests. `tools/make-icon.cjs` redraws the app icon.

The ChatGPT project mode uses the optional Codex package: `npm install @openai/codex --include=optional`.

Website: [twocode.nl](https://twocode.nl) · Contact: info@twocode.nl
