const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, session, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { BpmClient, isApiConfigured } = require("./bpm-client.cjs");
const { BPM_ORIGIN } = require("./bpm-contract.cjs");

const WIDTH = 215;
const HEIGHT = 487;
const PARTITION = "persist:bpm";
const DEV_URL = process.env.ELECTRON_DEV_URL;

let win = null;
let loginWin = null;
let tray = null;
let bpm = null;
let dragTimer = null;
let isQuitting = false;

const state = { desktop: true, apiConfigured: isApiConfigured(), loggedIn: false, timer: null, error: null };

// ---------- tiny settings store ----------
const settingsFile = () => path.join(app.getPath("userData"), "settings.json");
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsFile(), "utf8")); } catch { return {}; }
}
function saveSettings(patch) {
  const s = { ...loadSettings(), ...patch };
  try { fs.writeFileSync(settingsFile(), JSON.stringify(s)); } catch { /* ignore */ }
}

// ---------- helpers ----------
function isBpmUrl(url) {
  try { return new URL(url).origin === BPM_ORIGIN; } catch { return false; }
}
function openBpm(p) {
  const target = BPM_ORIGIN + "/" + (p || "").replace(/^\/+/, "");
  if (isBpmUrl(target)) shell.openExternal(target);
}
function broadcast() {
  if (win && !win.isDestroyed()) win.webContents.send("bpm:state", { ...state });
  updateTray();
}
function errCode(e) {
  return { code: e && e.code ? e.code : "BPM_ERROR", message: e && e.message ? e.message : String(e) };
}

async function refresh() {
  try {
    state.loggedIn = await bpm.isLoggedIn();
    state.apiConfigured = isApiConfigured();
    state.error = null;
    if (state.apiConfigured && state.loggedIn) state.timer = await bpm.getCurrentTimer();
  } catch (e) {
    state.error = errCode(e);
  }
  broadcast();
  return { ...state };
}

// ---------- window placement ----------
function placeWindow(side, y) {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const wa = display.workArea;
  const clampedY = Math.max(wa.y, Math.min(y ?? wa.y + 40, wa.y + wa.height - HEIGHT));
  const x = side === "left" ? wa.x : wa.x + wa.width - WIDTH;
  win.setBounds({ x, y: Math.round(clampedY), width: WIDTH, height: HEIGHT });
  win.webContents.send("win:side", side);
}

function hardenContents(contents) {
  contents.setWindowOpenHandler(({ url }) => {
    if (isBpmUrl(url)) shell.openExternal(url);
    return { action: "deny" };
  });
}

function createWindow() {
  const s = loadSettings();
  win = new BrowserWindow({
    width: WIDTH, height: HEIGHT, frame: false, transparent: true, backgroundColor: "#00000000",
    alwaysOnTop: true, resizable: false, maximizable: false, minimizable: false, fullscreenable: false,
    skipTaskbar: true, hasShadow: false, show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true,
    },
  });
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true);
  hardenContents(win.webContents);
  win.webContents.on("will-navigate", (e, url) => {
    if (!(DEV_URL && url.startsWith(DEV_URL))) e.preventDefault();
  });

  if (DEV_URL) win.loadURL(DEV_URL);
  else win.loadFile(path.join(__dirname, "../dist/index.html"));

  win.webContents.on("did-finish-load", () => {
    placeWindow(s.side || "right", s.y);
    win.setIgnoreMouseEvents(true, { forward: true });
    broadcast();
  });
  win.once("ready-to-show", () => win.show());
  win.on("close", (e) => {
    if (!isQuitting) { e.preventDefault(); win.hide(); updateTray(); }
  });
}

function openLogin() {
  if (loginWin && !loginWin.isDestroyed()) { loginWin.focus(); return; }
  loginWin = new BrowserWindow({
    width: 900, height: 720, title: "Log in to ZoomCharts BPM", autoHideMenuBar: true,
    webPreferences: { partition: PARTITION, nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  hardenContents(loginWin.webContents); // SSO redirects navigate in-place; popups denied
  loginWin.loadURL(BPM_ORIGIN + "/login");
  loginWin.on("closed", () => { loginWin = null; refresh(); });
}

// ---------- tray ----------
function getLaunchAtStartup() {
  return app.getLoginItemSettings().openAtLogin;
}
function setLaunchAtStartup(enabled) {
  app.setLoginItemSettings({ openAtLogin: !!enabled });
  updateTray();
  return getLaunchAtStartup();
}
function toggleWindow() {
  if (!win) return;
  win.isVisible() ? win.hide() : win.show();
  updateTray();
}
function updateTray() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: win && win.isVisible() ? "Hide widget" : "Show widget", click: toggleWindow },
    { label: "Open BPM", click: () => openBpm("") },
    { label: state.loggedIn ? "Re-login to BPM" : "Log in to BPM", click: openLogin },
    { type: "separator" },
    { label: "Launch at Windows startup", type: "checkbox", checked: getLaunchAtStartup(), click: (i) => setLaunchAtStartup(i.checked) },
    { type: "separator" },
    { label: "Quit", click: () => { isQuitting = true; app.quit(); } },
  ]));
}
function createTray() {
  const iconPath = path.join(__dirname, "../dist/favicon.ico");
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) icon = nativeImage.createFromPath(path.join(__dirname, "../public/favicon.ico"));
  tray = new Tray(icon);
  tray.setToolTip("ZoomCharts BPM Quick Timer");
  tray.on("click", toggleWindow);
  updateTray();
}

// ---------- IPC ----------
function registerIpc() {
  ipcMain.handle("bpm:getState", () => ({ ...state }));
  ipcMain.handle("bpm:refresh", () => refresh());
  ipcMain.handle("bpm:login", () => { openLogin(); return true; });
  ipcMain.handle("bpm:open", (_e, p) => { openBpm(p); return true; });
  ipcMain.handle("bpm:listTasks", async () => {
    try { return { ok: true, tasks: await bpm.listMyTasks() }; } catch (e) { return { ok: false, error: errCode(e) }; }
  });
  ipcMain.handle("bpm:start", async (_e, projectId) => {
    try {
      await bpm.startTimer(projectId);
      await refresh();
      return { ok: true };
    } catch (e) { state.error = errCode(e); broadcast(); return { ok: false, error: state.error }; }
  });
  ipcMain.handle("bpm:stop", async () => {
    try {
      if (!state.timer) throw Object.assign(new Error("No running BPM timer"), { code: "BPM_NO_TIMER" });
      await bpm.stopTimer(state.timer.id);
      await refresh();
      return { ok: true };
    } catch (e) { state.error = errCode(e); broadcast(); return { ok: false, error: state.error }; }
  });
  ipcMain.handle("app:getLaunchAtStartup", () => getLaunchAtStartup());
  ipcMain.handle("app:setLaunchAtStartup", (_e, on) => setLaunchAtStartup(on));

  ipcMain.on("win:setInteractive", (_e, on) => {
    if (win) win.setIgnoreMouseEvents(!on, { forward: true });
  });
  ipcMain.on("win:dragStart", () => {
    if (!win || dragTimer) return;
    const offsetY = screen.getCursorScreenPoint().y - win.getBounds().y;
    let side = loadSettings().side || "right";
    dragTimer = setInterval(() => {
      const c = screen.getCursorScreenPoint();
      const wa = screen.getDisplayNearestPoint(c).workArea;
      side = c.x < wa.x + wa.width / 2 ? "left" : "right";
      placeWindow(side, c.y - offsetY);
    }, 16);
  });
  ipcMain.on("win:dragEnd", () => {
    if (!dragTimer) return;
    clearInterval(dragTimer);
    dragTimer = null;
    const b = win.getBounds();
    const wa = screen.getDisplayMatching(b).workArea;
    saveSettings({ side: b.x <= wa.x ? "left" : "right", y: b.y });
  });
}

// ---------- app lifecycle ----------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => { if (win) { win.show(); updateTray(); } });
  app.setAppUserModelId("com.zoomcharts.bpmtimer");

  app.on("web-contents-created", (_e, contents) => {
    contents.on("will-attach-webview", (ev) => ev.preventDefault());
  });

  app.whenReady().then(() => {
    const bpmSession = session.fromPartition(PARTITION);
    bpm = new BpmClient(bpmSession);
    bpmSession.cookies.on("changed", () => refresh());
    registerIpc();
    createWindow();
    createTray();
    refresh();
    setInterval(refresh, 30000);
  });

  app.on("before-quit", () => { isQuitting = true; });
  app.on("window-all-closed", () => { /* keep running in tray */ });
}
