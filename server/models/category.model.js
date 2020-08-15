const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const categorySchema = new mongoose.Schema({
  name: String,
  slug: {
    type: String,
    // slug: "name",
    slugPaddingSize: 4,
    unique: true,
    sparse: true,
  },
});
const cloneObject = (object, fields = []) => {
  let newObject = {};
  fields.map((field) => {
    if (field instanceof Object) {
      if (object[field.name] instanceof Array) {
        newObject[field.name] = object[field.name].map((_) =>
          cloneObject(_, field.fields)
        );
      } else if (object[field.name] instanceof Object) {
        newObject[field.name] = cloneObject(object[field.name], field.fields);
      }
    } else {
      newObject[field] = object[field];
    }
  });

  return newObject;
};
//methods
categorySchema.methods.toPlain = function () {
  let fields = ["name", "slug"];

  return cloneObject(this, fields);
};

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
