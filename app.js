const path = require("path");

const express = require("express");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();
const bodyParser = require("body-parser");
const controller = require("./controller/feed");
const mongoose = require("mongoose");
const { error } = require("console");
const statusCodes = require("./constants/status_codes");
const multer = require("multer");
main();
async function main() {
  const MONGO_DB_URI =
    "mongodb+srv://murtazaagaz:12345665@cluster0.th8vy.mongodb.net/res_api";
  await mongoose.connect(MONGO_DB_URI);

  app.use("/images", express.static(path.join(__dirname, "images")));

  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
      return;
    }

    cb(null, false);
  };
  app.use(bodyParser.json());

  app.use(
    multer({
      storage: fileStorage,
      fileFilter: fileFilter,
    }).single("image")
  );
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*", "Authorization");
    res.setHeader(
      "Access-Control-Allow-Method",
      "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "*",
      "Authorization",
    );
    next();
  });

  app.use("/auth", authRoutes);
  app.use("/feed", feedRoutes);
  app.use((error, req, res, next) => {
    const statusCode = error.statusCode || statusCodes.badRequest;
    const message = error.message;
    res.status(statusCode).json({ message: message, error: error.data });
  });
  app.listen(3000);
}
