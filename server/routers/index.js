const express = require("express");
const router = express.Router();

const crawlRouter = require("./crawl.router");
const storyRouter = require("./story.router");
const categoryRouter = require("./category.router");

router.use("/crawl", crawlRouter);
router.use("/stories", storyRouter);
router.use("/categories", categoryRouter);
module.exports = router;
