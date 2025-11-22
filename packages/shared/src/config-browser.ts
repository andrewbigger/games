/**
 * Browser-compatible config functions that use Electron IPC
 * These are used when running in the renderer process
 */

export type { Player, Character } from './config';

// Type definition for the Electron API exposed via preload script
declare global {
  interface Window {
    electronAPI?: {
      config: {
        get: (gameName: string, configName: string) => Promise<unknown | undefined>;
        set: (gameName: string, configName: string, value: unknown) => Promise<void>;
        getGlobal: (configName: string) => Promise<unknown | undefined>;
        setGlobal: (configName: string, value: unknown) => Promise<void>;
      };
      avatar: {
        pickFile: () => Promise<{ filePath: string; buffer: number[] } | null>;
        save: (uuid: string, fileBuffer: number[]) => Promise<string>;
        read: (filePath: string) => Promise<number[]>;
        getPath: (uuid: string) => Promise<string>;
      };
      app: {
        quit: () => Promise<void>;
      };
    };
  }
}

/**
 * Gets a configuration value for a specific game (browser version)
 */
export async function getConfig(
  gameName: string,
  configName: string
): Promise<unknown | undefined> {
  if (!window.electronAPI?.config) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.electronAPI.config.get(gameName, configName);
}

/**
 * Sets a configuration value for a specific game (browser version)
 */
export async function setConfig(
  gameName: string,
  configName: string,
  value: unknown
): Promise<void> {
  if (!window.electronAPI?.config) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.electronAPI.config.set(gameName, configName, value);
}

/**
 * Gets a global configuration value (browser version)
 */
export async function getGlobalConfig(
  configName: string
): Promise<unknown | undefined> {
  if (!window.electronAPI?.config) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.electronAPI.config.getGlobal(configName);
}

/**
 * Sets a global configuration value (browser version)
 */
export async function setGlobalConfig(
  configName: string,
  value: unknown
): Promise<void> {
  if (!window.electronAPI?.config) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.electronAPI.config.setGlobal(configName, value);
}

/**
 * Picks an avatar file using the file dialog
 */
export async function pickAvatarFile(): Promise<{ filePath: string; buffer: Uint8Array } | null> {
  if (!window.electronAPI?.avatar) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  const result = await window.electronAPI.avatar.pickFile();
  if (!result) return null;
  return {
    filePath: result.filePath,
    buffer: new Uint8Array(result.buffer)
  };
}

/**
 * Saves an avatar file for a player
 */
export async function saveAvatarFile(uuid: string, fileBuffer: Uint8Array): Promise<string> {
  if (!window.electronAPI?.avatar) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.electronAPI.avatar.save(uuid, Array.from(fileBuffer));
}

/**
 * Reads an avatar file
 */
export async function readAvatarFile(filePath: string): Promise<Uint8Array> {
  if (!window.electronAPI?.avatar) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  const buffer = await window.electronAPI.avatar.read(filePath);
  return new Uint8Array(buffer);
}

/**
 * Gets the path for an avatar file given a UUID
 */
export async function getAvatarPath(uuid: string): Promise<string> {
  if (!window.electronAPI?.avatar) {
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.electronAPI.avatar.getPath(uuid);
}

/**
 * Converts a file buffer to a data URL for preview
 */
export function bufferToDataURL(buffer: Uint8Array, mimeType: string = 'image/png'): string {
  // Create a copy of the buffer as a regular array to avoid type issues
  const array = Array.from(buffer);
  const blob = new Blob([new Uint8Array(array)], { type: mimeType });
  return URL.createObjectURL(blob);
}

