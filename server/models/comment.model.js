const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: String,
    fullName: String,
    email: String,
    avatar: String,
    relyComments: [],
  },
  {
    timestamps: true,
  }
);
const Comment = mongoose.model("Comment", commentSchema, "comments");

module.exports = Comment;
