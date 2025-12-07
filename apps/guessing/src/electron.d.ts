// Type definitions for Electron API
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

export {};


