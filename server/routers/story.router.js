const express = require("express");
const router = express.Router();
const { storyController } = require("../controllers");
router.get("/", async (req, res, next) => {
  let { searchWords, page = 1, limit, tagSlug, categorySlug, full } = req.query;
  try {
    let allStories = await storyController.getAllStories({
      searchWords,
      tagSlug,
      categorySlug,
      full,
      page,
      limit,
    });
    res.json(allStories);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/hot", async (req, res, next) => {
  let { searchWords, page = 1, limit, tagSlug, categorySlug, full } = req.query;
  try {
    let allStories = await storyController.getAllStoriesHot({
      searchWords,
      tagSlug,
      categorySlug,
      full,
      page,
      limit,
    });
    res.json(allStories);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/new", async (req, res, next) => {
  let { searchWords, page = 1, limit, tagSlug, categorySlug, full } = req.query;
  try {
    let allStories = await storyController.getAllStoriesNewChapter({
      searchWords,
      tagSlug,
      categorySlug,
      full,
      page,
      limit,
    });
    res.json(allStories);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/download/:slug", async (req, res, next) => {
  let { slug } = req.params;
  try {
    let story = await storyController.downloadStory(slug);
    res.json(story);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/:slug", async (req, res, next) => {
  let { slug } = req.params;

  let { chapterPage = 1, chapterLimit } = req.query;
  try {
    let story = await storyController.getStory(slug, {
      chapterPage,
      chapterLimit,
    });
    res.json(story);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/:slug/chuong-:chapterId", async (req, res, next) => {
  let { slug, chapterId } = req.params;

  try {
    req.session.historyStories = req.session.historyStories || [];
    let chapter = await storyController.getStoryChapter(slug, chapterId);
    let { story, name } = chapter;
    let lastReadChapter = { chapterId: chapter.chapterId, name };
    story = { slug: story.slug, name: story.name, lastReadChapter };
    req.session.historyStories.push(story);
    res.json(chapter);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});

router.delete("/:slug", async (req, res, next) => {
  let { slug } = req.params;

  try {
    let story = await storyController.delStory(slug);
    res.json(story);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.post("/:slug/rate", async (req, res, next) => {
  let { slug } = req.params;
  let { rate } = req.body;

  try {
    let { ratedStories = [] } = req.session;
    let checkRate = ratedStories.find((item) => item.slug == slug);
    if (checkRate) {
      res.json({ errors: "Current User was rated this story" });
    } else {
      let story = await storyController.rateStory(slug, rate);
      ratedStories.push({ slug, rate });
      req.session.ratedStories = ratedStories;
      res.json(story);
    }
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
module.exports = router;
