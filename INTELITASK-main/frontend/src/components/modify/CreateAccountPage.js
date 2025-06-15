import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './CreateAccountPage.css'; // Import the updated CSS file

const CreateAccountPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Account Created Successfully!");
        navigate("/login"); // Redirect to login page
      } else {
        setError(data.message || "Error creating account.");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="create-account-page">
      <div className="create-account-container">
        <h2>Create Your Account</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">Name
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="name"></label>
        </div>
        <div className="form-group">Email
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="email"></label>
        </div>
        <div className="form-group">Password
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password"></label>
        </div>
        <button
          className="create-account-btn"
          onClick={handleCreateAccount}
          disabled={!name || !email || !password}
        >
          Create Account
        </button>
        <div className="additional-options">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;