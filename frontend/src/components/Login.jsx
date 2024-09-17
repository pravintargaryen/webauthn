import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const serverPort = "http://localhost:3000";

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${serverPort}/api/authenticate`, {
        username,
      });

      const publicKeyCredentialRequestOptions = data;
      publicKeyCredentialRequestOptions.challenge = Uint8Array.from(
        atob(data.challenge),
        (c) => c.charCodeAt(0)
      );

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      const response = {
        id: credential.id,
        rawId: btoa(
          String.fromCharCode.apply(null, new Uint8Array(credential.rawId))
        ),
        type: credential.type,
        response: {
          authenticatorData: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(credential.response.authenticatorData)
            )
          ),
          clientDataJSON: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(credential.response.clientDataJSON)
            )
          ),
          signature: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(credential.response.signature)
            )
          ),
          userHandle: credential.response.userHandle
            ? btoa(
                String.fromCharCode.apply(
                  null,
                  new Uint8Array(credential.response.userHandle)
                )
              )
            : null,
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      };

      const result = await axios.post(
        `${serverPort}/api/authenticate/complete`,
        response
      );

      if (result.data.success) {
        setMessage("Authentication successful!");
      } else {
        setMessage("Authentication failed!");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setMessage("Authentication failed!");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>
    </div>
  );
};

export default Login;
