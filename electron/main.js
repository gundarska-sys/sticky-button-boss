const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 120,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Position window on the right side of the screen
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  mainWindow.setPosition(width - 120, Math.floor(height / 2) - 200);

  // Prevent window from being closed, minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Make window draggable
  mainWindow.setIgnoreMouseEvents(false);
}

function createTray() {
  // Create a simple icon for the tray (you can replace with actual icon file)
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAERSURBVDiNpdM9S8NAGMDx/5O0KR1EqCAODg6Cg4uIk4OTk4OLX8DBr+Hk4OQHcHMRwUkQxMFBBBcHEQdBBEGQvpSm7eVyuSSNpgp94LjjHn4Pd9wjlFLM0QS4BnaANaAK2MAIeALugBvg/b+AABrABVAHzD8CU+AeOANe/hJoAJdAw9P9gLGmZwK1P5n5wLVvr5QCrPk0MUQRJVL0hn2ehm8AfqO/IIpgHDmkiYqBh2FHX9MXgDhSJImKkiRK7uf0QRAnoigllUpRLhdJkoSuO0VVZyRJQpJo+voaHxcVRQGg2WzSbrfZ39+i1WpRKOSpVMqsr29QrZYZDofE8YyMnSWeaFqtFuVymZ2dbebn8wCMx2MODg44Pj4GwPqe+QTyUoIXf/HunAAAAABJRU5ErkJggg==');
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sticky Timer');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent app from quitting when all windows are closed on macOS
app.on('before-quit', () => {
  app.isQuitting = true;
});
