import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [email, setEmail] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .get(`/workspaces/${id}`)
      .then((res) => {
        if (isMounted) {
          setWorkspace(res.data.workspace);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    api
      .get(`/projects/workspaces/${id}`)
      .then((res) => {
        if (isMounted) {
          setProjects(res.data.projects);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    api
      .get("/users/profile")
      .then((res) => {
        if (isMounted) {
          setCurrentUser(res.data.user);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const res = await api.get(`/workspaces/${id}`);
      setWorkspace(res.data.workspace);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects/workspaces/${id}`);
      setProjects(res.data.projects);
    } catch (err) {
      console.log(err);
    }
  };

  // Create Project
  const createProject = async () => {
    if (!name.trim()) return;

    try {
      await api.post("/projects", {
        name,
        description,
        workspaceId: id,
      });

      setName("");
      setDescription("");

      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create project");
    }
  };

  // Invite Member
  const inviteMember = async () => {
    if (!email.trim()) return;

    try {
      const res = await api.post(`/workspaces/${id}/invite`, {
        email,
      });

      alert(res.data.message);

      setEmail("");

      fetchWorkspace();
    } catch (err) {
      alert(err.response?.data?.message || "Invitation failed");
    }
  };

  const removeMember = async (memberId) => {
    const shouldRemove = confirm(
      "Remove this member from the workspace?"
    );

    if (!shouldRemove) return;

    try {
      await api.delete(`/workspaces/${id}/members/${memberId}`);
      fetchWorkspace();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const deleteWorkspace = async () => {
    const shouldDelete = confirm(
      "Delete this workspace? This action cannot be undone."
    );

    if (!shouldDelete) return;

    try {
      await api.delete(`/workspaces/${id}`);
      navigate("/workspaces");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete workspace");
    }
  };

  const deleteProject = async (projectId) => {
    const shouldDelete = confirm(
      "Delete this project? This action cannot be undone."
    );

    if (!shouldDelete) return;

    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  const ownerId = workspace?.owner?._id || workspace?.owner;
  const isOwner = ownerId === currentUser?.id;

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <h1>{workspace?.name || "Workspace"}</h1>
          <p>Projects, members, and collaboration settings.</p>
        </div>
      </header>

      <section className="grid grid--two">
        <div className="surface">
          <h2>Projects</h2>

          <br />

          {projects.length === 0 ? (
            <p>No projects yet.</p>
          ) : (
            <div className="workspace-list">
              {projects.map((project) => (
                <div
                  className="clickable-card"
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  <div className="card-header-row">
                    <h3>{project.name}</h3>

                    {(project.owner?._id || project.owner) ===
                      currentUser?.id && (
                      <button
                        className="button-danger button-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project._id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p>{project.description}</p>

                  <small>
                    <strong>Status:</strong> {project.status}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface">
          <h2>Members</h2>

          <br />

          {workspace?.members?.length ? (
            workspace.members.map((member) => (
              <div className="member-row" key={member._id}>
                <div>
                  <strong>
                    {member.name}
                    {member._id === ownerId ? " (Owner)" : ""}
                  </strong>

                  <br />

                  <small>{member.email}</small>
                </div>

                {isOwner && member._id !== ownerId && (
                  <button
                    className="button-danger button-small"
                    onClick={() => removeMember(member._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No members found.</p>
          )}
        </div>
      </section>

      <section className="grid grid--two">
        <div className="surface">
          <h2>Create Project</h2>

          <br />

          <div className="stack">
            <input
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button onClick={createProject}>
              Create Project
            </button>
          </div>
        </div>

        <div className="surface">
          <h2>Invite Member</h2>

          <br />

          <div className="form-row">
            <input
              type="email"
              placeholder="Enter member email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={inviteMember}>
              Invite
            </button>
          </div>
        </div>
      </section>

      {isOwner && (
        <section className="surface danger-zone">
          <div>
            <h2>Delete Workspace</h2>
            <p>
              Permanently remove this workspace from your account.
            </p>
          </div>

          <button className="button-danger" onClick={deleteWorkspace}>
            Delete Workspace
          </button>
        </section>
      )}
    </div>
  );
}

export default Workspace;
