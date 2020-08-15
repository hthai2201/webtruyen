const { storyModel, chapterModel, categoryModel } = require("../models");
const { pageConfig } = require("../config");
//module

module.exports.getAllCategories = async () => {
  let allCategories = await categoryModel.find();
  return allCategories.map((i) => i.toPlain());
};
