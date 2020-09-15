const express = require("express");
const app = express();
const router = require("./server/routers");
const logger = require("morgan");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
//dotenv
require("dotenv").config();

//Connect db from mongodb
mongoose.set("debug", true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
//Give a notification when connect success
mongoose.connection.on("connected", () => {});

app.use(cors());
// Log requests to the console.
app.use(logger("dev"));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", router);
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(PORT, function () {});
