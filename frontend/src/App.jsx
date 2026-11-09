import { useState } from "react";
import "./App.css";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    return token && savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Sweety</h1>
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
