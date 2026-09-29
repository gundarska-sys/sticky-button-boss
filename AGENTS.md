# Agent rules
- Electron main/preload are CommonJS `.cjs` because package.json is `type: module`.
- Verified BPM endpoints live only in `electron/bpm-contract.cjs`; never invent them.
- Renderer talks to BPM only via `window.bpm` (preload IPC); cookies stay in main.
- HashRouter, since Electron loads via file://.
