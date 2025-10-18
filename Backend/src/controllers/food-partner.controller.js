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
async function getMyDetails(req,res){
  if (!req.foodPartner) {
    return res.status(401).json({
      message:"Unauthorized access"
    })
  }
  
  const foodPartnerId = req.foodPartner._id;
  try {
    const foodPartner = await foodPartnerModel.findById(foodPartnerId).select('-password');
    if(!foodPartner){
      return res.status(404).json({
        message:"No Such Partner Found"
      })
    }
    return res.status(200).json({
      message: "Profile fetched successfully",
      foodPartner
    });
  } catch (error) {
    return res.status(500).json({
      message:"Internal Server Error"
    })
  }
}
async function updateProfile(req, res) {
  if (!req.foodPartner) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }
  
  const foodPartnerId = req.foodPartner._id;
  const updates = req.body;
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
module.exports = { getFoodItemsByPartner,getMyDetails, updateProfile };
