const mongoose = require("mongoose");
const moment = require("moment");

const chapterSchema = new mongoose.Schema(
  {
    chapterId: {
      type: Number,
    },
    name: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    view: { type: Number, default: 0 },
    words: { type: Number, default: 0 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

const chapter = mongoose.model("Chapter", chapterSchema, "chapters");

module.exports = chapter;
