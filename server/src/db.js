import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAppDataPath() {
  if (process.platform === 'win32') {
    return process.env.APPDATA || join(process.env.USERPROFILE, 'AppData', 'Roaming');
  } else if (process.platform === 'darwin') {
    return join(process.env.HOME, 'Library', 'Application Support');
  } else {
    return process.env.XDG_DATA_HOME || join(process.env.HOME, '.local', 'share');
  }
}

const appDataPath = getAppDataPath();
const ideasDir = join(appDataPath, 'ideas');

if (!fs.existsSync(ideasDir)) {
  fs.mkdirSync(ideasDir, { recursive: true });
}

const dbPath = join(ideasDir, 'ideas.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    tags TEXT,
    is_archived INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(is_archived);
`);

export default db;
