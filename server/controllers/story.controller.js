const moment = require("moment");
const { storyModel, chapterModel, categoryModel } = require("../models");
const { pageConfig } = require("./../config");
//module
module.exports.getAllStories = async ({
  searchWords,
  categorySlug,
  tagSlug,
  full,
  page = 1,
  limit = pageConfig.limit,
}) => {
  let $match = {};
  let $sort = { view: -1 };
  if (searchWords) {
    $match.$text = { $search: searchWords };
    $sort = { score: { $meta: "textScore" } };
  }
  if (categorySlug) {
    $match["categories.slug"] = categorySlug;
  }
  if (tagSlug) {
    $match["tags.slug"] = tagSlug;
  }
  if (full) {
    $match.status = "complete";
  }
  let allStories = await storyModel.aggregate([
    {
      $match,
    },
    {
      $project: {
        _id: 0,
        "categories._id": 0,
        "tags._id": 0,
        "chapters.content": 0,
        "chapters._id": 0,
      },
    },

    { $sort },

    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);
  return allStories;
};
module.exports.getAllStoriesHot = async ({
  searchWords,
  categorySlug,
  tagSlug,
  full,
  page = 1,
  limit = pageConfig.limit,
}) => {
  let $match = {};
  let $sort = { "chapter.createdAt": -1 };
  if (searchWords) {
    $match.$text = { $search: searchWords };
    $sort = { score: { $meta: "textScore" } };
  }
  if (categorySlug) {
    $match["categories.slug"] = categorySlug;
  }
  if (tagSlug) {
    $match["tags.slug"] = tagSlug;
  }
  if (full) {
    $match.status = "complete";
  }
  let allStories = await storyModel.aggregate([
    {
      $match,
    },

    {
      $unwind: "$chapters",
    },
    {
      $group: {
        _id: "$_id",
        view: { $sum: "$chapters.view" },
        chapter: { $last: "$chapters" },
        doc: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$doc", { view: "$view", chapter: "$chapter" }],
        },
      },
    },
    {
      $project: {
        _id: 0,
        "categories._id": 0,
        "tags._id": 0,
        "chapter.content": 0,
        "chapter._id": 0,
        chapters: 0,
      },
    },
    { $sort },

    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);
  return allStories;
};
module.exports.getAllStoriesNewChapter = async ({
  searchWords,
  categorySlug,
  tagSlug,
  full,
  page = 1,
  limit = pageConfig.limit,
}) => {
  let $match = {};
  let $sort = { "chapter.createdAt": -1 };
  if (searchWords) {
    $match.$text = { $search: searchWords };
    $sort = { score: { $meta: "textScore" } };
  }
  if (categorySlug) {
    $match["categories.slug"] = categorySlug;
  }
  if (tagSlug) {
    $match["tags.slug"] = tagSlug;
  }
  if (full) {
    $match.status = "complete";
  }
  let allStories = await storyModel.aggregate([
    {
      $match,
    },
    {
      $project: {
        _id: 0,
        "categories._id": 0,
        "tags._id": 0,
        "chapters.content": 0,
        "chapters._id": 0,
      },
    },
    {
      $unwind: "$chapters",
    },
    {
      $addFields: {
        chapter: "$chapters",
      },
    },
    { $sort },

    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);
  return allStories;
};
module.exports.getStory = async (
  slug,
  { chapterPage = 1, chapterLimit = pageConfig.limit }
) => {
  if (!slug) {
    throw new Error("slug not founđ");
  }
  let story = await storyModel.findOne(
    { slug },
    { chapters: { $slice: [(page - 1) * limit, limit] } }
  );
  if (!story) {
    throw new Error("story not found");
  }

  return story.toPlain();
};
module.exports.getStoryChapter = async (slug, chapterId) => {
  chapterId = parseInt(chapterId);
  if (!slug) {
    throw new Error("story not founđ");
  }

  if (!chapterId || chapterId < 1) {
    throw new Error("chapter not founđ");
  }

  let story = await storyModel.aggregate([
    { $match: { slug } },
    { $unwind: "$chapters" },
    { $match: { "chapters.chapterId": chapterId } },
  ]);
  if (!story[0]) {
    throw new Error("chapter not found");
  }

  return story[0].chapters;
};
module.exports.delStory = async (slug) => {
  if (!slug) {
    throw new Error("slug not founđ");
  }

  let story = await storyModel.findOneAndDelete({ slug });

  if (!story) {
    throw new Error("story not found");
  }
  let chapterIds = story.chapters.map((i) => i._id);
  await chapterModel.deleteMany({ _id: chapterIds });
  return story.toPlain();
};
