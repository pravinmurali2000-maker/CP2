import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TournamentProvider } from "./context/TournamentContext.tsx";

createRoot(document.getElementById("root")!).render(
  <TournamentProvider>
    <App />
  </TournamentProvider>
);