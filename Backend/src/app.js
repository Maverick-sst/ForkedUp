const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("../src/routes/auth.routes");
const foodRoutes = require("../src/routes/food.routes");
const foodPartnerRoutes = require("../src/routes/food-partner.routes");
const featureRoutes=require("../src/routes/features.route")
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
app.use("/api/food/", foodRoutes);
app.use("/api/food-partner/", foodPartnerRoutes);
app.use("/api/feature/",featureRoutes );
module.exports = app;
