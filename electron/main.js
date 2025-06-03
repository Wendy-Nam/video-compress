const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');
const PORT = process.env.PORT || 4000;

function waitForPort(port, host = 'localhost', timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      const socket = net.connect(port, host, () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for port ' + port));
        } else {
          setTimeout(check, 300);
        }
      });
    }
    check();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(async () => {
  // Start Next.js server in the background with the specified PORT
  // Use the dedicated electron-server-start script
  nextProcess = spawn('npm', ['run', 'electron-server-start'], {
    cwd: app.getAppPath(),
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PORT }, // Pass PORT to child process
  });
  // Wait until the specified port is open before creating the window
  try {
    await waitForPort(PORT);
    createWindow();
  } catch (e) {
    console.error(e);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});