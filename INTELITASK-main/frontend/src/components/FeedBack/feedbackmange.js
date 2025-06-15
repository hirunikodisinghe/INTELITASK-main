import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
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
                <input type="text" value={userId} readOnly className="form-input readonly" />
            </div>
            <div className="form-group">
                <label>Feedback:</label>
                <textarea 
                    value={feedbackText} 
                    onChange={(e) => setFeedbackText(e.target.value)} 
                    required 
                    className="form-textarea"
                    placeholder="Enter your feedback here..."
                />
            </div>
            <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
    );
};

// FeedbackItem Component
const FeedbackItem = ({ feedback, onEdit, onDelete }) => (
    <div className="feedback-item">
        <div className="feedback-content">
            <p className="feedback-user">User ID: {feedback.user_id}</p>
            <p className="feedback-text">{feedback.feedback_text}</p>
        </div>
        <div className="feedback-actions">
            <button onClick={() => onEdit(feedback.id, feedback.feedback_text)} className="edit-btn">Edit</button>
            <button onClick={() => onDelete(feedback.id)} className="delete-btn">Delete</button>
        </div>
    </div>
);

// FeedbackList Component
const FeedbackList = ({ onFeedbackUpdated, setFeedbacks }) => {
    const [feedbacks, setFeedbacksLocal] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/api/feedback');
                const data = await response.json();
                setFeedbacksLocal(data);
                setFeedbacks(data);
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            }
        };
        fetchFeedbacks();
    }, [onFeedbackUpdated, setFeedbacks]);

    const handleEdit = async (id, feedbackText) => {
        const newFeedbackText = prompt('Edit feedback:', feedbackText);
        if (newFeedbackText) {
            try {
                await fetch(`http://localhost:5000/auth/api/feedback/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback_text: newFeedbackText }),
                });
                alert('Feedback updated successfully!');
                onFeedbackUpdated();
            } catch (error) {
                console.error('Error updating feedback:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
            try {
                await fetch(`http://localhost:5000/auth/api/feedback/${id}`, { method: 'DELETE' });
                alert('Feedback deleted successfully!');
                onFeedbackUpdated();
            } catch (error) {
                console.error('Error deleting feedback:', error);
            }
        }
    };

    return (
        <div className="feedback-list">
            <h2>Feedback History</h2>
            {feedbacks.length === 0 ? (
                <p className="no-feedback">No feedback available yet</p>
            ) : (
                feedbacks.map(feedback => (
                    <FeedbackItem 
                        key={feedback.id} 
                        feedback={feedback} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );
};

// Main Feedback Component
const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackUpdated, setFeedbackUpdated] = useState(false);
    const navigate = useNavigate();

    const handleFeedbackSubmitted = () => setFeedbackUpdated(prev => !prev);

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(219, 39, 119);
        doc.text("User Feedback Report", 14, 15);
        
        const tableColumn = ["User ID", "Feedback"];
        const tableRows = feedbacks.map(feedback => [feedback.user_id, feedback.feedback_text]);
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            headStyles: { fillColor: [219, 39, 119] },
            alternateRowStyles: { fillColor: [245, 208, 223] }
        });
        
        doc.save("user_feedback_report.pdf");
    };

    return (
        <div className="feedback-page">
            <nav className="navbar">
                <h1 className="logo">Feedback System</h1>
                <button onClick={() => navigate('/login')} className="logout-btn">Logout</button>
            </nav>
            <div className="feedback-container">
                <div className="feedback-header">
                    <h1>User Feedback</h1>
                    <button onClick={generatePDF} className="pdf-btn">Generate PDF Report</button>
                </div>
                <div className="feedback-content">
                    <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
                    <FeedbackList onFeedbackUpdated={feedbackUpdated} setFeedbacks={setFeedbacks} />
                </div>
            </div>
        </div>
    );
};

export default Feedback;