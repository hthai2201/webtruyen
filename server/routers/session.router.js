const express = require("express");
const router = express.Router();
const { sessionController } = require("../controllers");
router.get("/", async (req, res, next) => {
  let { SSID } = req.query;
  try {
    let session = await sessionController.getSession(SSID);
    res.json(session);
  } catch (error) {
    res.json({
      errors: error.toString(),
    });
  }
});
module.exports = router;
