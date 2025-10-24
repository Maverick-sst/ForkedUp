// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import {NotificationProvider} from "../src/components/Notification.jsx"
createRoot(document.getElementById("root")).render(
  <NotificationProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </NotificationProvider>
);
