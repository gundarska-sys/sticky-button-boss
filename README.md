# ZoomCharts BPM Quick Timer

Always-on-top Windows edge widget for the ZoomCharts BPM timer (Electron).

## Windows developer commands

```powershell
npm install
npm run desktop:dev     # Vite on http://localhost:8080 + Electron window
npm run desktop:build   # vite build + electron-builder --win nsis
```

The NSIS installer appears in `release\ZoomCharts BPM Quick Timer Setup <version>.exe`
(per-user install, Start Menu + Desktop shortcut). `npm run desktop:pack` builds an unpacked
app in `release\win-unpacked\` for quick testing. `npm run build` is the plain web build.

Icon: `public/favicon.ico` is a temporary icon. Replace it with a 256x256 `build/icon.ico`
and set `build.win.icon` in `package.json` to `build/icon.ico`. Unsigned builds trigger
SmartScreen until code-signed.

## Features

- 215x487 frameless, transparent, always-on-top widget; snaps to left/right screen edge, remembers position.
- Tray: Show/Hide, Open BPM, Log in to BPM, Launch at Windows startup, Quit. Closing hides; single instance.
- Login uses the real BPM page (`/login`) in a window with a persistent `persist:bpm` session.
  Cookies never reach the widget UI; no credentials are stored by the app.

## Finishing the BPM adapter (remaining step)

The BPM app code is only served after login, so the private timer API could not be verified.
Until it is filled in, the widget shows "BPM timer sync setup needed" and START stays disabled.

1. Log in to https://bpm.zoomcharts.com:9000 in Chrome, open DevTools -> Network (Fetch/XHR).
2. Capture these four requests (method, path, request body, response JSON, any CSRF header):
   - page load / My Tasks: the request returning **the currently running timer**
   - My Tasks: the request returning **your active tasks/projects**
   - press Start on a task: the request that **starts the timer**
   - press Stop: the request that **stops/commits the timer**
3. Put method + path in `electron/bpm-contract.cjs` (`BPM_ENDPOINTS`).
4. In `electron/bpm-client.cjs`, map responses to `{ id, projectId, projectName, startedAt }`
   (timer) and `{ id, name, projectName }` (task), and build the start/stop bodies.
   Add a CSRF header in `request()` if BPM requires one.
