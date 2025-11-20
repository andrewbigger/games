const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// APIs without exposing Node.js directly
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs you want to expose to the renderer here
  // For example:
  // platform: process.platform,
});

