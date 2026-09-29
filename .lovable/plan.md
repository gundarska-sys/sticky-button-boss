# BPM Quick Timer – Windows Desktop App Plan

## What was verified

- `package.json`: `"type": "module"`, no `main`, no desktop scripts; `electron`, `electron-builder`, `vite-plugin-electron(-renderer)` are installed.
- `electron/main.js` / `preload.js` use `require()` → break under ESM. Window is 120x400 vs 215x487 widget.
- `src/pages/Index.tsx` contains "Timer Widget Demo" page content.
- `StickyTimer.tsx` timer is local-only; START/STOP don't call BPM; notifications/meetings are placeholders.
- BPM server (`tiny-http (Rust)`): `/` and `/api/` return `302 → /login`. `/login` is a static page with one link to `/dologin` (SSO-style redirect). Session cookie is `tbpmsid` (HttpOnly, Secure, SameSite=Lax). CSP `connect-src 'self'` plus `api.zoomcharts-cloud.com`, `echo.zoomcharts-cloud.com`.
- The app JavaScript is only served after login, so **the timer/task API contract could not be verified**. No endpoints are invented below.

## Missing information (needed from you or a BPM dev)

1. Endpoint + method + body for: get current running timer, start timer for a task/project, stop/commit timer, list my active tasks/projects.
2. Response shapes (IDs, project vs task relation, start timestamp, server time).
3. Whether API calls require a CSRF header/token in addition to `tbpmsid`.
4. What `/dologin` redirects to (Microsoft SSO?) and session lifetime.
5. Whether `api.zoomcharts-cloud.com` is used for timers or only `bpm...:9000`.

Easiest way to get 1–3: log in to BPM in Chrome, open DevTools → Network, start/stop a timer and open My Tasks, then export a HAR (remove cookies) or copy the request lines.

## Architecture (safe with unknown API)

```text
React widget (renderer, sandboxed, no Node)
   | window.bpm.* (contextBridge, typed, whitelisted)
Preload (ipcRenderer.invoke only)
   | IPC
Main process
   ├─ BpmSession: persistent partition "persist:bpm"
   │    login = BrowserWindow to https://bpm.zoomcharts.com:9000/login (real BPM/SSO page)
   │    cookie tbpmsid stays in Electron's encrypted cookie store, never exposed to renderer
   ├─ BpmClient: net.fetch with session partition, fixed origin allowlist
   │    methods: getCurrentTimer, startTimer(taskId), stopTimer(timerId), listTasks
   │    implemented only from verified contract; 401/302→/login ⇒ "needs login"
   ├─ Tray, window, autostart (app.setLoginItemSettings), single-instance lock
   └─ Store: last project id + widget side/y (electron-store/json in userData)
```

- No credentials stored or hard-coded; the user logs in on the real BPM page.
- Renderer never sees cookies; main only talks to `https://bpm.zoomcharts.com:9000`.
- Until the contract is confirmed, `BpmClient` ships behind an interface with a clear "BPM API not configured" state instead of a fake timer. Fallback if no usable JSON API exists: a hidden BPM window in the same session driven via its own UI calls (fragile; last resort only).

## Implementation steps

1. **Electron entry fix**: rename to `electron/main.cjs`, `electron/preload.cjs`; `package.json` `"main": "electron/main.cjs"`; delete stale `dist-electron/`; point `vite-plugin-electron` (or drop it for plain `electron .` dev) at the `.cjs` files.
2. **Scripts**: `electron:dev` (vite + electron against localhost:8080), `electron:build` (`vite build && electron-builder --win nsis`).
3. **electron-builder.json**: `files: dist/**, electron/**`, `win.target nsis`, `nsis: oneClick false, perMachine false, allowToChangeInstallationDirectory, createDesktopShortcut`, app icon `build/icon.ico`.
4. **Window**: 215x487, frameless, transparent, `alwaysOnTop('screen-saver')`, `skipTaskbar`, `resizable false`; renderer drag replaced by IPC `window:moveTo(side, y)` so the whole window snaps to left/right edge of the current display; click-through for transparent area via `setIgnoreMouseEvents(true, {forward:true})` toggled on hover.
5. **Close/Tray**: close hides; tray menu Show/Hide, Open BPM, Log in/out, Launch at startup (checkbox), Quit. Single-instance lock.
6. **Security**: `contextIsolation`, `sandbox: true`, `nodeIntegration: false`, CSP meta in `index.html`, `setWindowOpenHandler` → `shell.openExternal` only for BPM origin, block navigation.
7. **Preload API** `window.bpm`: `getState`, `login`, `start(taskId)`, `stop()`, `listTasks()`, `openBpm(path)`, `onStateChange(cb)`, window move/hover calls.
8. **Timer sync**: on launch and every ~30s + on focus, `getCurrentTimer`; widget displays elapsed from server start time (local tick only for rendering). Start with selected project; Stop commits the same timer id; errors shown in widget.
9. **Task picker**: compact list inside droplet (search, scroll, max ~6 rows), "Last: <project>" quick button, remembered in store; START disabled until a project is chosen. Project label replaces hard-coded "Marketing / Meetings".
10. **Cleanup**: `Index.tsx` renders only `StickyTimer` on transparent background; remove demo content; hide notification dot/meeting placeholders (kept out of first release).
11. **Web preview**: when `window.bpm` is absent, widget shows a "Desktop app only" state so the Lovable preview still renders.

## Delivery/testing

- Windows `.exe` must be built on Windows (or CI with `windows-latest`); this sandbox can produce the code but not a signed NSIS installer. Unsigned installer will trigger SmartScreen until code-signed.
- Steps 1–7, 9–11 can be built now; step 8 BPM calls are wired once the missing API details above are provided.
