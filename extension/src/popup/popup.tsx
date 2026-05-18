import { render } from "preact";

function App() {
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ fontSize: 16, margin: "0 0 8px" }}>WatchSentry</h1>
      <p style={{ fontSize: 12, color: "#555" }}>
        Open a Chrono24 listing to see the fair-value badge.
      </p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) render(<App />, root);
