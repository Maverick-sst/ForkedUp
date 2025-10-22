const userModel = require("../models/user.model");

async function addAddress(req, res) {
  // Ensure user is authenticated (authMiddleware should handle this)
  if (!req.user || req.role !== "user") {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not found or invalid role." });
  }

  const userId = req.user._id;
  const { label, location } = req.body; // Expecting { label: 'home'/'work'/'other', location: {...locationSchema object} }

  // Basic validation
  if (
    !label ||
    !location ||
    !location.address ||
    (!location.address.formatted && !location.address.street)
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid address data provided. Label and location details are required.",
      });
  }
  if (!["home", "work", "other"].includes(label)) {
    return res
      .status(400)
      .json({
        message: "Invalid address label. Must be 'home', 'work', or 'other'.",
      });
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          addresses: {
            label: label,
            location: location, // Save the whole location object
          },
        },
      },
      { new: true, runValidators: true } // Return the updated document and run schema validation
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return only the newly added address or the updated list, avoid sending full user profile back unnecessarily
    const newAddress = updatedUser.addresses[updatedUser.addresses.length - 1]; // Get the last added address

    return res.status(200).json({
      message: "Address added successfully.",
      address: newAddress, // Send back the newly added address with its generated _id
      // or addresses: updatedUser.addresses // Alternatively send the full updated list
    });
  } catch (error) {
    console.error("Error adding address:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: error.errors });
    }
    return res
      .status(500)
      .json({ message: "Internal server error while adding address." });
  }
}

module.exports = { addAddress };
