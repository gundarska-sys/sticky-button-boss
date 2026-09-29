import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (window.bpm) document.documentElement.classList.add("desktop");

createRoot(document.getElementById("root")!).render(<App />);
