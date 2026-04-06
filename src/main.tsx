import { createRoot } from "react-dom/client";
import sdk from "@farcaster/frame-sdk";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Signal to the Farcaster client that the app is ready
sdk.actions.ready().catch(() => {
  // Not in a Farcaster frame context, ignore
});
