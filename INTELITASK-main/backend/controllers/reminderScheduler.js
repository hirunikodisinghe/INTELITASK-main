const cron = require('node-cron');
const { sendEmail } = require('./emailService');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'intellitask',
  password: 'Danu@6821',
  port: 5432,
});

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await pool.query(
      'SELECT r.*, u.email FROM reminders r JOIN users u ON r.user_id = u.id WHERE r.reminder_time <= $1 AND r.reminder_time > $2',
      [new Date(now.getTime() + 60000), now]
    );
    const dueReminders = result.rows;

    dueReminders.forEach(async (reminder) => {
      const subject = `Reminder: ${reminder.task_title}`;
      const text = `Your task "${reminder.task_title}" is due now at ${new Date(reminder.reminder_time).toLocaleString()}.`;
      sendEmail(reminder.email, subject, text);

      // Delete the reminder after sending
      await pool.query('DELETE FROM reminders WHERE id = $1', [reminder.id]);
    });
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
});

console.log('Reminder scheduler started');