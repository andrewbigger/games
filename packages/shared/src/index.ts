/**
 * Example utility function
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Example type definition
 */
export interface GameConfig {
  title: string;
  version: string;
  width?: number;
  height?: number;
}

/**
 * Example constant
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  title: 'Untitled Game',
  version: '1.0.0',
  width: 800,
  height: 600
};

/**
 * Configuration management functions
 * These use Electron IPC when running in the renderer process
 */
export { getConfig, setConfig, getGlobalConfig, setGlobalConfig, pickAvatarFile, saveAvatarFile, readAvatarFile, getAvatarPath, bufferToDataURL } from './config-browser';
export type { Player, Character } from './config';

/**
 * Player management modal component
 */
export { PlayerModal } from './PlayerModal';

/**
 * Character management modal component
 */
export { CharacterModal } from './CharacterModal';

