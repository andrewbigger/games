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
 */
export { getConfig, setConfig, getGlobalConfig, setGlobalConfig, Player } from './config';

