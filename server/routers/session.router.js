const express = require("express");
const router = express.Router();
const { storyController } = require("../controllers");
router.get("/", async (req, res, next) => {
  try {
    let { ratedStories, historyStories } = req.session;
    res.json({ ratedStories, historyStories });
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
module.exports = router;
