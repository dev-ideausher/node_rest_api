const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const statusCodes = require("../constants/status_codes");
const Post = require("../models/post");
const User = require("../models/user");
const { use } = require("../routes/feed");
const io = require("../websockets/socket");
exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("creator");
    if (!posts || posts.isEmpty) {
      const error = new Error("No Posts Found");
      next(error);
      return;
    }
    res.status(200).json({
      posts: posts,
    });
  } catch (e) {
    next(e);
  }
};
exports.createPost = async (req, res, next) => {
  const { title, content, createdAt } = req.body;
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Server side validation failed");
    error.statusCode = statusCodes.validationFailed;
    next(error);
    return;
  }
  if (!image) {
    res.status(400).json({ error: "Invalid Image Format" });
    return;
  }
  const imageUrl = image.path;

  try {
    const user = await User.findById(req.userId);

    const post = new Post({
      ...req.body,
      imageUrl: imageUrl,
      creator: user._id,
    });
    await post.save();

    user.post.push(post);
    user.save();
    io.getIo().emit("post", { action: "create", post: post });
    res.status(statusCodes.success).json({ post: post });
  } catch (e) {
    next(e);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const id = req.params.postId;

    const post = await Post.findById(id);

    if (!post) {
      const error = Error("no post found");
      next(error);
      return;
    }

    res.status(statusCodes.success).json({
      post: post,
    });
  } catch (e) {
    next(e);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const body = req.body;
    const image = req.file;

    const post = await Post.findById(postId);
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = statusCodes.authFailed;
      throw error;
    }
    if (image) {
      post.imageUrl = image.path;
    }
    post.title = body.title;
    post.content = body.content;
    await post.save();
    io.getIo().emit("post", { action: "update", post: post });
    res.status(statusCodes.success).json({ message: "Post Updated" });
  } catch (e) {
    next(e);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      throw Error("Post does not exists");
    }
    deleteImage(post.imageUrl);

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = statusCodes.authFailed;
      throw error;
    }
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.post.pull(postId);
    await user.save();
    io.getIo().emit("post", { action: "delete", post: post });
    res.status(statusCodes.success).json({ message: "Post deleted!" });
  } catch (e) {
    next(e);
  }
};
exports.deleteAllPost = async (req, res, next) => {
  const result = await Post.deleteMany();
  console.log(result);
  const filePath = path.join(__dirname, "..", "images");
  fs.rmdir(filePath, { recursive: true }, (err) => {
    throw err;
  });
  res.status(statusCodes.success).json({ message: "All Post Deleted" });
};

const deleteImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {});
};
