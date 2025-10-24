const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

function connectDB() {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("db connected");
    })
    .catch((e) => {
      console.log(e);
    });
}

module.exports = connectDB;
