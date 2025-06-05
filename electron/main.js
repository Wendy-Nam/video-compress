const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

// ----- App Configuration -----
const isProd = app.isPackaged;
const DEFAULT_PORT = 3000;
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || `http://localhost:${DEFAULT_PORT}`;

// Extract port from NEXT_PUBLIC_URL, fallback to DEFAULT_PORT if not present
function getPortFromUrl(url, fallbackPort) {
  try {
    const u = new URL(url);
    return u.port ? parseInt(u.port, 10) : fallbackPort;
  } catch {
    return fallbackPort;
  }
}

const PORT = getPortFromUrl(NEXT_PUBLIC_URL, DEFAULT_PORT);

// ----- Utility: Wait for Port -----
function waitForPort(port, host = 'localhost', timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      const socket = net.connect(port, host, () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(check, 300);
        }
      });
    })();
  });
}

// ----- Create Electron Window -----
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL(NEXT_PUBLIC_URL);

  // Only open DevTools in development
  // if (!isProd) win.webContents.openDevTools();

  win.once('ready-to-show', () => win.show());

  win.webContents.on('did-fail-load', (code, desc) => {
    console.error('💥 Load failed:', code, desc);
  });
}

let nextProcess;

app.whenReady().then(async () => {
  if (!isProd) {
    // Only use the port from .env.local (do not auto-increment)
    try {
      await waitForPort(PORT, 'localhost', 1000);
      console.log(`Next.js server already running on port ${PORT}`);
    } catch {
      nextProcess = spawn('npm', ['run', 'start', '--', '-p', String(PORT)], {
        cwd: app.getAppPath(),
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, PORT: String(PORT), NEXT_PUBLIC_URL }
      });
      try {
        await waitForPort(PORT);
      } catch (e) {
        console.error('❌ Failed to connect:', e);
        app.quit();
        return;
      }
    }
  }
  createWindow();
});

// ----- Cleanup -----
// Kill Next.js server on quit
app.on('before-quit', () => {
  if (nextProcess) nextProcess.kill();
});

// Quit app when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});