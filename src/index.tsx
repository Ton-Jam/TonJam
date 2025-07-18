import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import { GlobalPlayerProvider } from "./context/GlobalPlayerContext";
import { FollowProvider } from "./context/FollowContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
      <GlobalPlayerProvider>
        <FollowProvider>
          <App />
        </FollowProvider>
      </GlobalPlayerProvider>
    </UserProvider>
  </React.StrictMode>
);
