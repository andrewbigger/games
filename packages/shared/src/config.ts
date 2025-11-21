import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.games');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * Player interface for global configuration
 */
export type Player = {
  id: string; // UUID for the player
  name: string;
  avatar: string; // Path to avatar file (e.g., $HOME/.games/players/{uuid}.png)
};

/**
 * Character interface for global configuration (same structure as Player)
 */
export type Character = Player;

interface GlobalConfig {
  players?: Player[];
  characters?: Character[];
  [configName: string]: unknown;
}

interface ConfigStructure {
  global?: GlobalConfig;
  [gameName: string]: {
    [configName: string]: unknown;
  } | GlobalConfig | undefined;
}

/**
 * Ensures the config directory and file exist
 */
async function ensureConfigFile(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }

  try {
    await fs.access(CONFIG_FILE);
  } catch {
    // File doesn't exist, create it with empty config
    await fs.writeFile(CONFIG_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

/**
 * Reads the configuration file
 */
async function readConfig(): Promise<ConfigStructure> {
  await ensureConfigFile();
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as ConfigStructure;
  } catch (error) {
    // If read fails, return empty config
    return {};
  }
}

/**
 * Writes the configuration file
 */
async function writeConfig(config: ConfigStructure): Promise<void> {
  await ensureConfigFile();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Gets a configuration value for a specific game
 * @param gameName - The name of the game
 * @param configName - The name of the configuration property
 * @returns The configuration value, or undefined if not found
 */
export async function getConfig(
  gameName: string,
  configName: string
): Promise<unknown | undefined> {
  const config = await readConfig();
  return config[gameName]?.[configName];
}

/**
 * Sets a configuration value for a specific game
 * @param gameName - The name of the game
 * @param configName - The name of the configuration property
 * @param value - The value to set
 */
export async function setConfig(
  gameName: string,
  configName: string,
  value: unknown
): Promise<void> {
  const config = await readConfig();
  
  // Initialize game config if it doesn't exist
  if (!config[gameName]) {
    config[gameName] = {};
  }
  
  // Set the config value
  if (typeof config[gameName] === 'object' && config[gameName] !== null && !Array.isArray(config[gameName])) {
    config[gameName][configName] = value;
  }
  
  // Write back to file
  await writeConfig(config);
}

/**
 * Gets a global configuration value
 * @param configName - The name of the global configuration property
 * @returns The configuration value, or undefined if not found
 */
export async function getGlobalConfig(
  configName: string
): Promise<unknown | undefined> {
  const config = await readConfig();
  return config.global?.[configName];
}

/**
 * Sets a global configuration value
 * @param configName - The name of the global configuration property
 * @param value - The value to set
 */
export async function setGlobalConfig(
  configName: string,
  value: unknown
): Promise<void> {
  const config = await readConfig();
  
  // Initialize global config if it doesn't exist
  if (!config.global) {
    config.global = {};
  }
  
  // Set the config value
  config.global[configName] = value;
  
  // Write back to file
  await writeConfig(config);
}

