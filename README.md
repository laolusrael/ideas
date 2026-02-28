# Ideas

A cross-platform desktop note-taking application built with Vue 3, Express, SQLite, and Tauri.

## Features

- Create, edit, and delete notes
- Rich text editing with Tiptap
- Tag and archive notes
- Search functionality
- Dark mode support

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Backend**: Express.js + SQLite
- **Desktop**: Tauri v2 (Rust)
- **Editor**: Tiptap

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Build Desktop App

```bash
# Build Tauri app
npm run tauri build
```

The built packages will be in `src-tauri/target/release/bundle/`.

## Desktop App

The desktop app includes:
- Bundled Express server
- SQLite database stored in user's app data directory
- Native window with system icons

### Installing

**Debian/Ubuntu:**
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/Ideas_1.0.0_amd64.deb
```

**RHEL/Fedora:**
```bash
sudo rpm -i src-tauri/target/release/bundle/rpm/Ideas-1.0.0-1.x86_64.rpm
```

### Running

After installation, launch "Ideas" from your applications menu, or run directly:
```bash
./src-tauri/target/release/tauri
```

## Project Structure

```
ideas/
├── client/                 # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   ├── composables/
│   │   └── views/
│   └── dist/              # Built frontend
├── server/                 # Express backend
│   └── src/
│       ├── db.js          # SQLite database
│       ├── index.js       # Express server
│       └── routes.js      # API routes
├── src-tauri/             # Tauri/Rust backend
│   ├── src/
│   │   └── lib.rs         # Spawns Node.js server
│   └── tauri.conf.json
└── package.json
```

## License

MIT
