const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendEmail } = require('../controllers/emailService');

// GET /auth/api/categories
router.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /auth/api/tasks
router.post('/api/tasks', async (req, res) => {
  const { user_id, category_id, title, description, due_date, start_date, priority, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, category_id, title, description, due_date, start_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, category_id, title, description, due_date, start_date, priority, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /auth/api/reminders
router.get('/api/reminders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reminders');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST /auth/api/reminders
router.post('/api/reminders', async (req, res) => {
  const { user_id, task_title, reminder_time } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reminders (user_id, task_title, reminder_time) VALUES ($1, $2, $3) RETURNING *',
      [user_id, task_title, reminder_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Test email route (optional)
router.get('/test-email', (req, res) => {
  sendEmail('yourpersonalemail@example.com', 'Test Subject', 'This is a test email.');
  res.send('Test email sent');
});

module.exports = router;