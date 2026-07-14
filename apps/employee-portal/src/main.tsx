import React from "react";
import ReactDOM from "react-dom/client";
import "@craft-apex/ui/globals.css";
import { initI18n } from "@craft-apex/i18n";
import { App } from "@/app";
import "@/register-all-steps";

initI18n();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
