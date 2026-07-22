import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { QueueProvider } from "./context/QueueContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueueProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueueProvider>
    </ThemeProvider>
  </React.StrictMode>
);
