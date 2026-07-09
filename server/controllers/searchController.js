const Workspace = require("../models/Workspace");
const Project = require("../models/Project");
const Task = require("../models/Task");

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const workspaces = await Workspace.find({
      members: req.user.id,
    }).select("_id");

    const workspaceIds = workspaces.map((w) => w._id);

    const projects = await Project.find({
      workspace: { $in: workspaceIds },
      name: { $regex: q, $options: "i" },
    });

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
      title: { $regex: q, $options: "i" },
    });

    res.json({
      success: true,
      projects,
      tasks,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};