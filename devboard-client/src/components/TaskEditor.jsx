import { useState } from "react";

const formatTaskForEditing = (editingTask) => ({
  ...editingTask,
  dueDate: editingTask.dueDate
    ? editingTask.dueDate.substring(0, 10)
    : "",
  assignedTo:
    editingTask.assignedTo?._id ||
    editingTask.assignedTo ||
    "",
});

function TaskEditor({
  editingTask,
  setEditingTask,
  updateTask,
  members = [],
}) {
  const [task, setTask] = useState(() =>
    editingTask ? formatTaskForEditing(editingTask) : null
  );

  if (!task) return null;

  return (
    <div className="surface">
      <h2>Edit Task</h2>

      <br />

      <input
        value={task.title}
        onChange={(e) =>
          setTask({
            ...task,
            title: e.target.value,
          })
        }
        placeholder="Title"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <textarea
        rows={4}
        value={task.description}
        onChange={(e) =>
          setTask({
            ...task,
            description: e.target.value,
          })
        }
        placeholder="Description"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <label>Status</label>

      <br />

      <select
        value={task.status}
        onChange={(e) =>
          setTask({
            ...task,
            status: e.target.value,
          })
        }
      >
        <option>To Do</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>

      <br />
      <br />

      <label>Priority</label>

      <br />

      <select
        value={task.priority}
        onChange={(e) =>
          setTask({
            ...task,
            priority: e.target.value,
          })
        }
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <br />
      <br />

      <label>Due Date</label>

      <br />

      <input
        type="date"
        value={task.dueDate}
        onChange={(e) =>
          setTask({
            ...task,
            dueDate: e.target.value,
          })
        }
      />

      <br />
      <br />

      <label>Assigned To</label>

      <br />

      <select
        value={task.assignedTo}
        onChange={(e) =>
          setTask({
            ...task,
            assignedTo: e.target.value,
          })
        }
      >
        <option value="">Unassigned</option>

        {members.map((member) => (
          <option key={member._id} value={member._id}>
            {member.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <button onClick={() => updateTask(task)}>
        Save
      </button>

      <button
        className="button-secondary"
        style={{ marginLeft: "10px" }}
        onClick={() => setEditingTask(null)}
      >
        Cancel
      </button>
    </div>
  );
}

export default TaskEditor;
