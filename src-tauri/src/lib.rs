use std::net::UdpSocket;
use std::sync::atomic::{AtomicU16, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};

/* ── ESP32 Telemetry Struct (14 float fields = 56 bytes) ── */
/// Struct matching ESP32:
/// {
///   float batteryVoltage;
///   float batteryCurrent;
///   float fcVoltage;
///   float fcCurrent;
///   float dcBusVoltage;
///   float dcBusCurrent;
///   float motorPower;
///   float batteryPercent;
///   float h2Percent;
///   float batteryContribution;
///   float fcContribution;
///   float batteryPower;
///   float fcPower;
///   float dcBusPower;
/// };
const STRUCT_TELEMETRY_SIZE: usize = 14 * 4; // 56 bytes

#[derive(serde::Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct EspTelemetry {
    battery_voltage: f32,
    battery_current: f32,
    fc_voltage: f32,
    fc_current: f32,
    dc_bus_voltage: f32,
    dc_bus_current: f32,
    motor_power: f32,
    battery_percent: f32,
    h2_percent: f32,
    battery_contribution: f32,
    fc_contribution: f32,
    battery_power: f32,
    fc_power: f32,
    dc_bus_power: f32,
}

/// Parse the ESP32 56-byte TelemetryData struct (14 little-endian 32-bit IEEE 754 floats).
fn parse_struct_telemetry(buf: &[u8], len: usize) -> Option<EspTelemetry> {
    if len < STRUCT_TELEMETRY_SIZE {
        return None;
    }

    let read_f32 = |offset: usize| -> f32 {
        let bytes = [
            buf[offset],
            buf[offset + 1],
            buf[offset + 2],
            buf[offset + 3],
        ];
        f32::from_le_bytes(bytes)
    };

    Some(EspTelemetry {
        battery_voltage:      read_f32(0),
        battery_current:      read_f32(4),
        fc_voltage:           read_f32(8),
        fc_current:           read_f32(12),
        dc_bus_voltage:       read_f32(16),
        dc_bus_current:       read_f32(20),
        motor_power:          read_f32(24),
        battery_percent:      read_f32(28),
        h2_percent:           read_f32(32),
        battery_contribution: read_f32(36),
        fc_contribution:      read_f32(40),
        battery_power:        read_f32(44),
        fc_power:             read_f32(48),
        dc_bus_power:         read_f32(52),
    })
}

/* ── Tauri State ────────────────────────────────────────── */

struct UdpState {
    current_port: Arc<AtomicU16>,
}

#[tauri::command]
fn get_udp_port(state: State<'_, UdpState>) -> u16 {
    state.current_port.load(Ordering::Relaxed)
}

/// Handles incoming UDP buffer: parses 56-byte TelemetryData struct, falls back to raw UTF-8 forward.
fn handle_udp_data(app_handle: &AppHandle, buffer: &[u8], size: usize) {
    if let Some(telemetry) = parse_struct_telemetry(buffer, size) {
        // Successfully parsed struct telemetry — serialize as JSON and emit
        match serde_json::to_string(&telemetry) {
            Ok(json) => {
                if let Err(error) = app_handle.emit("udp-telemetry", &json) {
                    eprintln!("Failed to emit telemetry: {}", error);
                }
            }
            Err(e) => {
                eprintln!("[ESP32] JSON serialization error: {}", e);
            }
        }
    } else {
        // Not a valid struct packet — forward as raw string for debugging / other uses
        let message = String::from_utf8_lossy(&buffer[..size]).to_string();
        if let Err(error) = app_handle.emit("udp-message", &message) {
            eprintln!("Failed to emit UDP message: {}", error);
        }
    }
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
                    handle_udp_data(&app_handle, &buffer, size);
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

#[tauri::command]
fn send_throttle_command(throttle_type: u8, value: u8) -> Result<(), String> {
    // throttle_type: 0 = Common Throttle, 1 = Rear Throttle
    // Packet is 2 bytes: [throttle_type, value]
    let packet = [throttle_type, value];

    let socket = UdpSocket::bind("0.0.0.0:0")
        .map_err(|e| format!("Failed to bind sending UDP socket: {}", e))?;

    socket
        .set_broadcast(true)
        .map_err(|e| format!("Failed to enable broadcast: {}", e))?;

    // Broadcast to 255.255.255.255:8889 (and/or 192.168.1.255:8889)
    socket
        .send_to(&packet, "255.255.255.255:8889")
        .map_err(|e| format!("Failed to send UDP broadcast: {}", e))?;

    Ok(())
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
                            handle_udp_data(&app_handle, &buffer, size);
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
        .invoke_handler(tauri::generate_handler![get_udp_port, change_udp_port, send_throttle_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}