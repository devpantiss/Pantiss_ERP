import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { CategoryProvider } from "./app/CategoryContext";
import { AuthProvider } from "./app/AuthContext";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CategoryProvider>
          <App />
        </CategoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
