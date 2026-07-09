import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket/socket";
import AttachmentSection from "../components/AttachmentSection";

function TaskDetails() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/task/${id}`);
      setComments(res.data.comments);
    } catch (err) {
      console.log(err);
    }
  };

  // Add Comment
  const addComment = async () => {
    if (!text.trim()) return;

    try {
      await api.post("/comments", {
        taskId: id,
        content: text,
      });

      setText("");

      // Refresh immediately
      fetchComments();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  // Delete Comment
  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);

      // Refresh immediately
      fetchComments();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  // Initial Load
  useEffect(() => {
    let isMounted = true;

    api
      .get(`/tasks/${id}`)
      .then((res) => {
        if (isMounted) {
          setTask(res.data.task);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    api
      .get(`/comments/task/${id}`)
      .then((res) => {
        if (isMounted) {
          setComments(res.data.comments);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Socket Events
  useEffect(() => {
    const refreshComments = async () => {
      try {
        const res = await api.get(`/comments/task/${id}`);
        setComments(res.data.comments);
      } catch (err) {
        console.log(err);
      }
    };

    socket.on("commentCreated", refreshComments);
    socket.on("commentDeleted", refreshComments);

    return () => {
      socket.off("commentCreated", refreshComments);
      socket.off("commentDeleted", refreshComments);
    };
  }, [id]);

  if (!task) {
    return <h2 style={{ padding: "30px" }}>Loading...</h2>;
  }

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
        </div>
      </header>

      <section className="grid grid--cards">
        <div className="metric-card">
          <span>Status</span>
          <strong>{task.status}</strong>
        </div>

        <div className="metric-card">
          <span>Priority</span>
          <strong>{task.priority}</strong>
        </div>

        <div className="metric-card">
          <span>Created By</span>
          <strong>{task.createdBy?.name}</strong>
        </div>

        <div className="metric-card">
          <span>Due Date</span>
          <strong>
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "Not Set"}
          </strong>
        </div>
      </section>

      <section className="grid grid--two">
        <div className="surface">
          <h2>Comments</h2>

          <br />

          <div className="stack">
            <textarea
              rows="4"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button onClick={addComment}>Add Comment</button>

            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div className="clickable-card" key={comment._id}>
                  <strong>{comment.user?.name || "Unknown User"}</strong>

                  <p>{comment.content}</p>

                  <small>
                    {new Date(comment.createdAt).toLocaleString()}
                  </small>

                  <br />
                  <br />

                  <button onClick={() => deleteComment(comment._id)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="surface">
          <AttachmentSection taskId={id} />
        </div>
      </section>
    </div>
  );
}

export default TaskDetails;
