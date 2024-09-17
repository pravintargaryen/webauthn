import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const serverPort = "http://localhost:3000";

  // const handleRegister = async () => {
  //   try {
  //     const { data } = await axios.post(`${serverPort}/api/register`, {
  //       username,
  //     });

  //     const publicKeyCredentialCreationOptions = data;
  //     publicKeyCredentialCreationOptions.challenge = Uint8Array.from(
  //       atob(data.challenge),
  //       (c) => c.charCodeAt(0)
  //     );
  //     publicKeyCredentialCreationOptions.user.id = Uint8Array.from(
  //       atob(data.user.id),
  //       (c) => c.charCodeAt(0)
  //     );

  //     const credential = await navigator.credentials.create({
  //       publicKey: publicKeyCredentialCreationOptions,
  //     });

  //     const response = {
  //       id: credential.id,
  //       rawId: btoa(
  //         String.fromCharCode.apply(null, new Uint8Array(credential.rawId))
  //       ),
  //       type: credential.type,
  //       response: {
  //         attestationObject: btoa(
  //           String.fromCharCode.apply(
  //             null,
  //             new Uint8Array(credential.response.attestationObject)
  //           )
  //         ),
  //         clientDataJSON: btoa(
  //           String.fromCharCode.apply(
  //             null,
  //             new Uint8Array(credential.response.clientDataJSON)
  //           )
  //         ),
  //       },
  //       clientExtensionResults: credential.getClientExtensionResults(),
  //     };

  //     const result = await axios.post(
  //       `${serverPort}/api/register/complete`,
  //       response,
  //       { withCredentials: true }
  //     );

  //     if (result.data.success) {
  //       setMessage("Registration successful!");
  //     } else {
  //       setMessage("Registration failed!");
  //     }
  //   } catch (error) {
  //     console.error("Error during registration:", error);
  //     setMessage("Registration failed!");
  //   }
  // };
  const handleRegister = async () => {
    try {
      // Step 1: Initiate registration and receive the challenge and options
      const { data: registrationOptions } = await axios.post(
        `${serverPort}/api/register`,
        {
          username,
          step: "initiate", // Specify the initiation step
        }
      );

      // Step 2: Convert challenge and user ID from base64 to Uint8Array
      registrationOptions.challenge = Uint8Array.from(
        atob(registrationOptions.challenge),
        (c) => c.charCodeAt(0)
      );
      registrationOptions.user.id = Uint8Array.from(
        atob(registrationOptions.user.id),
        (c) => c.charCodeAt(0)
      );

      // Step 3: Create public key credentials
      const credential = await navigator.credentials.create({
        publicKey: registrationOptions,
      });

      // Prepare the response to send back to the server
      const response = {
        id: credential.id,
        rawId: btoa(
          String.fromCharCode.apply(null, new Uint8Array(credential.rawId))
        ),
        type: credential.type,
        response: {
          attestationObject: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(credential.response.attestationObject)
            )
          ),
          clientDataJSON: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(credential.response.clientDataJSON)
            )
          ),
        },
        clientExtensionResults: credential.getClientExtensionResults(),
        username, // Include the username again for completion step
        step: "complete", // Specify the completion step
      };

      // Step 4: Complete the registration by sending the response
      const result = await axios.post(`${serverPort}/api/register`, response, {
        withCredentials: true,
      });

      if (result.data.success) {
        setMessage("Registration successful!");
      } else {
        setMessage("Registration failed!");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      <button onClick={handleRegister}>Register</button>
      <p>{message}</p>
    </div>
  );
};

export default Register;
