const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
} = require("../controllers/workspaceController");

router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.get("/:id", authMiddleware, getWorkspaceById);
router.put("/:id", authMiddleware, updateWorkspace);
router.delete("/:id", authMiddleware, deleteWorkspace);
router.post("/:workspaceId/invite", authMiddleware, inviteMember);
router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  removeMember
);
module.exports = router;
