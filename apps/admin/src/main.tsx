import { MessageStackProvider } from "@fins/ui-kit";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "@fins/ui-kit/style.css";
import "@fins/entities/style.css";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import App from "./App";
import "./index.css";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <MessageStackProvider maxMessages={5}>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </MessageStackProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
