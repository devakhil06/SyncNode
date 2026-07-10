const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const { getIO } = require("../socket");
exports.createComment = async (req, res) => {
  try {
    const { taskId, content } = req.body;

    if (!taskId || !content) {
      return res.status(400).json({
        success: false,
        message: "Task ID and content are required.",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const comment = await Comment.create({
      content,
      task: taskId,
      user: req.user.id,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name email");

    // Emit Socket Event
    getIO()
      .to(project.workspace.toString())
      .emit("commentCreated", populatedComment);

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: populatedComment,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//get comments for a task
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId,
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the author can delete this comment.",
      });
    }

    const task = await Task.findById(comment.task);
    const project = await Project.findById(task.project);

    await comment.deleteOne();

    // Emit Socket Event
    getIO()
      .to(project.workspace.toString())
      .emit("commentDeleted", {
        commentId: req.params.id,
      });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};