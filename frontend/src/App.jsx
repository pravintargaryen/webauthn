import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  return (
    <div className="App">
      <h1>WebAuthn with Ed25519 Passkey</h1>
      <Register />
      <Login />
    </div>
  );
}

export default App;
