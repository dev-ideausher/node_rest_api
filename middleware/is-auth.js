const jwt = require("jsonwebtoken");
const statusCodes = require("../constants/status_codes");
const constants = require("../constants/constants");

module.exports = (req, res, next) => {
  try {
    const token = req.get("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, constants.jwtSecret);
    if (!decoded) {
      const error = new Error("Not Authorized");
      error.statusCode = statusCodes.authFailed;
      throw e;
    }
    req.userId = decoded.userId;
    next();
  } catch (e) {
    e.statusCode = statusCodes.authFailed;
    e.message = "Not Authorized";
    throw e;
  }
};
