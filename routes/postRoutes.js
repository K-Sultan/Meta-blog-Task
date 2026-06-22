const router = require("express").Router();
const { body } = require("express-validator");
const { validateResult } = require("../middleware/validator");
const auth = require("../middleware/authMiddleware");
const { createPost, getPosts, updatePost, deletePost } = require("../controllers/postController");

router.get("/", getPosts);

router.post("/", auth, [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  validateResult
], createPost);

router.put("/:id", auth, [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  validateResult
], updatePost);

router.delete("/:id", auth, deletePost);

module.exports = router;