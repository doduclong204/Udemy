import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (options: object) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string };
        }) => void,
        options: { scope: string },
      ) => void;
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "";

window.fbAsyncInit = function () {
  window.FB.init({
    appId: FACEBOOK_APP_ID,
    cookie: true,
    xfbml: true,
    version: "v18.0",
  });
};

const script = document.createElement("script");
script.src = "https://connect.facebook.net/en_US/sdk.js";
script.async = true;
script.defer = true;
script.onload = () => {
  if (window.FB) {
    window.FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: "v18.0",
    });
  }
};
document.body.appendChild(script);

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
);