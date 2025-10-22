const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { addAddress } = require("../controllers/user.controller");
const router = express.Router();

router.patch("/addresses", authMiddleware, addAddress);

module.exports = router;
