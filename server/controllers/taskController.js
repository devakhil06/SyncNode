const Task = require("../models/Task");
const { getIO } = require("../socket");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

exports.createTask = async (req, res) => {
  try {
    console.log("========== CREATE TASK ==========");
    console.log("Body:", req.body);
    console.log("User:", req.user);

    const { title, description, projectId, assignedTo, priority, dueDate } =
      req.body;

    console.log("Step 1");

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and Project ID are required.",
      });
    }

    console.log("Step 2");

    const project = await Project.findById(projectId);
    console.log("Project:", project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    console.log("Step 3");

    const workspace = await Workspace.findById(project.workspace);
    console.log("Workspace:", workspace);

    console.log("Step 4");

    const isMember = workspace.members.some(
      member => member.toString() === req.user.id
    );

    console.log("isMember:", isMember);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    console.log("Step 5");

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.user.id,
      priority,
      dueDate,
    });

    console.log("Task created:", task);

    console.log("Step 6");

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    console.log("Populated task:", populatedTask);

    console.log("Step 7");

    getIO().to(project.workspace.toString()).emit("taskCreated", populatedTask);

    console.log("Event emitted");

    return res.status(201).json({
      success: true,
      task: populatedTask,
    });

  } catch (error) {
    console.error("========== ERROR ==========");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { status, priority, search, page = 1, limit = 10 } = req.query;

    // Check if project exists
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Check workspace membership
    const workspace = await Workspace.findById(project.workspace);

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user.id,
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // Build dynamic query
    const query = {
      project: projectId,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Fetch tasks
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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

//get tasks by project id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name workspace");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const project = await Project.findById(task.project._id);

    const workspace = await Workspace.findById(project.workspace);

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user.id,
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//update task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate || task.dueDate;

    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const project = await Project.findById(task.project);

    getIO().to(project.workspace.toString()).emit("taskUpdated", updatedTask);

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }
    const project = await Project.findById(task.project);

    getIO().to(project.workspace.toString()).emit("taskDeleted", {
      taskId: task._id,
    });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
