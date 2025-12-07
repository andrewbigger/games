const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// APIs without exposing Node.js directly
contextBridge.exposeInMainWorld('electronAPI', {
  // Config API
  config: {
    get: (gameName, configName) => ipcRenderer.invoke('config:get', gameName, configName),
    set: (gameName, configName, value) => ipcRenderer.invoke('config:set', gameName, configName, value),
    getGlobal: (configName) => ipcRenderer.invoke('config:getGlobal', configName),
    setGlobal: (configName, value) => ipcRenderer.invoke('config:setGlobal', configName, value),
  },
  // Avatar file API
  avatar: {
    pickFile: () => ipcRenderer.invoke('avatar:pickFile'),
    save: (uuid, fileBuffer) => ipcRenderer.invoke('avatar:save', uuid, fileBuffer),
    read: (filePath) => ipcRenderer.invoke('avatar:read', filePath),
    getPath: (uuid) => ipcRenderer.invoke('avatar:getPath', uuid),
  },
  // App API
  app: {
    quit: () => ipcRenderer.invoke('app:quit'),
  },
});

