const foodPartnerModel = require("../../models/foodpartner.model");
const userModel = require("../../models/user.model");

async function getMyDetails(req, res) {
  if (req.role === "foodpartner") {
    if (!req.foodPartner) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const foodPartnerId = req.foodPartner._id;
    try {
      const foodPartner = await foodPartnerModel
        .findById(foodPartnerId)
        .select("-password");
      if (!foodPartner) {
        return res.status(404).json({
          message: "No Such Partner Found",
        });
      }
      return res.status(200).json({
        message: "Profile fetched successfully",
        foodPartner,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  } else if (req.role === "user") {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const userId = req.user._id;
    try {
      const user = await userModel.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({
          message: "No Such User Found",
        });
      }
      return res.status(200).json({
        message: "Profile fetched successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = { getMyDetails };
