const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const controller = require("../controller/feed");

router.get("/posts", controller.getPosts);
router.get("/delete-all-posts", controller.deleteAllPost);

router.post(
  "/create-post",
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("must be alteast 5 characterd long"),
    body("content").trim().isLength({ min: 5 }),
  ],
  controller.createPost
);
router.get("/post/:postId", controller.getPost);
router.put("/post/:postId", controller.updatePost);
router.delete("/post/:postId", controller.deletePost);

module.exports = router;
