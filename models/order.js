const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
    },
  ],
  total_price: {
    type: Number,
    required: true,
  },
  delivery: {
    address: String,
    zip_code: Number,
    name: String,
    email: String,
    phone: String,
    message: String,
  },
  order_status: {
    type: String,
    enum: ["pending", "shipped", "delivered"],
    default: "pending",
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
