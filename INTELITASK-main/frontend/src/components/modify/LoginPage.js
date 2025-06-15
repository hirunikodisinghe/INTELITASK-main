import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginPage.css'; // Import the updated CSS file

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        navigate("/tasks");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login to IntelliTask</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">Email
          <label htmlFor="email"></label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">password
          <label htmlFor="password"></label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-btn" onClick={handleLogin} disabled={!email || !password}>
          Login
        </button>
        <div className="additional-options">
          <button className="create-account-btn" onClick={() => navigate("/create-account")}>
            Create Account
          </button>
          <button className="admin-btn" onClick={() => navigate("/admin-login")}>
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;