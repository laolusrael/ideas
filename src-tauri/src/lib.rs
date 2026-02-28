use std::env;
use std::process::Command;
use std::thread;
use std::time::Duration;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Ideas!", name)
}

fn get_server_path() -> std::path::PathBuf {
    let exe_path = env::current_exe().expect("Failed to get executable path");

    // Try multiple possible locations
    let possible_paths = vec![
        // Bundled app: /usr/lib/Ideas/server/src/index.js
        exe_path
            .parent()
            .map(|p| p.join("server").join("src").join("index.js")),
        // Dev build: project root/server/src/index.js
        exe_path
            .parent()
            .and_then(|p| p.parent())
            .and_then(|p| p.parent())
            .and_then(|p| p.parent())
            .map(|p| p.join("server").join("src").join("index.js")),
    ];

    for path in possible_paths {
        if let Some(p) = path {
            if p.exists() {
                return p;
            }
        }
    }

    // Fallback - try to find server relative to current directory
    std::path::PathBuf::from("server/src/index.js")
}

fn spawn_server() {
    let server_script = get_server_path();

    println!("Starting server from: {:?}", server_script);

    if !server_script.exists() {
        eprintln!("Server script not found at: {:?}", server_script);
        return;
    }

    let _child = Command::new("node")
        .arg(&server_script)
        .spawn()
        .expect("Failed to start server");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    spawn_server();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|_app| {
            thread::sleep(Duration::from_secs(2));
            println!("Server started");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
