import React, { useState, useEffect } from "react";
import './AddTask.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("pending");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) checkReminders();
    }, 60000); // Check reminders every minute
    return () => clearInterval(interval);
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User not logged in. Please log in first.");
      return;
    }

    setLoading(true);
    setError(null);

    const startDateTime = startDate && startTime ? `${startDate}T${startTime}` : startDate;
    const dueDateTime = dueDate && dueTime ? `${dueDate}T${dueTime}` : dueDate;

    try {
      const response = await fetch("http://localhost:5000/auth/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          category_id: categoryId,
          title,
          description,
          due_date: dueDateTime,
          start_date: startDateTime,
          priority,
          status,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Task added successfully!");
        setTitle("");
        setDescription("");
        setDueDate("");
        setStartDate("");
        setStartTime("");
        setDueTime("");
        setPriority("");
        setCategoryId("");
        setStatus("pending");

        if (dueDateTime) {
          const reminderResponse = await fetch("http://localhost:5000/auth/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              task_title: title,
              reminder_time: dueDateTime,
            }),
          });
          const reminderData = await reminderResponse.json();
          console.log("Reminder created:", reminderData);
        }

        checkReminders();
      } else {
        throw new Error(responseData.error || "Unknown error occurred");
      }
    } catch (error) {
      toast.error(`Failed to add task: ${error.message}`);
      setError(`Failed to add task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkReminders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/auth/api/reminders`);
      if (!response.ok) throw new Error("Failed to fetch reminders");
      const reminders = await response.json();
      console.log("Fetched reminders:", reminders);

      const userReminders = reminders.filter(reminder => reminder.user_id === parseInt(userId));
      userReminders.forEach(reminder => {
        const reminderTime = new Date(reminder.reminder_time);
        const now = new Date();
        if (reminderTime <= new Date(now.getTime() + 3600000) && reminderTime > now) {
          toast.info(`Reminder: ${reminder.task_title} - Due at ${reminderTime.toLocaleString()}`);
        }
      });
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  };

  const startVoiceRecognition = (field) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'title') setTitle(transcript);
      else if (field === 'description') setDescription(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error("Speech recognition failed");
    };
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="add-task-page">
      <div className="add-task-container">
        <div className="card">
          <h2>Add New Task</h2>
          {loading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">Title
              <label></label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <button type="button" onClick={() => startVoiceRecognition('title')} className="voice-btn">🎤</button>
              </div>
            </div>

            <div className="form-group">Description
              <label></label>
              <div className="input-with-button">
                <textarea
                  placeholder="Enter task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
                <button type="button" onClick={() => startVoiceRecognition('description')} className="voice-btn">🎤</button>
              </div>
            </div>

            <div className="form-group date-time-group">Start Date & Time
              <label></label>
              <div className="date-time-inputs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!startDate}
                />
              </div>
            </div>

            <div className="form-group date-time-group">Due Date & Time
              <label></label>
              <div className="date-time-inputs">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  min={startDate || today}
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  disabled={!dueDate}
                />
              </div>
            </div>

            <div className="form-group">Priority
              <label></label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group">Status
              <label></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">Category
              <label></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Task"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default AddTask;