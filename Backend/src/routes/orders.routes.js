const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { createOrder , getPartnerOrders, updateOrderStatus , getOrderById} = require("../controllers/orders.controller"); // Create this

const router = express.Router();

// POST /api/orders - Create a new order (User authenticated) ---- user
router.post("/", authMiddleware, createOrder); 

// --- Partner Routes ---

// GET /api/orders/partner - Get orders for the logged-in partner (Partner role required)
// Can filter by status: /api/orders/partner?status=pending
router.get("/partner", authMiddleware, getPartnerOrders);

// PATCH /api/orders/partner/:orderId/status - Update status of an order (Partner role required)
router.patch("/partner/:orderId/status", authMiddleware, updateOrderStatus);

// --- Shared Route (User or Partner) ---
// GET /api/orders/:orderId - Get details of a specific order
router.get("/:orderId", authMiddleware, getOrderById);
module.exports = router;