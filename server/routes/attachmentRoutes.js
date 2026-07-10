const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment,
} = require("../controllers/attachmentController");

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  uploadAttachment
);

router.get(
  "/task/:taskId",
  authMiddleware,
  getAttachments
);

router.get(
  "/:id/download",
  authMiddleware,
  downloadAttachment
);

router.delete(
  "/:id",
  authMiddleware,
  deleteAttachment
);

module.exports = router;
