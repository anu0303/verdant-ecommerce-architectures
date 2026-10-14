import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, index: true }, // user id from the JWT (owned by user-service)
    status: { type: String, default: "Processing" },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    customer: {
      name: String,
      email: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    payment: {
      status: { type: String, enum: ["paid", "failed"], required: true },
      cardBrand: String,
      last4: String,
      transactionId: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
