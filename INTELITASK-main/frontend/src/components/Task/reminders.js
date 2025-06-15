import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Reminders.css'; // Importing the updated CSS file

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/api/reminders');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        setReminders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(255, 102, 153); // Pink color for title (#ff6699)
    doc.text('Reminders List', 14, 16);
    const tableColumn = ["Task", "Reminder Time", "Status", "User"];
    const tableRows = [];

    reminders.forEach(reminder => {
      const reminderData = [
        reminder.task_title,
        new Date(reminder.reminder_time).toLocaleString(),
        reminder.status,
        reminder.username,
      ];
      tableRows.push(reminderData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fillColor: [255, 245, 247] }, // Light pink background for table (#fff5f7)
      headStyles: { fillColor: [255, 102, 153] }, // Pink header (#ff6699)
      alternateRowStyles: { fillColor: [255, 221, 225] }, // Lighter pink for alternate rows (#ffdde1)
    });
    doc.save('reminders.pdf');
  };

  const deleteReminder = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/api/reminders/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setReminders(reminders.filter(reminder => reminder.id !== id));
      } else {
        throw new Error('Failed to delete reminder');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="reminders-page">
      <div className="reminders-container">
        <h1>Reminders</h1>

        {/* Navigation Bar */}
        <nav className="navbar">
          <button className="nav-btn profile-btn" onClick={() => navigate(`/user/${localStorage.getItem("userId")}`)}>
            User Profile
          </button>
          <button className="nav-btn tasks-btn" onClick={() => navigate(`/tasks`)}>
            User Tasks
          </button>
          <button className="nav-btn reminders-btn" onClick={() => navigate("/Reminders")}>
            Reminders
          </button>
          <button className="nav-btn feedback-btn" onClick={() => navigate("/feedback")}>
            Feedback
          </button>
          <button className="nav-btn logout-btn" onClick={() => navigate(`/login`)}>
            Logout
          </button>
        </nav>

        <button onClick={generatePDF} className="pdf-button">Generate PDF</button>

        <div className="reminders-table">
          <div className="table-header">
            <span>Task</span>
            <span>Reminder Time</span>
            <span>Status</span>
            <span>User</span>
            <span>Action</span>
          </div>
          {reminders.map(reminder => (
            <div key={reminder.id} className="table-row">
              <span>{reminder.task_title}</span>
              <span>{new Date(reminder.reminder_time).toLocaleString()}</span>
              <span>{reminder.status}</span>
              <span>{reminder.username}</span>
              <span>
                <button className="delete-btn" onClick={() => deleteReminder(reminder.id)}>
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reminders;