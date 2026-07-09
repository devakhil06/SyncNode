import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [name, setName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    api
      .get("/workspaces")
      .then((res) => {
        if (isMounted) {
          setWorkspaces(res.data.workspaces);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.log(err);
    }
  };

  const createWorkspace = async () => {
    if (!name.trim()) return;

    try {
      await api.post("/workspaces", {
        name,
      });

      setName("");

      fetchWorkspaces();

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <h1>Workspaces</h1>
          <p>Create teams, manage members, and open project boards.</p>
        </div>
      </header>

      <section className="surface">
        <h2>New Workspace</h2>

        <br />

        <div className="form-row">
          <input
            placeholder="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={createWorkspace}>
            Create
          </button>
        </div>
      </section>

      <section className="surface">
        <h2>All Workspaces</h2>

        <br />

        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div
              className="clickable-card"
              key={workspace._id}
              onClick={() => navigate(`/workspace/${workspace._id}`)}
            >
              <h3>{workspace.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Workspaces;
