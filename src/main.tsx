import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import SiteGate from "./components/SiteGate.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SiteGate>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SiteGate>
  </StrictMode>
);
