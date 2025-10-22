const mongoose = require("mongoose");
const locationSchema = require("./location.model");

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foodModel", // Reference to the food item
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number, // Price of the item *at the time of purchase*
      required: true,
    },
    instructions: {
      type: String,
    },
  },
  { _id: false }
); // Don't create separate _id for subdocuments unless needed

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who placed the order
      required: true,
    },
    foodPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foodPartner", // Reference to the restaurant
      required: true,
    },
    items: [orderItemSchema], // Array of items in the order
    totalAmount: {
      type: Number,
      required: true,
    },
    // Optional: If you wanted a more structured address:
    deliveryAddress: {
      type: locationSchema,
      required: true,
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["Cash on Delivery", "UPI", "Card"], // Add more as needed
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      transactionId: {
        // Optional: Store payment gateway transaction ID
        type: String,
      },
    },
    orderStatus: {
      type: String,
      enum: [
        "pending", // Order placed by user, awaiting partner confirmation
        "accepted", // Partner confirmed the order
        "rejected", // Partner cannot fulfill the order
        "preparing", // Order is being made
        "ready_for_pickup", // For pickup scenarios (optional)
        "out_for_delivery", // Delivery partner has picked up
        "delivered", // Order received by user
        "cancelled", // Order cancelled (by user or partner)
      ],
      default: "pending",
      required: true,
    },
    // Optional: Add estimated delivery time, delivery partner info, etc. later
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Indexes can optimize querying, e.g., finding orders for a user or partner quickly
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ foodPartner: 1, createdAt: -1 });
orderSchema.index({ foodPartner: 1, orderStatus: 1 });
orderSchema.index({ "deliveryAddress.coordinates": "2dsphere" });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
