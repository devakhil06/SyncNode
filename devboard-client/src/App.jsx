import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Workspaces from "./pages/Workspaces";
import Workspace from "./pages/Workspace";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import TaskDetails from "./pages/TaskDetails";
import AppLayout from "./components/AppLayout";

const protectedPage = (page) => (
  <ProtectedRoute>
    <AppLayout>{page}</AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={protectedPage(<Dashboard />)}
      />
      <Route
        path="/workspaces"
        element={protectedPage(<Workspaces />)}
      />

      <Route
        path="/workspace/:id"
        element={protectedPage(<Workspace />)}
      />
      <Route
        path="/project/:id"
        element={protectedPage(<Project />)}
      />
      <Route
        path="/task/:id"
        element={protectedPage(<TaskDetails />)}
      />
    </Routes>
  );
}

export default App;
