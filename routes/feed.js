const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const isAuth = require('../middleware/is-auth')
const controller = require("../controller/feed");

router.get("/posts", isAuth, controller.getPosts);
router.get("/delete-all-posts", isAuth,  controller.deleteAllPost);

router.post(
  "/create-post", isAuth, 
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("must be alteast 5 characterd long"),
    body("content").trim().isLength({ min: 5 }),
  ],
  controller.createPost
);
router.get("/post/:postId",  isAuth, controller.getPost);
router.put("/post/:postId",  isAuth, controller.updatePost);
router.delete("/post/:postId", isAuth,  controller.deletePost);

module.exports = router;
