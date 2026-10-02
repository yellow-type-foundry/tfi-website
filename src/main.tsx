import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/figma-tokens.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/transitions.css";
import App from "./App";
import { SmoothScroll } from "./components/SmoothScroll";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SmoothScroll />
    <App />
  </StrictMode>,
);
