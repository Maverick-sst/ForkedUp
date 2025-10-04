const express = require("express");
const router = express.Router();
const reverseGeocode = require("../controllers/LocationController/location.controller");

// GET /api/location/reverse-geocoding?lat=&&lng=
router.get("/reverse-geocode",reverseGeocode)
module.exports = router;
