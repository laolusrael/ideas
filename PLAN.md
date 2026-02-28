# Ideas Desktop App - Implementation Plan

Convert

## Overview the Ideas note-taking web app into a cross-platform desktop application using Tauri v2.

## Architecture

- **Frontend**: Vue 3 + TypeScript + Vite (unchanged)
- **Backend**: Express.js server runs as subprocess via system Node.js
- **Database**: SQLite stored in user's app data directory
- **Distribution**: ~10-15 MB executables (requires Node.js installed)

## Status: BLOCKED

**Current Status**: Cannot proceed - Rust is not installed in this environment.
**Last Updated**: 2026-02-28

### Prerequisites Needed

1. **Rust** - Install via:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source "$HOME/.cargo/env"
   ```

2. **System Dependencies** (Linux):
   ```bash
   sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
   ```

---

## Implementation Steps

### Step 1: Initialize Tauri

```bash
npm run tauri init
```

**Configuration**:
- App name: `ideas`
- Window title: `Ideas`
- Frontend dist: `../client/dist`
- Dev command: (skip - we'll handle manually)
- Default window: 900x670

**Manual setup required**:
- Create `tauri/` directory structure manually
- Set up `Cargo.toml` with dependencies
- Configure `tauri.conf.json`

### Step 2: Configure `tauri/tauri.conf.json`

```json
{
  "productName": "Ideas",
  "identifier": "com.ideas.app",
  "version": "1.0.0",
  "build": {
    "devtools": true,
    "frontendDist": "../client/dist",
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev:client"
  },
  "app": {
    "windows": [
      {
        "title": "Ideas",
        "width": 900,
        "height": 670,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### Step 3: Add Shell Plugin

```bash
npm run tauri add shell
```

This enables spawning Node.js server as a subprocess.

### Step 4: Modify Server for App Data Directory

**File**: `server/src/db.js`

Update database path to use platform-specific app data:

```javascript
const path = require('path');
const fs = require('fs');

function getAppDataPath() {
  if (process.platform === 'win32') {
    return process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');
  } else if (process.platform === 'darwin') {
    return path.join(process.env.HOME, 'Library', 'Application Support');
  } else {
    return process.env.XDG_DATA_HOME || path.join(process.env.HOME, '.local', 'share');
  }
}

const appDataPath = getAppDataPath();
const ideasDir = path.join(appDataPath, 'ideas');

if (!fs.existsSync(ideasDir)) {
  fs.mkdirSync(ideasDir, { recursive: true });
}

const dbPath = path.join(ideasDir, 'ideas.db');
```

### Step 5: Create Rust Backend

**File**: `tauri/src/lib.rs`

```rust
use tauri::Manager;
use std::process::Command;
use std::env;
use std::thread;
use std::time::Duration;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Ideas!", name)
}

fn spawn_server() {
    let server_script = env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .map(|p| p.join("server").join("src").join("index.js"))
        .unwrap_or_else(|| std::path::PathBuf::from("server/src/index.js"));

    let _child = Command::new("node")
        .arg(server_script)
        .spawn()
        .expect("Failed to start server");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Spawn server in background
    spawn_server();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // Wait for server to start
            thread::sleep(Duration::from_secs(2));
            println!("Server started");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 6: Update Frontend API

**File**: `client/src/composables/useNotes.ts`

Update API calls to work in Tauri environment:

```typescript
const API_BASE = window.__TAURI__ 
  ? 'http://localhost:3000/api' 
  : '/api';
```

### Step 7: Configure Permissions

**File**: `tauri/capabilities/default.json`

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-spawn",
    "shell:allow-execute",
    "process:allow-exit",
    "process:allow-restart"
  ]
}
```

### Step 8: Update Package.json

**File**: `package.json`

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Step 9: Build & Test

```bash
# Development
npm run tauri dev

# Production build
npm run tauri build
```

---

## Project Structure

```
ideas/
├── client/                  # Vue 3 frontend
│   ├── src/
│   │   ├── composables/
│   │   │   └── useNotes.ts  # API calls (update for Tauri)
│   │   └── ...
│   └── dist/                # Built frontend
├── server/                  # Express backend
│   └── src/
│       ├── db.js            # Database (update for app data dir)
│       ├── index.js         # Express server
│       └── routes.js       # API routes
├── tauri/                   # Tauri/Rust backend (NEW)
│   ├── src/
│   │   └── lib.rs          # Spawns Node.js server
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   │   └── ...              # App icons
│   └── build.rs
├── package.json             # Updated with tauri scripts
└── README.md
```

---

## Build Outputs

| Platform | Output |
|----------|--------|
| Windows | `.exe` installer (~10-15 MB) |
| macOS | `.dmg` (~10-15 MB) |
| Linux | `.AppImage` / `.deb` (~10-15 MB) |

---

## Tasks

- [ ] Install Rust and system dependencies
- [ ] Initialize Tauri project
- [ ] Configure tauri.conf.json
- [ ] Add shell plugin
- [ ] Modify server for app data directory
- [ ] Create Rust backend to spawn server
- [ ] Update frontend API
- [ ] Configure permissions
- [ ] Build and test

---

## Notes

- User must have Node.js installed on their system
- Server runs on localhost:3000
- Database stored in platform-specific app data directory
- Using native window frame (not custom title bar)
