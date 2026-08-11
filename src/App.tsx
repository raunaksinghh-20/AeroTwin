import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Waiting for UDP data...");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen<string>("udp-message", (event) => {
        console.log("UDP message received:", event.payload);

        setMessage(event.payload);
        setConnected(true);
      });
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <main className="container">
      <h1>ESP32 UDP Test</h1>

      <div className="status">
        <span className={`status-dot ${connected ? "connected" : "waiting"}`} />

        <span>{connected ? "UDP Connected" : "Waiting for ESP32..."}</span>
      </div>

      <div className="message-box">
        <p>Latest UDP Message</p>

        <h2>{message}</h2>
      </div>
    </main>
  );
}

export default App;