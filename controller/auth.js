const User = require("../models/user");
const { validationResult } = require("express-validator");
const statusCodes = require("../constants/status_codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../constants/constants.js");

exports.signup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userWithEmail = await User.findOne({ email: email });

    if (userWithEmail != null) {
      //Email already exists
      const error = new Error("Email already exists ");
      error.statusCode = statusCodes.validationFailed;
      next(error);
      return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      //Server side validation failedccqq
      const error = new Error("Server side validation failed");
      error.statusCode = statusCodes.validationFailed;
      next(error);
      return;
    }
    const name = req.body.name;

    const password = await bcrypt.hashSync(req.body.password, 12);

    const user = User({ name: name, email: email, password: password });
    await user.save();

    const token = jwt.sign(
      { email: email, userId: user._id.toString() },
      constants.jwtSecret,
      { expiresIn: "1h" }
    );

    res
      .status(statusCodes.created)
      .json({ message: "User Signed up", id: user._id, token: token });
  } catch (e) {
    e.statusCode = statusCodes.serverError;
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = Error("Invalid Email or Password");
      error.statusCode = statusCodes.authFailed;
      next(error);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const error = Error("Invalid Email or Password");
      error.statusCode = statusCodes.authFailed;
      next(error);
      return;
    }
    const token = jwt.sign(
      { email: email, userId: user._id.toString() },
      constants.jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token: token,
      userId: user._id,
    });
  } catch (e) {
    e.statusCode = statusCodes.serverError;
    next(e);
  }
};
