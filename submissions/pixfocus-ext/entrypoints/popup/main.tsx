import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";
import { MemoryRouter, Routes, Route } from "react-router";
import Configure from "./Configure.tsx";
import VariantSelector from "./VariantSelector.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/configure" element={<Configure />} />
        <Route path="/variants" element={<VariantSelector />} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>
);
