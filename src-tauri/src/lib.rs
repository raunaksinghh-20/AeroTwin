use std::net::UdpSocket;
use std::thread;
use tauri::Emitter;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            thread::spawn(move || {
                let socket = UdpSocket::bind("0.0.0.0:8888")
                    .expect("Failed to bind UDP socket");

                println!("UDP receiver listening on 0.0.0.0:8888");

                let mut buffer = [0u8; 4096];

                loop {
                    match socket.recv_from(&mut buffer) {
                        Ok((size, sender)) => {
                            let message =
                                String::from_utf8_lossy(&buffer[..size]).to_string();

                            println!(
                                "Received from {}: {}",
                                sender,
                                message
                            );

                            if let Err(error) =
                                app_handle.emit("udp-message", &message)
                            {
                                eprintln!(
                                    "Failed to emit UDP message: {}",
                                    error
                                );
                            }
                        }

                        Err(error) => {
                            eprintln!("UDP receive error: {}", error);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}