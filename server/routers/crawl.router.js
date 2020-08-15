const express = require("express");
const router = express.Router();
const { crawlController } = require("../controllers");
const BASE_URL = "https://truyencv.com";
router.get("/categories", async (req, res, next) => {
  let { url } = req.query;
  try {
    let allCategories = await crawlController.crawlCategories(BASE_URL);
    res.json(allCategories);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/story", async (req, res, next) => {
  let { url } = req.query;
  try {
    let story = await crawlController.crawlStory(url);
    res.json(story);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
router.get("/chapter", async (req, res, next) => {
  let { url, start = 1, end } = req.query;
  try {
    let chapters = await crawlController.crawlChapters(url, start, end);
    res.json(chapters);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
module.exports = router;
