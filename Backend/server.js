require("dotenv").config({ path: __dirname + "/.env" });
const app = require("./src/app");

const mongoose = require("mongoose");
const connectDB = require("./src/db/db");
connectDB();

app.listen(8000, () => {
  console.log("Server is running on port  8000");
});
