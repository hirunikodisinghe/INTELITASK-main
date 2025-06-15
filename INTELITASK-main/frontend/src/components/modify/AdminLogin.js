import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Adjusted import path to match file structure

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Manual login function
    const manualLogin = (username, password) => {
        if (username === 'admin@gmail.com' && password === 'admin123') {
            return { success: true, role: 'admin' };
        } else if (username === 'category@gmail.com' && password === 'category123') {
            return { success: true, role: 'category' };
        } else {
            return { success: false, message: 'Invalid credentials' };
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Call the manual login function
        const result = manualLogin(username, password);
        console.log(result); // Debugging line

        if (result.success) {
            // Redirect based on user role
            if (result.role === 'admin') {
                navigate('/Feedbackmanage');
            } else if (result.role === 'category') {
                navigate('/categories');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <h2>Admin Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="username">Username</label>
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="password">Password</label>
                    </div>
                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>
                <div className="additional-options">
                    <button className="back-btn" onClick={() => navigate('/login')}>
                        Back to User Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;