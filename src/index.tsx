import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { disableServiceWorkerCaching } from "./registerServiceWorker";
import { forceClientResetIfEnabled } from "./clientReset";

disableServiceWorkerCaching();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

async function bootstrap(): Promise<void> {
  const resetTriggered = await forceClientResetIfEnabled();
  if (resetTriggered) {
    return;
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void bootstrap();
