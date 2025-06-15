const connection = require('../db');
const schedule = require('node-schedule');
const { sendEmail } = require('./emailService');

// Function to send start notification
const sendStartNotification = async (userId, taskId) => {
  try {
    const [task] = await connection.promise().query(
      'SELECT * FROM tasks WHERE id = ?', [taskId]
    );
    if (task.length) {
      const [user] = await connection.promise().query(
        'SELECT email FROM users WHERE id = ?', [userId]
      );
      if (user.length) {
        const emailSubject = `Task Started: ${task[0].title}`;
        const emailText = `Your task "${task[0].title}" has started!\nDescription: ${task[0].description}`;
        await sendEmail(user[0].email, emailSubject, emailText);
        console.log(`START NOTIFICATION: User ${userId}, Task "${task[0].title}" has started!`);
      }
    }
  } catch (error) {
    console.error("Start notification error:", error.message);
  }
};

// Function to send reminder notification
const sendNotification = async (userId, taskId) => {
  try {
    const [task] = await connection.promise().query(
      'SELECT * FROM tasks WHERE id = ?', [taskId]
    );
    if (task.length) {
      const [user] = await connection.promise().query(
        'SELECT email FROM users WHERE id = ?', [userId]
      );
      if (user.length) {
        const emailSubject = `Reminder: ${task[0].title}`;
        const emailText = `Task: ${task[0].title}\nDescription: ${task[0].description}\nDue Date: ${new Date(task[0].due_date).toLocaleString()}`;
        await sendEmail(user[0].email, emailSubject, emailText);
        console.log(`REMINDER: User ${userId}, Task: ${task[0].title}, Due: ${new Date(task[0].due_date).toLocaleString()}`);
      }
    }
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

// Function to schedule notifications
const scheduleNotification = (userId, taskId, time, type = "reminder") => {
  const date = new Date(time);
  if (date > new Date()) {
    schedule.scheduleJob(date, () =>
      type === "start" ? sendStartNotification(userId, taskId) : sendNotification(userId, taskId)
    );
  }
};

// Create a new task with overlap checking
exports.createTask = async (req, res) => {
  const { user_id, category_id, title, description, due_date, start_date, priority, status } = req.body;

  try {
    // Check for overlapping tasks if start_date and due_date are provided
    if (start_date && due_date) {
      const [existingTasks] = await connection.promise().query(
        `SELECT * FROM tasks 
         WHERE user_id = ? 
         AND (
           (start_date <= ? AND due_date >= ?) 
           OR (start_date <= ? AND due_date >= ?)
         )`,
        [user_id, due_date, start_date, start_date, due_date]
      );

      if (existingTasks.length > 0) {
        return res.status(400).json({ error: 'Task conflicts with existing schedule' });
      }
    }

    const [result] = await connection.promise().query(
      `INSERT INTO tasks (user_id, category_id, title, description, due_date, start_date, priority, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id, title, description, due_date, start_date, priority, status || 'pending']
    );

    // Schedule notifications if dates are provided
    if (start_date) scheduleNotification(user_id, result.insertId, start_date, "start");
    if (due_date) scheduleNotification(user_id, result.insertId, due_date);

    res.status(201).json({ message: 'Task added', taskId: result.insertId });
  } catch (err) {
    console.error("Error adding task:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get all categories
exports.getCategory = (req, res) => {
  const query = 'SELECT id, name FROM categories';
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Get all tasks
exports.getTasks = (req, res) => {
  const query = `
    SELECT tasks.*, users.username, categories.name AS category_name 
    FROM tasks
    JOIN users ON tasks.user_id = users.id
    LEFT JOIN categories ON tasks.category_id = categories.id
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Get tasks by user ID
exports.getTasksByUser = (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT tasks.*, categories.name AS category_name 
    FROM tasks
    LEFT JOIN categories ON tasks.category_id = categories.id
    WHERE tasks.user_id = ?
  `;
  connection.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching tasks by user:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Update task status
exports.updateTaskStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE tasks SET status = ? WHERE id = ?';
  connection.query(query, [status, id], (err) => {
    if (err) {
      console.error("Error updating task status:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Task status updated' });
  });
};

// Update task details
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, start_date, priority, category_id, status } = req.body;
  const query = `
    UPDATE tasks 
    SET title = ?, description = ?, due_date = ?, start_date = ?, priority = ?, category_id = ?, status = ? 
    WHERE id = ?
  `;
  connection.query(query, [title, description, due_date, start_date, priority, category_id, status, id], (err) => {
    if (err) {
      console.error("Error updating task:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Task updated' });
  });
};

// Delete task
exports.deleteTask = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM tasks WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) {
      console.error("Error deleting task:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Task deleted' });
  });
};

// Get all reminders
exports.getAllReminders = (req, res) => {
  const query = `
    SELECT reminders.*, tasks.title AS task_title, users.username 
    FROM reminders
    JOIN tasks ON reminders.task_id = tasks.id
    JOIN users ON reminders.user_id = users.id
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reminders:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Create a reminder
exports.createReminder = (req, res) => {
  const { user_id, task_id, reminder_time } = req.body;

  const query = `
    INSERT INTO reminders (user_id, task_id, reminder_time) 
    VALUES (?, ?, ?)
  `;
  connection.query(query, [user_id, task_id, reminder_time], (err, results) => {
    if (err) {
      console.error("Error creating reminder:", err.message);
      return res.status(500).json({ error: err.message });
    }

    scheduleNotification(user_id, task_id, reminder_time);
    res.status(201).json({ message: 'Reminder created successfully', reminderId: results.insertId });
  });
};

// Update a reminder
exports.updateReminder = (req, res) => {
  const { id } = req.params;
  const { reminder_time } = req.body;
  const query = 'UPDATE reminders SET reminder_time = ? WHERE id = ?';
  connection.query(query, [reminder_time, id], (err) => {
    if (err) {
      console.error("Error updating reminder:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Reminder updated' });
  });
};

// Delete a reminder
exports.deleteReminder = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM reminders WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) {
      console.error("Error deleting reminder:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Reminder deleted' });
  });
};

// Automatically delete expired reminders
const deleteExpiredReminders = async () => {
  try {
    await connection.promise().query('DELETE FROM reminders WHERE reminder_time < NOW()');
    console.log("Expired reminders cleaned up");
  } catch (error) {
    console.error('Failed to delete expired reminders:', error.message);
  }
};

// Schedule the deletion of expired reminders every hour
setInterval(deleteExpiredReminders, 3600000); // Corrected to 3600000 (1 hour in milliseconds)