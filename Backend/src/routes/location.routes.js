const express = require("express");
const router = express.Router();
const {authUserMiddleware} = require("../middlewares/auth.middleware");
const addUserLocation = require("../controllers/location.controller");

// POST /api/location/--- user
router.post("/", authUserMiddleware, addUserLocation);

module.exports = router;
