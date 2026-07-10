const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

router.post("/", authMiddleware, createComment);

router.get("/task/:taskId", authMiddleware, getComments);

router.delete("/:id", authMiddleware, deleteComment);

module.exports = router;