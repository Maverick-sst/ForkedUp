const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { getMyDetails } = require("../controllers/GetDetailsController/details.controller");
const router = express.Router()

router.get("/",authMiddleware,getMyDetails);

module.exports= router;