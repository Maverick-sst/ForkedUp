const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("../src/routes/auth.routes");
const foodRoutes = require("../src/routes/food.routes");
const uploadRoutes = require("../src/routes/upload.routes");
const foodPartnerRoutes = require("../src/routes/food-partner.routes");
const featureRoutes=require("./routes/features.routes")
const locationRoutes=require("../src/routes/location.routes")
const cors = require("cors");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});

app.get("/home", (req, res) => {
  res.send("<h1>This is home again welcomes you</h1>");
});

app.use("/api/auth/", authRoutes);
app.use("/api/upload/",uploadRoutes)
app.use("/api/food/", foodRoutes);
app.use("/api/food-partner/", foodPartnerRoutes);
app.use("/api/feature/",featureRoutes );
app.use("/api/location/",locationRoutes) //--- this will be used by both user and food-partner to quickly display form add on fronen
module.exports = app;
