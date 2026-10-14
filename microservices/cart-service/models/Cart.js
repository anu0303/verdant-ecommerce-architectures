import mongoose from "mongoose";

// Notice this cart only stores a productId and quantity - NOT a populated
// product document. In a real microservice, the cart-service does not
// own product data, so it can't join against it in the database like the
// monolith's Cart model does. It has to ask product-service over HTTP.
const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    cartId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
