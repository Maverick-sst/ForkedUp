// Backend/src/controllers/order.controller.js
const mongoose = require("mongoose"); // Needed for ObjectId validation
const Order = require("../models/orders.model");
const userModel = require("../models/user.model");
const foodModel = require("../models/food.model");
const foodPartnerModel = require("../models/foodpartner.model");

async function createOrder(req, res) {
    if (!req.user || req.role !== 'user') {
        return res.status(401).json({ message: "User authentication required." });
    }

    const userId = req.user._id;
    const {
        items, // Expected: [{ food (ID string), quantity, price (from frontend) }]
        totalAmount: frontendTotalAmount, // Renamed for clarity
        deliveryAddress, // Expected: Full locationSchema object
        paymentDetails, // Expected: { method, status?, transactionId? }
        foodPartner: foodPartnerId, // Expecting the foodPartner ID string
    } = req.body;

    // --- Basic Payload Validation ---
    if (!items || !Array.isArray(items) || items.length === 0 || !frontendTotalAmount || typeof frontendTotalAmount !== 'number' || frontendTotalAmount <= 0 || !deliveryAddress || !paymentDetails || !paymentDetails.method || !foodPartnerId) {
        return res.status(400).json({ message: "Missing or invalid required order details (items array, totalAmount, deliveryAddress, paymentDetails.method, foodPartner ID)." });
    }
    if (!mongoose.Types.ObjectId.isValid(foodPartnerId)) {
         return res.status(400).json({ message: "Invalid Food Partner ID format." });
    }
     // Basic address structure validation
    if (deliveryAddress.type !== 'Point' || typeof deliveryAddress.address !== 'object' || (!deliveryAddress.address.formatted && !deliveryAddress.address.street)) {
        return res.status(400).json({ message: "Invalid delivery address structure." });
    }
     // Payment method validation
     if (!['Cash on Delivery', 'UPI', 'Card'].includes(paymentDetails.method)) { // Ensure 'Card' is in your enum
         return res.status(400).json({ message: "Invalid payment method specified." });
     }


    try {
        // --- Verify Food Partner Exists ---
        const partnerExists = await foodPartnerModel.findById(foodPartnerId);
        if (!partnerExists) {
            return res.status(404).json({ message: `Food partner with ID ${foodPartnerId} not found.` });
        }

        // --- Item Validation & Server-Side Total Calculation ---
        let serverCalculatedTotal = 0;
        const validatedItems = []; // To store items with validated data

        // Get all food IDs from the order
        const foodIds = items.map(item => {
             if (!item.food || !mongoose.Types.ObjectId.isValid(item.food)) {
                 throw new Error(`Invalid food ID format found in items.`); // Throw error to be caught by catch block
             }
            if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
                throw new Error(`Invalid quantity for item ${item.food}. Must be a positive integer.`);
            }
             return item.food;
        });


        // Fetch all food items from DB at once
        const foodItemsFromDB = await foodModel.find({ '_id': { $in: foodIds } });

        // Create a map for quick lookup
        const foodMap = new Map(foodItemsFromDB.map(food => [food._id.toString(), food]));

        for (const item of items) {
            const foodDetails = foodMap.get(item.food.toString());

            // Check if food item exists
            if (!foodDetails) {
                return res.status(404).json({ message: `Food item with ID ${item.food} not found.` });
            }

            // **Check if food item belongs to the specified partner**
            if (foodDetails.foodPartner.toString() !== foodPartnerId) {
                return res.status(400).json({ message: `Item ${foodDetails.name} (ID: ${item.food}) does not belong to the specified food partner.` });
            }

            // **Calculate price based on DB data**
            serverCalculatedTotal += foodDetails.price * item.quantity;

            // Add validated item details (using DB price) to a new array
            validatedItems.push({
                food: foodDetails._id, // Use the ObjectId
                quantity: item.quantity,
                price: foodDetails.price // Use the price from the database
            });
        }

        // --- Validate Total Amount ---
        // Use a small tolerance for potential floating-point issues if necessary,
        // but for simple multiplication, direct comparison is often okay.
        const tolerance = 0.01; // Example: Allow 1 paisa difference
        if (Math.abs(serverCalculatedTotal - frontendTotalAmount) > tolerance) {
            console.warn(`Order total mismatch. Frontend: ${frontendTotalAmount}, Server: ${serverCalculatedTotal}`);
            return res.status(400).json({
                message: `Order total amount mismatch. Expected ₹${serverCalculatedTotal.toFixed(2)} but received ₹${frontendTotalAmount.toFixed(2)}. Please refresh and try again.`,
                serverTotal: serverCalculatedTotal,
                clientTotal: frontendTotalAmount
            });
        }

        // --- Create the Order (using validated data) ---
        const newOrder = await Order.create({
            user: userId,
            foodPartner: foodPartnerId, // Use the validated ID
            items: validatedItems, // Use items with server-verified prices
            totalAmount: serverCalculatedTotal, // **Use the server-calculated total**
            deliveryAddress: deliveryAddress, // Assumed validated earlier
            paymentDetails: {
                method: paymentDetails.method,
                status: paymentDetails.status || 'pending',
                transactionId: paymentDetails.transactionId, // Store if provided
            },
            orderStatus: 'pending' // Initial status
        });

        // --- Update the User's Order History ---
        await userModel.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });

        // --- Respond to Client ---
        return res.status(201).json({
            message: "Order placed successfully!",
            order: newOrder // Send back the created order details
        });

    } catch (error) {
        console.error("Error creating order:", error);
         if (error.name === 'ValidationError' || error.message.includes('Invalid quantity') || error.message.includes('Invalid food ID')) {
             return res.status(400).json({ message: "Order validation failed.", details: error.message });
         }
         // Handle potential CastError if IDs are invalid format, though initial checks should catch most
         if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid ID format provided.", details: error.message });
         }
        return res.status(500).json({ message: "Internal server error while creating order." });
    }
}

// --- NEW: GET ORDERS FOR FOOD PARTNER ---
async function getPartnerOrders(req, res) {
    // Ensure partner is authenticated and ID is available
    if (!req.foodPartner || req.role !== 'foodpartner') {
        return res.status(401).json({ message: "Food partner authentication required." });
    }
    const foodPartnerId = req.foodPartner._id;

    // Get status filter from query params, default to 'pending' if not specified
    const statusFilter = req.query.status; // e.g., 'pending', 'accepted', 'preparing', 'out-for-delivery'

    try {
        const query = { foodPartner: foodPartnerId };
        if (statusFilter) {
            // Validate statusFilter against the enum if needed
            const validStatuses = Order.schema.path('orderStatus').enumValues;
            if (validStatuses.includes(statusFilter)) {
                query.orderStatus = statusFilter;
            } else {
                 return res.status(400).json({ message: `Invalid status filter: ${statusFilter}` });
            }
        }

        // Find orders, sort by newest first, populate user info (optional) and item info
        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Show newest orders first
            .populate('user', 'name userName email') // Get basic user details (adjust fields as needed)
            .populate('items.food', 'name'); // Get the name of the food item

        return res.status(200).json({
            message: `Fetched orders successfully ${statusFilter ? `with status: ${statusFilter}` : '(all statuses)'}`,
            orders: orders
        });

    } catch (error) {
        console.error("Error fetching partner orders:", error);
        return res.status(500).json({ message: "Internal server error while fetching orders." });
    }
}

// --- NEW: UPDATE ORDER STATUS BY PARTNER ---
async function updateOrderStatus(req, res) {
    if (!req.foodPartner || req.role !== 'foodpartner') {
        return res.status(401).json({ message: "Food partner authentication required." });
    }
    const foodPartnerId = req.foodPartner._id;
    const orderId = req.params.orderId; // Get order ID from URL parameter
    const { status: newStatus } = req.body; // Get the new status from request body

    // Validate the new status against the allowed enum values in your Order model
    const validStatuses = Order.schema.path('orderStatus').enumValues;
    if (!newStatus || !validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: `Invalid or missing status provided. Must be one of: ${validStatuses.join(', ')}` });
    }

     if (!mongoose.Types.ObjectId.isValid(orderId)) {
         return res.status(400).json({ message: "Invalid Order ID format." });
     }


    try {
        // Find the order, ensuring it belongs to THIS food partner
        const order = await Order.findOne({ _id: orderId, foodPartner: foodPartnerId });

        if (!order) {
            return res.status(404).json({ message: "Order not found or you do not have permission to modify it." });
        }

        // Optional: Add logic to prevent invalid status transitions
        // e.g., cannot go from 'delivered' back to 'preparing'
        // const allowedTransitions = {
        //     pending: ['accepted', 'rejected', 'cancelled'],
        //     accepted: ['preparing', 'cancelled'],
        //     preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
        //     // ... etc.
        // };
        // if (!allowedTransitions[order.orderStatus]?.includes(newStatus)) {
        //     return res.status(400).json({ message: `Cannot transition order from status '${order.orderStatus}' to '${newStatus}'.` });
        // }

        // Update the order status
        order.orderStatus = newStatus;
        await order.save();

        // TODO (Later): Implement notification system (e.g., push notification, WebSocket event)
        // to inform the user about the status update.

        return res.status(200).json({
            message: "Order status updated successfully.",
            order: order // Return the updated order
        });

    } catch (error) {
        console.error("Error updating order status:", error);
         if (error.name === 'ValidationError') {
             return res.status(400).json({ message: "Validation failed.", errors: error.errors });
         }
        return res.status(500).json({ message: "Internal server error while updating order status." });
    }
}

// --- NEW: GET SINGLE ORDER DETAILS (Useful for User Tracking Page) ---
async function getOrderById(req, res) {
    // This can be used by both user and partner, maybe check role for authorization
     if (!req.user && !req.foodPartner) { // Check if either user or partner is logged in
         return res.status(401).json({ message: "Authentication required." });
     }

    const orderId = req.params.orderId;

     if (!mongoose.Types.ObjectId.isValid(orderId)) {
         return res.status(400).json({ message: "Invalid Order ID format." });
     }

    try {
        const order = await Order.findById(orderId)
            .populate('user', 'name userName') // Populate user details
            .populate('foodPartner', 'name location.address.formatted') // Populate partner details
            .populate('items.food', 'name'); // Populate food item names

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Authorization check: Ensure the requester is either the user who placed the order
        // or the food partner fulfilling it.
        const isUserOwner = req.user && order.user.equals(req.user._id);
        const isPartnerOwner = req.foodPartner && order.foodPartner.equals(req.foodPartner._id);

        if (!isUserOwner && !isPartnerOwner) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to view this order." });
        }

        return res.status(200).json({
            message: "Order details fetched successfully.",
            order: order
        });

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return res.status(500).json({ message: "Internal server error while fetching order details." });
    }
}
module.exports = { createOrder , getPartnerOrders, updateOrderStatus, getOrderById}; 