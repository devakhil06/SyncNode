import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket/socket";
import TaskCard from "../components/TaskCard";
import TaskEditor from "../components/TaskEditor";
import CreateTaskForm from "../components/CreateTaskForm";
function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Initial Load
  useEffect(() => {
    let isMounted = true;

    api
      .get(`/projects/${id}`)
      .then((res) => {
        if (isMounted) {
          setProject(res.data.project);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    api
      .get(`/tasks/projects/${id}`)
      .then((res) => {
        if (isMounted) {
          setTasks(res.data.tasks);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Socket.IO
  useEffect(() => {
    if (!project) return;

    const refreshTasks = async () => {
      try {
        const res = await api.get(`/tasks/projects/${id}`);
        setTasks(res.data.tasks);
      } catch (err) {
        console.log(err);
      }
    };

    socket.emit("joinWorkspace", project.workspace);

    socket.on("taskCreated", () => {
      refreshTasks();
    });

    socket.on("taskUpdated", () => {
      refreshTasks();
    });

    socket.on("taskDeleted", () => {
      refreshTasks();
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [id, project]);

  // Create Task
  const createTask = async () => {
    if (!title.trim()) return;

    try {
      await api.post("/tasks", {
        title,
        description,
        projectId: id,
        priority: "Medium",
      });

      setTitle("");
      setDescription("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      await api.put(`/tasks/${updatedTask._id}`, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        assignedTo: updatedTask.assignedTo || null,
      });

      setEditingTask(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  const todoTasks = tasks.filter((task) => task.status === "To Do");
  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  );
  const doneTasks = tasks.filter((task) => task.status === "Done");

  const renderTaskColumn = (title, columnTasks) => (
    <div className="kanban-column">
      <h2>
        {title} ({columnTasks.length})
      </h2>

      {columnTasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        columnTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            navigate={navigate}
            setEditingTask={setEditingTask}
            deleteTask={deleteTask}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <h1>Kanban</h1>
          <p>Move work through To Do, In Progress, and Done.</p>
        </div>
      </header>

      {editingTask && (
        <TaskEditor
          key={editingTask._id}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          updateTask={updateTask}
          members={project?.workspace?.members || []}
        />
      )}

      <section className="surface">
        <CreateTaskForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          createTask={createTask}
        />
      </section>

      {tasks.length === 0 ? (
        <section className="surface">
          <p>No tasks found.</p>
        </section>
      ) : (
        <section className="kanban-board">
          {renderTaskColumn("To Do", todoTasks)}
          {renderTaskColumn("In Progress", inProgressTasks)}
          {renderTaskColumn("Done", doneTasks)}
        </section>
      )}
    </div>
  );
}

export default Project;
