import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "todomvc-app-css/index.css";
import "todomvc-common/base.css";
import "./app.css";

const container = document.getElementById("root");

if (container)
    createRoot(container).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
