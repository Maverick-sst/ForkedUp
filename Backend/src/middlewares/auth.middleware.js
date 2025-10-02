const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");

const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  console.log("🔐 authMiddleware invoked");
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.secret_key);
    const { id, role } = decoded;
    let user;
    if (role === "user") {
      user = await userModel.findById(id);
    } else if (role === "foodpartner") {
      user = await foodPartnerModel.findById(decoded.id);
    }

    req.user = user;
    req.role = role;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }
}

module.exports = {
  authMiddleware,
};
