function CreateTaskForm({
  title,
  setTitle,
  description,
  setDescription,
  createTask,
}) {
  return (
    <div>
      <h2>Create Task</h2>

      <br />

      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <button onClick={createTask}>
        Create Task
      </button>
    </div>
  );
}

export default CreateTaskForm;
