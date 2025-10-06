const foodPartnerModel = require("../models/foodpartner.model");
const foodModel = require("../models/food.model");

async function getFoodItemsByPartner(req, res) {
  const foodPartnerId = req.params.id;
  const foodPartner = await foodPartnerModel.findById(foodPartnerId);
  const foodReels = await foodModel.find({ foodPartner: foodPartnerId });
  if (!foodPartner) {
    return res.status(404).json({
      message: "Food Partner not found",
    });
  }
  return res.status(200).json({
    message: "Food Partner Found ",
    foodPartner,
    foodReels,
  });
}

async function updateProfile(req, res) {
  const foodPartnerId = req.user._id;
  const updates = req.body;
  if (!foodPartnerId) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }
  try {
    const updatedPartner = await foodPartnerModel.findByIdAndUpdate(
      foodPartnerId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedPartner) {
      return res.status(404).json({
        message: "Food Partner not Found",
      });
    }
    return res.status(200).json({
      message: "Profile Updated Successfully",
      foodPartner: updatedPartner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating profile",
      error: error,
    });
  }
}
module.exports = { getFoodItemsByPartner, updateProfile };
