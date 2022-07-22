const express = require("express");

const authController = require("../controllers/auth");
const { check, body } = require("express-validator");

const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Enter a valid email"),
    body(
      "password",
      "Password must be min 5 char long, with only text and Numbers"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email Address")
      .normalizeEmail()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email Exists");
          }
        });
      }),
    body(
      "password",
      "Password must be more than 5 characters and consists only numbers and text"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),

    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords must match!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
