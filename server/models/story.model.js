const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const moment = require("moment");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const storyStatus = {
  complete: "Hoàn thành",
  notComplete: "Đang ra",
};
const defaultStoryStatus = "notComplete";
const storySchema = new mongoose.Schema(
  {
    cover: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      slug: "name",
      // slugPaddingSize: 4,
      unique: true,
      sparse: true,
    },
    desc: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    creator: {
      type: String,
      trim: true,
      default: "Truyen CV",
    },
    status: {
      type: String,
      trim: true,
      enum: Object.keys(storyStatus),
      default: defaultStoryStatus,
    },
    view: {
      type: Number,
      default: 0,
    },
    chapters: [],
    categories: [],
    tags: [],
    comments: [],
    rate: [],
    vote: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    subscribers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, timestamps: true }
);

//index
storySchema.index(
  {
    name: "text",
    desc: "text",

    author: "text",
  },
  { name: "story_fts_index" }
);
//virtuals
storySchema.virtual("full").get(function () {
  return this.status === "complete";
});
storySchema.virtual("new").get(function () {
  //create in month
  let now = moment();
  let create = moment(this.createdAt);
  let diff = now.diff(create, "days");

  return diff < 30;
});
//statics
storySchema.statics = {
  storyStatus,
};
const cloneObject = (object, fields = []) => {
  let newObject = {};
  fields.map((field) => {
    if (field instanceof Object) {
      if (object[field.name] instanceof Array) {
        newObject[field.name] = object[field.name].map((_) =>
          cloneObject(_, field.fields)
        );
      } else if (object[field.name] instanceof Object) {
        newObject[field.name] = cloneObject(object[field.name], field.fields);
      }
    } else {
      newObject[field] = object[field];
    }
  });

  return newObject;
};
//methods
storySchema.methods.toPlain = function () {
  let fields = [
    "name",
    "cover",
    "desc",
    "slug",
    "status",
    "creator",
    "author",
    "view",
    "createdAt",
    { name: "categories", fields: ["name", "slug"] },
    { name: "chapters", fields: ["name", "slug", "chapterId", "words"] },
    { name: "tags", fields: ["name", "slug"] },
  ];

  return cloneObject(this, fields);
};
storySchema.plugin(mongooseLeanVirtuals);
const story = mongoose.model("Story", storySchema, "stories");

module.exports = story;
