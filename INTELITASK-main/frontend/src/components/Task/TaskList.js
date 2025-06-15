import React, { useEffect, useState } from 'react';
import UpdateTask from './updatetask';
import './TaskList.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/auth/api/tasks/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userId]);

  useEffect(() => {
    const checkReminders = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5000/auth/api/reminders`);
        if (!response.ok) throw new Error('Failed to fetch reminders');
        const reminders = await response.json();
        const userReminders = reminders.filter(reminder => reminder.user_id === parseInt(userId));

        userReminders.forEach(reminder => {
          const reminderTime = new Date(reminder.reminder_time);
          const now = new Date();
          if (reminderTime <= new Date(now.getTime() + 60000) && reminderTime > now) {
            toast.info(`Reminder: ${reminder.task_title} - Due at ${reminderTime.toLocaleString()}`);
          }
        });
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 60000);
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleUpdateClick = (id) => setSelectedTaskId(id);

  const handleCreateReminder = async (taskId) => {
    const reminderTime = prompt("Enter reminder time (YYYY-MM-DD HH:MM):");
    if (!reminderTime) return;

    try {
      const response = await fetch(`http://localhost:5000/auth/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          task_id: taskId,
          reminder_time: reminderTime,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Reminder set successfully!");
      } else {
        throw new Error(responseData.error || 'Unknown error');
      }
    } catch (error) {
      toast.error(`Failed to set reminder: ${error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`http://localhost:5000/auth/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
        toast.success("Task deleted successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
    } catch (error) {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Title", "Description", "Start Date", "Due Date", "Priority", "Status", "Category"];
    const tableRows = [];

    tasks.forEach(task => {
      const taskData = [
        task.id,
        task.title,
        task.description,
        task.start_date ? new Date(task.start_date).toLocaleString() : 'N/A',
        new Date(task.due_date).toLocaleString(),
        task.priority,
        task.status,
        task.category_name || 'N/A'
      ];
      tableRows.push(taskData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("User Task Report", 14, 15);
    doc.save(`user_${userId}_task_report.pdf`);
  };

  return (
    <div className="task-list-page">
      <div className="task-list-container">
        <h2>Your Tasks</h2>
        <button onClick={generatePDF} className="pdf-button">Generate PDF Report</button>
        {loading && <p className="loading-text">Loading tasks...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <div className="task-cards">
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks available.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  <p><strong>Description:</strong> {task.description}</p>
                  <p><strong>Start Date:</strong> {task.start_date ? new Date(task.start_date).toLocaleString() : 'N/A'}</p>
                  <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}</p>
                  <p><strong>Priority:</strong> {task.priority}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                  <p><strong>Category:</strong> {task.category_name || 'N/A'}</p>
                  <div className="task-actions">
                    <button className="update-button" onClick={() => handleUpdateClick(task.id)}>Update</button>
                    <button className="reminder-button" onClick={() => handleCreateReminder(task.id)}>Set Reminder</button>
                    <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {selectedTaskId && <UpdateTask taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default TaskList;