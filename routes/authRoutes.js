const router = require("express").Router();
const { body } = require("express-validator");
const { validateResult } = require("../middleware/validator");
const { register, login } = require("../controllers/authController");

router.post("/register", [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validateResult
], register);

router.post("/login", [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  validateResult
], login);

module.exports = router;