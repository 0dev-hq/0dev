import { useEffect } from "react";

export default function AgentIntegrationExchange() {

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");
      const expiresIn = urlParams.get("expires_in");
      const integration = urlParams.get("integration");
      const message = {
        accessToken,
        refreshToken,
        expiresIn,
      };

      if (accessToken && refreshToken && integration) {
        if (window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_CALLBACK", integration, success: true, message },
            "*"
          );
        }

        window.close();
      } else {
        if (window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_CALLBACK", integration, success: false },
            "*"
          );
        }
        // Close this window
        window.close();
      }
    };

    handleCallback();
  }, []);

  return <div>Processing OAuth callback...</div>;
}
