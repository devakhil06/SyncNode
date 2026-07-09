const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

exports.createProject = async (req, res) => {
  try {
    const { name, description, workspaceId, dueDate } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Name and Workspace ID are required.",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    // Ensure the logged-in user belongs to the workspace
    const isMember = workspace.members.some(
    member => member.toString() === req.user.id
    );

    if (!isMember) {
    return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace.",
    });
    }

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      owner: req.user.id,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//get all projects in a workspace 
exports.getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
    }).populate("owner", "name email");

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("workspace", "name");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }
//get project by id

    const workspace = await Workspace.findById(project.workspace._id);

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, dueDate } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can update it.",
      });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.dueDate = dueDate || project.dueDate;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
//delete project
exports.deleteProject = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can delete it.",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};