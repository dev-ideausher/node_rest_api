const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const controller = require("../controller/auth");

router.put(
  "/signup",
  [body("email").not().isEmpty().withMessage("Please enter email")],
  controller.signup
);
router.post("/login", controller.login);
module.exports = router;
