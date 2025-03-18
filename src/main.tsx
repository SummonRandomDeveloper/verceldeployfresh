// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
// import "bootstrap/dist/css/bootstrap.css";

// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import "./App.css";
import App from "./App.tsx";
// import "bootstrap/dist/css/bootstrap.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
