const express = require("express");
const router = express.Router();
const { categoryController } = require("../controllers");
router.get("/", async (req, res, next) => {
 
  try {
    let allCategories = await categoryController.getAllCategories();
    res.json(allCategories);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});

module.exports = router;
