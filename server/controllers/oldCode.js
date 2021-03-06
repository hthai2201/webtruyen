module.exports.crawlCategories = async (url) => {
  //parse
  const parseBodyCategories = (body, cb) => {
    let $ = cheerio.load(body, cheerioOptions);
    let allCategories = [];
    $(".navbar-category-list a[title]").each(function (i, el) {
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
    // h1.title a.author ul.categories a
    let infoEl = $(".section-detail-info");
    let name = infoEl.find("h1.title").text();
    let author = infoEl.find("a.author").text();
    let categories = [];
    infoEl.find("ul.categories").each(function (i, el) {
      let slug = $(el).find("a[href]").attr("href");

      slug = slug.slice(0, slug.length - 1);
      slug = slug.slice(slug.lastIndexOf("/") + 1);
      categories.push(slug);
    });
    let cover = infoEl.find(".img-responsive").attr("data-cfsrc");
    let desc = toTextWithRemoveBrTag($, ".truyencv-detail-tab .brief");

    cb({ name, desc, cover, categories, author });
  };
  let result = await crawl(url, parseBodyStory);

  let { name, desc, cover, categories, author } =
    result.length == 1 ? result[0] : {};
  categories = await categoryModel.find({ slug: categories }).lean();
  let story = await storyModel.create({
    name,
    desc,
    cover,
    categories,
    author,
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
    let content = toTextWithRemoveBrTag($, ".truyencv-read-content .content");
    let [chapterId = "", name = ""] = $(".truyencv-read-content .title")
      .text()
      .split(":");
    name = name.trim();
    chapterId = chapterId.match(/[0-9]+$/i);
    chapterId = chapterId instanceof Array ? chapterId[0] : "";
    chapterId = parseInt(chapterId);
    let words = content.trim().split(/\n+/).length;

    cb({ chapterId, name, content, words });
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
