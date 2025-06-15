import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './UserDetail.css';

const UserDetail = () => {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState({ username: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/api/user/${userId}`);
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/auth/api/user/${userId}`, { 
        method: "DELETE" 
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/auth/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setIsEditing(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="cyber-interface">
      <nav className="neon-nav">
        <h1 className="interface-title">User Terminal</h1>
        <div className="nav-commands">
          <button onClick={() => navigate(`/user/${userId}`)} className="nav-btn">
            Profile
          </button>
          <button onClick={() => navigate(`/tasks`)} className="nav-btn">
            Tasks
          </button>
          <button onClick={() => navigate("/Reminders")} className="nav-btn">
            Reminders
          </button>
          <button onClick={() => navigate("/feedback")} className="nav-btn">
            Feedback
          </button>
          <button onClick={() => navigate(`/login`)} className="logout-btn">
            Disconnect
          </button>
        </div>
      </nav>

      <div className="data-terminal">
        <h2 className="terminal-header">User Data Core</h2>
        <form className="data-matrix">
          <div className="data-cell">
            <label className="data-tag">User Designation:</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              disabled={!isEditing}
              className={`data-input ${isEditing ? 'active' : ''}`}
              placeholder="Enter designation"
            />
          </div>
          <div className="data-cell">
            <label className="data-tag">Comm Channel:</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              disabled={!isEditing}
              className={`data-input ${isEditing ? 'active' : ''}`}
              placeholder="Enter comm channel"
            />
          </div>
          <div className="control-panel">
            <button 
              type="button" 
              onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
              className="action-btn modify"
            >
              {isEditing ? "Commit Changes" : "Modify Data"}
            </button>
            <button 
              type="button" 
              onClick={handleDelete}
              className="action-btn terminate"
            >
              Terminate User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetail;