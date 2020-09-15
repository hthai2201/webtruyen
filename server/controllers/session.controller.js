const { ObjectId } = require("mongodb");
const { sessionModel } = require("../models");
const { pageConfig } = require("../config");
//module
module.exports.getSession = async (_id) => {
  let session = await sessionModel.findById(ObjectId(_id));
  if (!session) {
    session = new sessionModel();
    await session.save();
  }

  return session.toObject();
};
module.exports.setSession = async (_id, data = {}) => {
  let { ratedStories, historyStories } = data;

  let session = await sessionModel.findById(ObjectId(_id));

  if (!session) {
    session = new sessionModel();
  }
  if (historyStories) {
    session.historyStories = historyStories;
  }
  if (ratedStories) {
    session.ratedStories = ratedStories;
  }
  await session.save();
  return session.toObject();
};
