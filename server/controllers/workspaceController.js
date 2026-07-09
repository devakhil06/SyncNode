const Workspace = require("../models/Workspace");

// Create Workspace
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Workspace name is required",
      });
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};