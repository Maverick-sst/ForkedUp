const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
// Import all functions from the controller
const {
  addAddress,
  updateUserProfile,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  // Import changePassword later if you add it
} = require("../controllers/user.controller");

const router = express.Router();

// --- Core Profile ---
// PATCH /api/user/profile - Update main profile details (name, email, etc.)
router.patch("/profile", authMiddleware, updateUserProfile);

// --- Addresses ---
// POST /api/user/addresses - Add a NEW address (Use PATCH as per original, or POST)
router.patch("/addresses", authMiddleware, addAddress); // Your existing route

// PUT /api/user/addresses/:index - Update address at specific index
router.put("/addresses/:index", authMiddleware, updateAddress);

// DELETE /api/user/addresses/:index - Delete address at specific index
router.delete("/addresses/:index", authMiddleware, deleteAddress);

// PATCH /api/user/default-address - Set the default address index
router.patch("/default-address", authMiddleware, setDefaultAddress);

// --- Password (Optional - Add later if needed) ---
// router.patch("/password", authMiddleware, changePassword);

module.exports = router;
