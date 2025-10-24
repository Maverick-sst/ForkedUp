const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs"); // Make sure bcryptjs is required
const mongoose = require("mongoose"); // Required for ObjectId validation if using IDs
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
    return res.status(400).json({
      message:
        "Invalid address data provided. Label and location details are required.",
    });
  }
  if (!["home", "work", "other"].includes(label)) {
    return res.status(400).json({
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

async function updateUserProfile(req, res) {
  if (!req.user || req.role !== "user") {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not found or invalid role." });
  }
  const userId = req.user._id;
  const updates = req.body;

  // Prevent password update through this endpoint for security
  // Use a separate endpoint for password changes
  delete updates.password;
  delete updates.orders; // Should not be updatable directly
  delete updates.addresses; // Use specific address endpoints
  delete updates.defaultAddress; // Use specific default address endpoint

  // Basic validation for common fields (add more as needed)
  if (updates.email && !/\S+@\S+\.\S+/.test(updates.email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  if (updates.userName && updates.userName.length < 3) {
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters." });
  }

  try {
    // Check for username uniqueness if it's being updated
    if (updates.userName && updates.userName !== req.user.userName) {
      const existingUser = await userModel.findOne({
        userName: updates.userName,
      });
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken." });
      }
    }
    // Check for email uniqueness if it's being updated
    if (updates.email && updates.email !== req.user.email) {
      const existingUser = await userModel.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered." });
      }
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true } // Return the updated document and run schema validation
      )
      .select("-password"); // Exclude password from the returned object

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: error.errors });
    }
    // Handle potential duplicate key errors if checks above fail unexpectedly
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }
    return res
      .status(500)
      .json({ message: "Internal server error while updating profile." });
  }
}

async function updateAddress(req, res) {
  if (!req.user || req.role !== "user") {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const userId = req.user._id;
  const addressIndex = parseInt(req.params.index, 10);
  const { label, location } = req.body; // Expecting updated label and location object

  // Basic validation
  if (isNaN(addressIndex) || addressIndex < 0) {
    return res.status(400).json({ message: "Invalid address index provided." });
  }
  if (
    !label ||
    !location ||
    !location.address ||
    (!location.address.formatted && !location.address.street)
  ) {
    return res.status(400).json({
      message: "Invalid address data. Label and location details required.",
    });
  }
  if (!["home", "work", "other"].includes(label)) {
    return res.status(400).json({ message: "Invalid address label." });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if index is valid for the user's addresses array
    if (addressIndex >= user.addresses.length) {
      return res.status(404).json({ message: "Address index out of bounds." });
    }

    // Update the specific address in the array
    user.addresses[addressIndex] = {
      label: label,
      location: location, // Replace with the new location object
      // _id is implicitly kept if using array index update, Mongoose handles subdocument updates
    };

    // Mark the array as modified for Mongoose to save changes
    user.markModified("addresses");

    await user.save({ validateModifiedOnly: true }); // Save the user document

    // Find the updated user again to return the full profile if needed, or just the updated address
    const updatedUser = await userModel.findById(userId).select("-password");

    return res.status(200).json({
      message: "Address updated successfully.",
      // address: user.addresses[addressIndex], // Return just the updated address
      user: updatedUser, // Or return the updated user profile
    });
  } catch (error) {
    console.error("Error updating address:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Address validation failed.", errors: error.errors });
    }
    return res
      .status(500)
      .json({ message: "Internal server error while updating address." });
  }
}

async function deleteAddress(req, res) {
  if (!req.user || req.role !== "user") {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const userId = req.user._id;
  const addressIndex = parseInt(req.params.index, 10);

  if (isNaN(addressIndex) || addressIndex < 0) {
    return res.status(400).json({ message: "Invalid address index provided." });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (addressIndex >= user.addresses.length) {
      return res.status(404).json({ message: "Address index out of bounds." });
    }

    // Remove the address from the array
    user.addresses.splice(addressIndex, 1);

    // Adjust defaultAddress index if necessary
    if (user.defaultAddress === addressIndex) {
      user.defaultAddress = 0; // Reset to first if default was deleted
    } else if (user.defaultAddress > addressIndex) {
      user.defaultAddress -= 1; // Decrement if an earlier address was removed
    }
    // Ensure default address isn't out of bounds if last item removed
    if (user.defaultAddress >= user.addresses.length) {
      user.defaultAddress = Math.max(0, user.addresses.length - 1);
    }

    // Mark as modified and save
    user.markModified("addresses");
    user.markModified("defaultAddress");
    await user.save({ validateModifiedOnly: true });

    const updatedUser = await userModel.findById(userId).select("-password");

    return res.status(200).json({
      message: "Address deleted successfully.",
      user: updatedUser, // Return updated user
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while deleting address." });
  }
}

async function setDefaultAddress(req, res) {
  if (!req.user || req.role !== "user") {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const userId = req.user._id;
  const { defaultIndex } = req.body; // Expecting { "defaultIndex": index_number }

  const index = parseInt(defaultIndex, 10);

  if (isNaN(index) || index < 0) {
    return res
      .status(400)
      .json({ message: "Invalid default address index provided." });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate index against the current addresses array
    if (index >= user.addresses.length) {
      return res
        .status(400)
        .json({ message: "Default address index is out of bounds." });
    }

    // Update the defaultAddress field
    user.defaultAddress = index;
    await user.save({ validateModifiedOnly: true });

    const updatedUser = await userModel.findById(userId).select("-password");

    return res.status(200).json({
      message: "Default address updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    return res.status(500).json({
      message: "Internal server error while setting default address.",
    });
  }
}

module.exports = {
  addAddress,
  updateUserProfile,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
