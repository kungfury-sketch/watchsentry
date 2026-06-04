import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { getSettings, setSettings } from "../storage";
import "./popup.css";
import iconSrc from "../../icons/48.png";

const VERSION = "0.1.0";

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
    <div class="ws-popup">
      <div class="ws-head">
        <div class="ws-mark" aria-hidden="true">
          <img src={iconSrc} alt="" />
        </div>
        <div class="ws-titles">
          <span class="ws-name">WatchSentry</span>
          <span class="ws-tag">Fair value on every watch listing</span>
        </div>
      </div>

      <div class={`ws-status ${enabled ? "ws-on" : "ws-off"}`}>
        <span class="ws-dot" aria-hidden="true" />
        <span class="ws-status-label">
          {ready ? (enabled ? "Active on supported sites" : "Paused") : "Loading…"}
        </span>
        <label class="ws-toggle" aria-label="Enable WatchSentry">
          <input
            type="checkbox"
            checked={enabled}
            disabled={!ready}
            onChange={(e) => toggle((e.currentTarget as HTMLInputElement).checked)}
          />
          <span class="ws-slider" />
        </label>
      </div>

      <div class="ws-explainer">
        <h2>How it works</h2>
        <ul>
          <li>Open any Chrono24, eBay, or Watchfinder listing or search page.</li>
          <li>
            WatchSentry compares the listed price to the median of active eBay listings (90 days).
          </li>
          <li>The badge appears next to the price — green below, red above, gray near fair.</li>
        </ul>
      </div>

      <div class="ws-foot">
        <a href="https://watchsentry.app/" target="_blank" rel="noopener noreferrer">
          watchsentry.app
        </a>
        <span>v{VERSION}</span>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
if (root) render(<App />, root);
