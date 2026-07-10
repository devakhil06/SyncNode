import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (user) return;

    let isMounted = true;

    api
      .get("/users/profile")
      .then((res) => {
        if (!isMounted) return;

        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Unavailable";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1 className="sidebar__brand">SyncNode</h1>

          <nav className="sidebar__nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/workspaces">Workspaces</NavLink>
          </nav>
        </div>

        <div className="sidebar__account">
          <div className="sidebar__profile">
            <div className="sidebar__profile-details">
              <p className="sidebar__profile-name">{user?.name || "SyncNode User"}</p>
              <p className="sidebar__profile-email">{user?.email || "Signed in"}</p>
            </div>
          </div>

          <div className="sidebar__member-since">
            <span>Member since</span>
            <strong>{memberSince}</strong>
          </div>

          <button className="sidebar__logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-area">{children}</main>
    </div>
  );
}

export default AppLayout;
