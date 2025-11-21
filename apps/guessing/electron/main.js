import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { getConfig, setConfig, getGlobalConfig, setGlobalConfig } from '@games/shared/node-config';

console.log('Electron main.js loaded');
console.log('NODE_ENV:', process.env.NODE_ENV);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('__dirname:', __dirname);

let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
console.log('isDev:', isDev);

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Guessing',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for config operations
ipcMain.handle('config:get', async (_event, gameName, configName) => {
  try {
    return await getConfig(gameName, configName);
  } catch (error) {
    console.error('Error in config:get:', error);
    throw error;
  }
});

ipcMain.handle('config:set', async (_event, gameName, configName, value) => {
  try {
    await setConfig(gameName, configName, value);
  } catch (error) {
    console.error('Error in config:set:', error);
    throw error;
  }
});

ipcMain.handle('config:getGlobal', async (_event, configName) => {
  try {
    return await getGlobalConfig(configName);
  } catch (error) {
    console.error('Error in config:getGlobal:', error);
    throw error;
  }
});

ipcMain.handle('config:setGlobal', async (_event, configName, value) => {
  try {
    await setGlobalConfig(configName, value);
  } catch (error) {
    console.error('Error in config:setGlobal:', error);
    throw error;
  }
});

// IPC handlers for avatar file operations
const PLAYERS_DIR = path.join(homedir(), '.games', 'players');

async function ensurePlayersDir() {
  try {
    await fs.mkdir(PLAYERS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating players directory:', error);
    throw error;
  }
}

ipcMain.handle('avatar:save', async (_event, uuid, fileBuffer) => {
  try {
    await ensurePlayersDir();
    const avatarPath = path.join(PLAYERS_DIR, `${uuid}.png`);
    await fs.writeFile(avatarPath, Buffer.from(fileBuffer));
    return avatarPath;
  } catch (error) {
    console.error('Error saving avatar:', error);
    throw error;
  }
});

ipcMain.handle('avatar:read', async (_event, filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return Array.from(buffer); // Convert to array for IPC transfer
  } catch (error) {
    console.error('Error reading avatar:', error);
    throw error;
  }
});

ipcMain.handle('avatar:pickFile', async (_event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const buffer = await fs.readFile(filePath);
    return {
      filePath,
      buffer: Array.from(buffer)
    };
  } catch (error) {
    console.error('Error picking avatar file:', error);
    throw error;
  }
});

ipcMain.handle('avatar:getPath', async (_event, uuid) => {
  return path.join(PLAYERS_DIR, `${uuid}.png`);
});

app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();
  console.log('Window created');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

console.log('Electron app setup complete, waiting for ready...');

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

