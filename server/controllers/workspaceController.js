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

// Get all workspaces for the logged-in user
exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      members: req.user.id,
    }).populate("owner", "name email");

    res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// get a workspace by id
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    if (!workspace.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
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

//updaterWorkspace
// Update Workspace
exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Only owner can update
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can update it.",
      });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;

    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
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

//delete workspace
// Delete Workspace
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Only owner can delete
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can delete it.",
      });
    }

    await workspace.deleteOne();

    res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const User = require("../models/User");

exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { workspaceId } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find workspace
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    // Only owner can invite
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can invite members.",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Already a member?
    if (
      workspace.members.some(
        (member) => member.toString() === user._id.toString()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "User is already a member.",
      });
    }

    workspace.members.push(user._id);

    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Member added successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can remove members.",
      });
    }

    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: "Workspace owner cannot be removed.",
      });
    }

    workspace.members = workspace.members.filter(
      (member) => member.toString() !== memberId
    );

    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
