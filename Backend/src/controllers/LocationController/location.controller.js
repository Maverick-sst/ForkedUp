const getFormattedAddress = require("../utilites/getFormattedAddress.js");

async function reverseGeocode(req, res) {
  const lat=req.query.lat;
  const lng=req.query.lng;
  if(!lat || !lng){
    return res.status(401).json({
      message:"Coordinates Missing"
    })
  }
  const formattedAddress= await getFormattedAddress(lat,lng);
  if(formattedAddress==null){
    return res.status(404).json({
      message:"Location not Found"
    });
  }
  else{
    return res.status(200).json({
      message:"Location Fetched Successfully",
      address:formattedAddress
    })
  }
}

module.exports = reverseGeocode;
