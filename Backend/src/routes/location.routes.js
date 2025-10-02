const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const addUserLocation = require("../controllers/location.controller");

// POST /api/location/--- user
router.post("/", authMiddleware, addUserLocation);

module.exports = router;
