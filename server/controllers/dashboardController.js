const Workspace = require("../models/Workspace");
const Project = require("../models/Project");
const Task = require("../models/Task");

exports.getDashboard = async (req, res) => {
  try {
    const workspaceIds = await Workspace.find({
      members: req.user.id,
    }).select("_id");

    const ids = workspaceIds.map((w) => w._id);

    const totalWorkspaces = ids.length;

    const totalProjects = await Project.countDocuments({
      workspace: { $in: ids },
    });

    const projects = await Project.find({
      workspace: { $in: ids },
    }).select("_id");

    const projectIds = projects.map((p) => p._id);

    const totalTasks = await Task.countDocuments({
      project: { $in: projectIds },
    });

    const todo = await Task.countDocuments({
      project: { $in: projectIds },
      status: "To Do",
    });

    const inProgress = await Task.countDocuments({
      project: { $in: projectIds },
      status: "In Progress",
    });

    const completed = await Task.countDocuments({
      project: { $in: projectIds },
      status: "Done",
    });

    const highPriority = await Task.countDocuments({
      project: { $in: projectIds },
      priority: "High",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: {
        $lt: today,
      },
      status: {
        $ne: "Done",
      },
    });

    const completion =
      totalTasks === 0
        ? 0
        : Number(((completed / totalTasks) * 100).toFixed(2));

    res.json({
      success: true,
      dashboard: {
        totalWorkspaces,
        totalProjects,
        totalTasks,
        todo,
        inProgress,
        completed,
        highPriority,
        overdue,
        completion,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
