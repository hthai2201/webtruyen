const express = require("express");
const router = express.Router();
const { storyController, sessionController } = require("../controllers");
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
  let { SSID } = req.query;

  try {
    let session = await sessionController.getSession(SSID);

    let { historyStories = [] } = session;
    let chapter = await storyController.getStoryChapter(slug, chapterId);
    let { story, name } = chapter;
    let lastReadChapter = { chapterId: chapter.chapterId, name };
    story = { slug: story.slug, name: story.name, lastReadChapter };
    let existHistoryStoryIndex = historyStories.findIndex(
      (item) => item.slug == story.slug
    );
    if (existHistoryStoryIndex !== -1) {
      historyStories[existHistoryStoryIndex] = story;
    } else {
      historyStories.push(story);
    }

    await sessionController.setSession(SSID, { historyStories });
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
  let { rate, SSID } = req.body;

  try {
    let session = await sessionController.getSession(SSID);
    let { ratedStories = [] } = session;
    let checkRate = ratedStories.find((item) => item.slug == slug);
    if (checkRate) {
      res.json({ errors: "Current User was rated this story" });
    } else {
      await storyController.rateStory(slug, rate);

      let existRatedStoryIndex = ratedStories.findIndex(
        (item) => item.slug === slug
      );
      if (existRatedStoryIndex !== -1) {
        ratedStories[existRatedStoryIndex] = { slug, rate };
      } else {
        console.log({ slug, rate });
        ratedStories.push({ slug, rate });
      }

      await sessionController.setSession(SSID, { ratedStories });
      res.json(null);
    }
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
module.exports = router;
