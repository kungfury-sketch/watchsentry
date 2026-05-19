import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "WatchSentry",
  version: pkg.version,
  description:
    "Fair-value, cross-marketplace alternatives, and seller risk for every Chrono24 listing.",
  icons: { 16: "icons/16.png", 48: "icons/48.png", 128: "icons/128.png" },
  action: { default_popup: "src/popup/index.html", default_icon: "icons/48.png" },
  background: { service_worker: "src/background/index.ts", type: "module" },
  content_scripts: [
    {
      matches: ["https://*.chrono24.com/*"],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
    },
  ],
  permissions: ["storage"],
  host_permissions: ["https://watchsentry-api.txrz.workers.dev/*"],
});
