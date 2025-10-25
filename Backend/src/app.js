const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("../src/routes/auth.routes");
const foodRoutes = require("../src/routes/food.routes");
const uploadRoutes = require("../src/routes/upload.routes");
const detailsRoutes = require("../src/routes/details.routes");
const foodPartnerRoutes = require("../src/routes/food-partner.routes");
const userRoutes = require("../src/routes/user.routes");
const orderRoutes = require("../src/routes/orders.routes");
const featureRoutes = require("./routes/features.routes");
const followRoutes = require("../src/routes/follow.routes");
const locationRoutes = require("../src/routes/location.routes");
const ratingsRoutes = require("../src/routes/ratings.routes");
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

app.use("/api/auth/", authRoutes);
app.use("/api/me", detailsRoutes);
app.use("/api/upload/", uploadRoutes);
app.use("/api/food/", foodRoutes);
app.use("/api/food-partner/", foodPartnerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feature/", featureRoutes);
app.use("/api/follow/", followRoutes);
app.use("/api/location/", locationRoutes); //--- this will be used by both user and food-partner to quickly display form add on fronen
app.use("/api/ratings", ratingsRoutes);
module.exports = app;
