import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Signal to the Farcaster client that the app is ready (dynamic import to avoid React duplication)
import("@farcaster/frame-sdk").then((mod) => {
  mod.default.actions.ready().catch(() => {});
}).catch(() => {});
