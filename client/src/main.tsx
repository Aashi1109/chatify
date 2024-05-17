import App from "@/App";
import CustomToaster from "@/components/toasts/CustomToaster";
import "@/index.css";
import store from "@/store";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomToaster />
      <App />
    </Provider>
  </React.StrictMode>
);
