const express = require("express");
const router = express.Router();

const crawlRouter = require("./crawl.router");
const storyRouter = require("./story.router");
const categoryRouter = require("./category.router");
const sessionRouter = require("./session.router");

router.use("/crawl", crawlRouter);
router.use("/stories", storyRouter);
router.use("/categories", categoryRouter);
router.use("/session", sessionRouter);
module.exports = router;
