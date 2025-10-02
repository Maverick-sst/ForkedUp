const foodPartnerModel = require("../models/foodpartner.model");
const locationSchema = require("../models/location.model");
const getFormattedAddress = require("../controllers/utilites/getFormattedAddress.js");

async function addUserLocation(req, res) {
  const role = req.role;
  if (role === "user") {
    const formattedAddr = await getFormattedAddress(req.body.coords);
    if (formattedAddr === 400) {
      return res.status(400).json({
        message: "Coordinates are required",
        success: false,
      });
    } else if (formattedAddr == null) {
      return res.status(404).json({
        message: "Location not found",
        success: false,
      });
    } else {
      return res.status(200).json({
        message: "Location Fetched Successfully",
        success: true,
        address: formattedAddr,
      });
    }
  } else if (role === "foodpartner") {
    const { street, block, building, floor, landmark } = req.body;
    const coords = req.body.coords;

    const formattedAddr = await getFormattedAddress(coords);
    if (formattedAddr === 400) {
      return res.status(400).json({
        message: "Coordinates are required",
        success: false,
      });
    } else if (formattedAddr == null) {
      return res.status(404).json({
        message: "Location not found",
        success: false,
      });
    } else {
      // store the formatted address first time in mongo db and then when foodpartner submits the complete profile then update the final db
      const location = await locationModel.create({
        coordinates: coords,
        address: {
          formatted: formattedAddr,
          street: street,
          block: block,
          building: building,
          floor: floor,
          landmark: landmark,
        },
      });
      await foodPartnerModel.create()
      return res.status(200).json({
        message: "Location Fetched Successfully",
        success: true,
        address: formattedAddr,
      });
      // store formatted address and the final data of location on db
    }
  }
}

module.exports = addUserLocation;
