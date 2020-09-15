const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    ratedStories: [],
    historyStories: [],
  },
  { timestamps: true }
);

const sessionModel = mongoose.model("Session", sessionSchema);

module.exports = sessionModel;
