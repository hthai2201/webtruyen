const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: String,
  slug: {
    type: String,
    slug: "name",
    slugPaddingSize: 4,
    unique: true,
    sparse: true,
  },
});

const Tag = mongoose.model("Tag", tagSchema, "tags");

module.exports = Tag;
