// Shared persistence layer for serverless functions
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = '/tmp/nfl-pickem-data';
const LEAGUES_FILE = join(DATA_DIR, 'leagues.json');
const PICKS_FILE = join(DATA_DIR, 'picks.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredData<T> {
  data: T[];
  lastUpdated: string;
}

export class SharedStorage {
  private static initFile<T>(filePath: string): void {
    if (!existsSync(filePath)) {
      const initialData: StoredData<T> = {
        data: [],
        lastUpdated: new Date().toISOString()
      };
      writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      console.log(`📁 Initialized storage file: ${filePath}`);
    }
  }

  static saveLeagues(leagues: any[]): void {
    try {
      this.initFile(LEAGUES_FILE);
      const storageData: StoredData<any> = {
        data: leagues,
        lastUpdated: new Date().toISOString()
      };
      writeFileSync(LEAGUES_FILE, JSON.stringify(storageData, null, 2));
      console.log(`💾 Saved ${leagues.length} leagues to persistent storage`);
    } catch (error) {
      console.error('Error saving leagues:', error);
    }
  }

  static loadLeagues(): any[] {
    try {
      this.initFile(LEAGUES_FILE);
      const fileContent = readFileSync(LEAGUES_FILE, 'utf-8');
      const storageData: StoredData<any> = JSON.parse(fileContent);
      console.log(`📖 Loaded ${storageData.data.length} leagues from persistent storage`);
      return storageData.data;
    } catch (error) {
      console.error('Error loading leagues:', error);
      return [];
    }
  }

  static savePicks(picks: any[]): void {
    try {
      this.initFile(PICKS_FILE);
      const storageData: StoredData<any> = {
        data: picks,
        lastUpdated: new Date().toISOString()
      };
      writeFileSync(PICKS_FILE, JSON.stringify(storageData, null, 2));
      console.log(`💾 Saved ${picks.length} picks to persistent storage`);
    } catch (error) {
      console.error('Error saving picks:', error);
    }
  }

  static loadPicks(): any[] {
    try {
      this.initFile(PICKS_FILE);
      const fileContent = readFileSync(PICKS_FILE, 'utf-8');
      const storageData: StoredData<any> = JSON.parse(fileContent);
      console.log(`📖 Loaded ${storageData.data.length} picks from persistent storage`);
      return storageData.data;
    } catch (error) {
      console.error('Error loading picks:', error);
      return [];
    }
  }
}
