const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createWorkspace,
} = require("../controllers/workspaceController");

router.post("/", authMiddleware, createWorkspace);

module.exports = router;