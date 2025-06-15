import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Feedback.css';

// FeedbackForm Component
const FeedbackForm = ({ onFeedbackSubmitted }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [userId] = useState(localStorage.getItem('userId') || 'Admin');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/auth/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, feedback_text: feedbackText }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            await response.json();
            alert('Feedback submitted successfully!');
            setFeedbackText('');
            onFeedbackSubmitted();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
                <label>User ID:</label>
                <input 
                    type="text" 
                    value={userId} 
                    readOnly 
                    className="form-input readonly"
                />
            </div>
            <div className="form-group">
                <label>Feedback:</label>
                <textarea 
                    value={feedbackText} 
                    onChange={(e) => setFeedbackText(e.target.value)} 
                    required 
                    className="form-textarea"
                    placeholder="Share your feedback here..."
                />
            </div>
            <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
    );
};

// FeedbackItem Component
const FeedbackItem = ({ feedback }) => (
    <div className="feedback-item">
        <div className="feedback-content">
            <p className="feedback-user">User ID: {feedback.user_id}</p>
            <p className="feedback-text">{feedback.feedback_text}</p>
        </div>
    </div>
);

// FeedbackList Component
const FeedbackList = ({ onFeedbackUpdated }) => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/api/feedback');
                const data = await response.json();
                setFeedbacks(data);
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            }
        };
        fetchFeedbacks();
    }, [onFeedbackUpdated]);

    return (
        <div className="feedback-list">
            <h2>Feedback History</h2>
            {feedbacks.length === 0 ? (
                <p className="no-feedback">No feedback available yet</p>
            ) : (
                feedbacks.map(feedback => (
                    <FeedbackItem key={feedback.id} feedback={feedback} />
                ))
            )}
        </div>
    );
};

// Main Feedback Component
const Feedback = () => {
    const [feedbackUpdated, setFeedbackUpdated] = useState(false);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const handleFeedbackSubmitted = () => {
        setFeedbackUpdated(prev => !prev);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(219, 39, 119);
        doc.text("Feedback List", 14, 15);
        
        const tableColumn = ["User ID", "Feedback"];
        const tableRows = Feedback.map(feedback => [feedback.user_id, feedback.feedback_text]);
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            headStyles: { fillColor: [219, 39, 119] },
            alternateRowStyles: { fillColor: [245, 208, 223] }
        });
        
        doc.save("feedback_list.pdf");
    };

    return (
        <div className="feedback-page">
            <nav className="navbar">
                <h1 className="logo">Feedback System</h1>
                <div className="nav-buttons">
                    <button onClick={() => navigate(`/user/${userId}`)}>
                        Profile
                    </button>
                    <button onClick={() => navigate(`/tasks`)}>
                        Tasks
                    </button>
                    <button onClick={() => navigate("/Reminders")}>
                        Reminders
                    </button>
                    <button onClick={() => navigate("/feedback")}>
                        Feedback
                    </button>
                    <button onClick={() => navigate(`/login`)} className="logout-btn">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="feedback-container">
                <div className="feedback-header">
                    <h1>User Feedback</h1>
                    <button onClick={generatePDF} className="pdf-btn">
                        Generate PDF Report
                    </button>
                </div>
                <div className="feedback-content">
                    <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
                    <FeedbackList onFeedbackUpdated={feedbackUpdated} />
                </div>
            </div>
        </div>
    );
};

export default Feedback;