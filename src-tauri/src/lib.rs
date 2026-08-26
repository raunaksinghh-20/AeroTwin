use std::net::UdpSocket;
use std::sync::atomic::{AtomicU16, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};

struct UdpState {
    current_port: Arc<AtomicU16>,
}

#[tauri::command]
fn get_udp_port(state: State<'_, UdpState>) -> u16 {
    state.current_port.load(Ordering::Relaxed)
}

#[tauri::command]
fn change_udp_port(app_handle: AppHandle, state: State<'_, UdpState>, port: u16) -> Result<u16, String> {
    let current = state.current_port.load(Ordering::Relaxed);
    if current == port {
        // Socket is already bound and running on this port
        return Ok(port);
    }

    // Signal previous loop to terminate
    state.current_port.store(port, Ordering::Relaxed);

    // Wait for previous receiver thread timeout loop (500ms) to exit and release socket
    thread::sleep(Duration::from_millis(600));

    let socket = UdpSocket::bind(format!("0.0.0.0:{}", port))
        .map_err(|e| format!("Failed to bind UDP port {}: {}", port, e))?;

    socket
        .set_read_timeout(Some(Duration::from_millis(500)))
        .map_err(|e| format!("Failed to set socket timeout: {}", e))?;

    let port_ref = state.current_port.clone();

    thread::spawn(move || {
        println!("UDP receiver listening on 0.0.0.0:{}", port);
        let mut buffer = [0u8; 4096];

        while port_ref.load(Ordering::Relaxed) == port {
            match socket.recv_from(&mut buffer) {
                Ok((size, _sender)) => {
                    let message = String::from_utf8_lossy(&buffer[..size]).to_string();
                    if let Err(error) = app_handle.emit("udp-message", &message) {
                        eprintln!("Failed to emit UDP message: {}", error);
                    }
                }
                Err(ref e)
                    if e.kind() == std::io::ErrorKind::WouldBlock
                        || e.kind() == std::io::ErrorKind::TimedOut =>
                {
                    continue;
                }
                Err(error) => {
                    eprintln!("UDP receive error on port {}: {}", port, error);
                    thread::sleep(Duration::from_millis(100));
                }
            }
        }
        println!("UDP receiver loop on port {} stopped.", port);
    });

    Ok(port)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let initial_port = Arc::new(AtomicU16::new(8888));
    let udp_state = UdpState {
        current_port: initial_port.clone(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(udp_state)
        .setup(move |app| {
            let app_handle = app.handle().clone();
            // Start default UDP listener on port 8888
            let socket = UdpSocket::bind("0.0.0.0:8888").expect("Failed to bind initial UDP socket");
            socket.set_read_timeout(Some(Duration::from_millis(500))).ok();

            let port_ref = initial_port;
            thread::spawn(move || {
                println!("Initial UDP receiver listening on 0.0.0.0:8888");
                let mut buffer = [0u8; 4096];

                while port_ref.load(Ordering::Relaxed) == 8888 {
                    match socket.recv_from(&mut buffer) {
                        Ok((size, _sender)) => {
                            let message = String::from_utf8_lossy(&buffer[..size]).to_string();
                            if let Err(error) = app_handle.emit("udp-message", &message) {
                                eprintln!("Failed to emit UDP message: {}", error);
                            }
                        }
                        Err(ref e)
                            if e.kind() == std::io::ErrorKind::WouldBlock
                                || e.kind() == std::io::ErrorKind::TimedOut =>
                        {
                            continue;
                        }
                        Err(error) => {
                            eprintln!("UDP receive error: {}", error);
                            thread::sleep(Duration::from_millis(100));
                        }
                    }
                }
                println!("Initial UDP receiver loop stopped.");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_udp_port, change_udp_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}