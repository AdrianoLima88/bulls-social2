import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Render app first, then init OneSignal in background
createRoot(document.getElementById("root")!).render(<App />);

// Init OneSignal after app is rendered — non-blocking
setTimeout(() => {
  import('./utils/OneSignalInit').then(({ initOneSignal }) => {
    initOneSignal();
  });
}, 3000);
