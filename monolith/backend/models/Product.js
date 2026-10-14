import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ["indoor", "outdoor", "succulent", "planter", "care"],
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    description: { type: String, required: true },
    careLevel: { type: String, enum: ["easy", "moderate", "expert"], default: "easy" },
    light: { type: String, enum: ["low", "medium", "bright"], default: "medium" },
    image: { type: String, required: true },
    tags: [{ type: String, index: true }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
