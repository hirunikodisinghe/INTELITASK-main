import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import TaskList from "./components/Task/TaskList"; // Assuming you have this component
import AddTask from "./components/Task/AddTask"; // Assuming you have this component
import LoginPage from "./components/modify/LoginPage";
import CreateAccountPage from "./components/modify/CreateAccountPage"; // Assuming you have this component
import UserDetail from "./components/user/readuser"; // Import UserDetail
import "./App.css";
import AdminLogin from "./components/modify/AdminLogin"; // Import AdminLogin
import Category from './components/category/category'; // Import Category component
import FeedbackPage from './components/FeedBack/FeedbackForm'; // Import FeedbackPage
import Feedbackmanage from './components/FeedBack/feedbackmange'; // Import FeedbackPage
import Reminders from "./components/Task/reminders";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId"); // Clear user ID on logout
        setIsAuthenticated(false);
    };

    useEffect(() => {
        console.log("isAuthenticated:", isAuthenticated);
    }, [isAuthenticated]);

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>IntelliTask: Task & Reminder Assistant</h1>
                </header>

                <main>
                    <Routes>
                        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/create-account" element={<CreateAccountPage />} />
                        <Route path="/user/:id" element={<UserDetail />} />
                        <Route path="/admin-login" element={<AdminLogin />} />
                        <Route path="/feedback" element={<FeedbackPage />} /> {/* Feedback Page Route */}
                        <Route
                            path="/tasks"
                            element={isAuthenticated ? <TaskListPage onLogout={handleLogout} /> : <Navigate to="/login" />}
                        />
                        <Route path="/categories" element={<Category />} />
                        <Route path="/Reminders" element={<Reminders />} />
                        <Route path="/Feedbackmanage" element={<Feedbackmanage />} />
                        <Route path="*" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

const TaskListPage = ({ onLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("/api/tasks");
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        const showSplashScreen = async () => {
            setIsLoading(true); // Start loading
            await fetchTasks(); // Fetch tasks
            // Ensure splash screen is visible for at least 4 seconds
            await new Promise(resolve => setTimeout(resolve, 4000));
            setIsLoading(false); // End loading
        };

        showSplashScreen();
    }, []);

    return (
        <>
            <Navbar onLogout={onLogout} userId={userId} />
            {isLoading ? (
                <div className="splash-screen">
                    <h1 className="splash-title">IntelliTask</h1>
                    <div className="task-checklist">
                        <div className="checklist-icon"></div>
                        <div className="orbit-dot orbit-dot-1"></div>
                        <div className="orbit-dot orbit-dot-2"></div>
                        <div className="orbit-dot orbit-dot-3"></div>
                    </div>
                    <p className="splash-loading-text">Loading your tasks...</p>
                </div>
            ) : (
                <>
                    <TaskList tasks={tasks} />
                    <AddTask />
                </>
            )}
        </>
    );
};

const Navbar = ({ onLogout, userId }) => {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <button className="nav-btn profile-btn" onClick={() => navigate(`/user/${userId}`)}>
                User Profile
            </button>
            <button className="nav-btn reminders-btn" onClick={() => navigate("/Reminders")}>
                Reminders
            </button>
            <button className="nav-btn feedback-btn" onClick={() => navigate('/feedback')}>
                Feedback
            </button>
            <button className="nav-btn logout-btn" onClick={onLogout}>
                Logout
            </button>
        </nav>
    );
};

export default App;