const foodPartnerModel = require("../models/foodpartner.model");
const foodModel=require("../models/food.model");


async function getFoodItemsByPartner(req, res) {
  const foodPartnerId = req.params.id;
  const foodPartner = await foodPartnerModel.findById(foodPartnerId);
  const foodReels=await foodModel.find({foodPartner:foodPartnerId})
  if (!foodPartner) {
    return res.status(404).json({
      message: "Food Partner not found",
    });
  }
  return res.status(200).json({
    message: "Food Partner Found ",
    foodPartner,
    foodReels

  });
}

module.exports = { getFoodItemsByPartner };
