import App from "@/App";
import CustomToaster from "@/components/toasts/CustomToaster";
import "@/index.css";
import store from "@/store";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auth, Page } from "./pages";
import Error from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Page />,
      },
    ],
  },
  {
    path: "/auth",
    errorElement: <Error />,
    element: <Auth />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomToaster />
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
