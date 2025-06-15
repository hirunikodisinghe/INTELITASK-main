import React, { useState } from 'react';
import './DeleteTask.css'; // Import the CSS file for styling

const DeleteTask = () => {
  const [taskId, setTaskId] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/auth/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Task deleted successfully');
        setTaskId(''); // Reset taskId after successful deletion
      } else {
        const errorData = await response.json();
        alert(`Failed to delete task: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError("An error occurred while deleting the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-task-container">
      <h2>Delete Task</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Task ID"
        value={taskId}
        onChange={(e) => setTaskId(e.target.value)}
        required
      />
      <button onClick={handleDelete} >Delete</button>
    </div>
  );
};

export default DeleteTask;