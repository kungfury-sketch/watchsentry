import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { getSettings, setSettings } from "../storage";

function App() {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setEnabled(s.enabled);
      setReady(true);
    });
  }, []);

  function toggle(next: boolean) {
    setEnabled(next);
    setSettings({ enabled: next });
  }

  return (
    <div style={{ padding: 12, minWidth: 220, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 16, margin: "0 0 8px" }}>WatchSentry</h1>
      <label style={{ display: "block", fontSize: 13 }}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={!ready}
          onChange={(e) => toggle((e.currentTarget as HTMLInputElement).checked)}
        />{" "}
        Enable on Chrono24
      </label>
      <p style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
        Open a Chrono24 listing to see the fair-value badge.
      </p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) render(<App />, root);
