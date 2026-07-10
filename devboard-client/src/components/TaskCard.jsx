function TaskCard({
  task,
  navigate,
  setEditingTask,
  deleteTask,
}) {
  const priorityBadges = {
    High: "🔴 High",
    Medium: "🟡 Medium",
    Low: "🟢 Low",
  };

  const statusBadges = {
    "To Do": "🔵 To Do",
    "In Progress": "🟠 In Progress",
    Done: "🟢 Done",
  };

  const getDueDateLabel = () => {
    if (!task.dueDate) return "Not Set";

    const dueDate = new Date(task.dueDate);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) return "⚠ Overdue";
    if (dueDate.getTime() === today.getTime()) return "📅 Due Today";

    return `📅 ${dueDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })}`;
  };

  const badgeStyle = {
    display: "inline-block",
    background: "#27272A",
    border: "1px solid #3F3F46",
    borderRadius: "999px",
    color: "#FAFAFA",
    padding: "4px 9px",
    marginTop: "4px",
  };

  return (
    <div
      className="task-card"
      onClick={() => navigate(`/task/${task._id}`)}
    >
      <h3>{task.title}</h3>

      <p>{task.description}</p>

      <p>
        <strong>Status:</strong>{" "}
        <span style={badgeStyle}>
          {statusBadges[task.status] || task.status}
        </span>
      </p>

      <p>
        <strong>Priority:</strong>{" "}
        <span style={badgeStyle}>
          {priorityBadges[task.priority] || task.priority}
        </span>
      </p>

      <p>
        <strong>Due Date:</strong>{" "}
        <span style={badgeStyle}>{getDueDateLabel()}</span>
      </p>

      <p>
        <strong>Assigned To:</strong>{" "}
        {task.assignedTo?.name || "Unassigned"}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingTask(task);
        }}
      >
        Edit
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task._id);
        }}
        className="button-danger"
        style={{ marginLeft: "10px" }}
      >
        Delete
      </button>
    </div>
  );
}

export default TaskCard;
