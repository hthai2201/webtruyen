const Crawler = require("crawler");
const cheerio = require("cheerio");
const { storyModel, chapterModel, categoryModel } = require("../models");
//
const toTextWithRemoveBrTag = ($, selector) => {
  let content = $(selector).html() || "";
  content = content.replace(/<br\s*\/?>/gm, "\n");
  content = cheerio.load(content).text();
  return content;
};
const toStorySlug = (url = "") => {
  if (url[url.length - 1] == "/") {
    url = url.slice(0, url.length - 1);
  }

  return url.slice(url.lastIndexOf("/") + 1);
};
const cheerioOptions = {
  withDomLvl1: true,
  normalizeWhitespace: false,
  xmlMode: true,
  decodeEntities: false,
};
const crawlerOptions = {
  rateLimit: "1000",
  jQuery: false,
};
let crawl = async (urls, cb) => {
  urls = urls instanceof Array ? urls : [urls];

  let result = await Promise.all(
    urls.map(async (url) => {
      try {
        let a = await new Promise((rs, rj) => {
          crawlerOptions.callback = function (err, res, done) {
            if (err) {
              rj(err);
            }
            cb(res.body, rs, rj);
            done();
          };
          var c = new Crawler(crawlerOptions);

          c.queue(url);
        });

        return a;
      } catch (error) {
        return {
          errors: error.toString(),
          url,
        };
      }
    })
  );
  return result;
};

//module
module.exports.crawlCategories = async (url) => {
  //parse
  const parseBodyCategories = (body, cb) => {
    let $ = cheerio.load(body, cheerioOptions);
    let allCategories = [];

    $(".navbar .navbar-category-list")
      .last()
      .find("li a")
      .each(function (i, el) {
        let name = $(el).text().trim();
        let slug = toStorySlug($(el).attr("href"));

        allCategories.push({ name, slug });
      });

    cb(allCategories);
  };
  let result = await crawl(url, parseBodyCategories);
  let allCategories = result.length == 1 ? result[0] : [];
  return await Promise.all(
    allCategories.map(async (category) => {
      try {
        return await categoryModel.create(category);
      } catch (error) {
        return { ...category, errors: error.toString() };
      }
    })
  );
};
module.exports.crawlStory = async (url) => {
  //parse
  const parseBodyStory = (body, cb) => {
    let $ = cheerio.load(body, cheerioOptions);

    let infoEl = $(".col-info-desc");

    let cover = infoEl.find(" img").attr("data-cfsrc");
    let author = infoEl.find(".info [itemprop='author']").text();
    let name = infoEl.find("h3.title").text();
    let desc = toTextWithRemoveBrTag($, ".col-info-desc .desc-text");
    let categories = [];
    infoEl.find(".info [itemprop='genre']").each(function (i, el) {
      let slug = $(el).attr("href");
      let name = $(el).text();
      slug = slug.slice(0, slug.length - 1);
      slug = slug.slice(slug.lastIndexOf("/") + 1);
      categories.push({ name, slug });
    });
    let creator = infoEl.find(".info .source").text();

    cb({ name, desc, cover, categories, author, creator });
    return null;
  };
  let result = await crawl(url, parseBodyStory);

  let { name, desc, cover, categories, author, creator } =
    result.length == 1 ? result[0] : {};
  categories = await Promise.all(
    categories.map(async (category) => {
      let curCategory = await categoryModel
        .findOne({ slug: category.slug })
        .lean();
      if (!curCategory) {
        curCategory = new categoryModel(category);
        await curCategory.save();
      }
      return curCategory;
    })
  );

  let story = await storyModel.create({
    name,
    desc,
    cover,
    categories,
    author,
    creator,
  });
  return story;
};
module.exports.crawlChapters = async (url, start = 1, end) => {
  //parse
  start = parseInt(start) || -1;
  end = parseInt(end) || -1;
  if (start < 0 || end < 0) {
    throw new Error("start and end chapter invalid");
  }
  const parseBodyChapter = (body, cb) => {
    let $ = cheerio.load(body, cheerioOptions);
    //
    let content = toTextWithRemoveBrTag($, ".chapter-c");
    let [chapterId = "", name = ""] = $(".chapter-title").text().split(":");
    name = name.trim();
    chapterId = chapterId.match(/[0-9]+$/i);
    chapterId = chapterId instanceof Array ? chapterId[0] : "";
    chapterId = parseInt(chapterId);

    cb({ chapterId, name, content });
  };
  //get story
  let slug = toStorySlug(url);
  try {
    let story = await storyModel.findOne({ slug }).lean();
    if (!story) {
      story = await this.crawlStory(url);
    }

    let storyChapterIds = story.chapters.map((i) => i.chapterId);

    //chapter
    let urls = Array.from(Array(end), (_, i) => `${url}chuong-${i + start}/`);

    let result = await crawl(urls, parseBodyChapter);

    let chapters = await Promise.all(
      result.map(async ({ chapterId, name, content, words }) => {
        try {
          if (!chapterId || !name) {
            throw new Error("data not found");
          }
          if (storyChapterIds.includes(chapterId)) {
            throw new Error("chapter is exists in db");
          }
          let chapter = await chapterModel.create({
            chapterId,
            name,
            content,
            words,
          });
          return chapter;
        } catch (error) {
          return {
            chapterId,
            name,

            errors: error.toString(),
          };
        }
      })
    );

    //add chapter
    await storyModel.updateOne(
      { _id: story._id },
      {
        $push: {
          chapters: {
            $each: chapters.filter((i) => !i.errors),
            $sort: { chapterId: 1 },
          },
        },
      }
    );
    return chapters;
  } catch (error) {
    throw error;
  }

  categories = await categoryModel.find({ slug: categories }).lean();
  let story = await storyModel.create({ name, desc, cover, categories });
  return story;
};
