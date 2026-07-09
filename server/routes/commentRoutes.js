const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createComment,
  getComments,
} = require("../controllers/commentController");

router.post("/", authMiddleware, createComment);
router.get("/task/:taskId", authMiddleware, getComments);

module.exports = router;