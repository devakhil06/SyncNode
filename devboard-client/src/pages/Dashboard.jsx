import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/dashboard")
      .then((res) => {
        if (isMounted) {
          setDashboard(res.data.dashboard);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalTasks = dashboard?.totalTasks || 0;

  const metrics = [
    { label: "Total Tasks", value: dashboard?.totalTasks || 0 },
    { label: "Completed", value: dashboard?.completed || 0 },
    { label: "In Progress", value: dashboard?.inProgress || 0 },
    { label: "Overdue", value: dashboard?.overdue || 0 },
  ];

  const getWidth = (value) => {
    if (!totalTasks) return "0%";

    return `${Math.round((value / totalTasks) * 100)}%`;
  };

  const statusRows = [
    {
      label: "Done",
      value: dashboard?.completed || 0,
      width: getWidth(dashboard?.completed || 0),
    },
    {
      label: "In Progress",
      value: dashboard?.inProgress || 0,
      width: getWidth(dashboard?.inProgress || 0),
    },
    {
      label: "To Do",
      value: dashboard?.todo || 0,
      width: getWidth(dashboard?.todo || 0),
    },
  ];

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Track work across projects, teams, and deadlines.</p>
        </div>
      </header>

      <section className="grid grid--cards">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </section>

      <section className="grid grid--two">
        <div className="surface">
          <h2>Tasks by Status</h2>

          <br />

          <div className="bar-list">
            {statusRows.map((row) => (
              <div className="bar-row" key={row.label}>
                <div className="bar-row__meta">
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: row.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface">
          <h2>Workspace Summary</h2>

          <br />

          <div className="stack">
            <p>
              <strong>Workspaces:</strong>{" "}
              {dashboard?.totalWorkspaces || 0}
            </p>
            <p>
              <strong>Projects:</strong>{" "}
              {dashboard?.totalProjects || 0}
            </p>
            <p>
              <strong>High Priority:</strong>{" "}
              {dashboard?.highPriority || 0}
            </p>
            <p>
              <strong>Completion:</strong>{" "}
              {dashboard?.completion || 0}%
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
