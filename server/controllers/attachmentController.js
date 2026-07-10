const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const Attachment = require("../models/Attachment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file.",
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
      member => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const result = await cloudinary.uploader.upload(
  `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
  {
    folder: "devboard/tasks",
    resource_type: "auto",
  }
);

const attachment = await Attachment.create({
  task: taskId,
  uploadedBy: req.user.id,
  fileName: req.file.originalname,
  fileUrl: result.secure_url,
  publicId: result.public_id,
  fileType: req.file.mimetype,
  fileSize: req.file.size,
});

return res.status(201).json({
  success: true,
  message: "File uploaded successfully.",
  attachment,
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAttachments = async (req, res) => {
  try {

    const attachments = await Attachment.find({
      task: req.params.taskId,
    })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attachments.length,
      attachments,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};


exports.downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found.",
      });
    }

    const task = await Task.findById(attachment.task);

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

    const fileResponse = await fetch(attachment.fileUrl);

    if (!fileResponse.ok) {
      return res.status(502).json({
        success: false,
        message: "Failed to download attachment from storage.",
      });
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    const safeFileName = attachment.fileName.replace(/["\\]/g, "");

    res.setHeader(
      "Content-Type",
      attachment.fileType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"`
    );

    return res.send(fileBuffer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



exports.deleteAttachment = async (req, res) => {
  try {

    const attachment = await Attachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found.",
      });
    }

    if (attachment.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the uploader can delete this file.",
      });
    }

    await cloudinary.uploader.destroy(attachment.publicId);

    await attachment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attachment deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
