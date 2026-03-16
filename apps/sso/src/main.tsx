import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "@fins/ui-kit/style.css";
import App from "./App";
import "./index.css";
import { store } from "./store";
import { MessageStackProvider } from "@fins/ui-kit";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
    <MessageStackProvider maxMessages={5}>
      <App />
    </MessageStackProvider>
    </Provider>
  </StrictMode>,
);
