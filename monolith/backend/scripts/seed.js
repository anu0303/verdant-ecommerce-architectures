import "dotenv/config";
import { connectDB } from "../db.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

function img(photoId) {
  return `https://images.unsplash.com/photo-${photoId}?w=800&q=80&auto=format&fit=crop`;
}

const products = [
  { name: "Fiddle Leaf Fig", slug: "fiddle-leaf-fig", category: "indoor", price: 279900, compareAtPrice: 319900,
    description: "A statement plant with broad, violin-shaped leaves. Wants a bright spot out of direct sun and a consistent watering rhythm.",
    careLevel: "moderate", light: "bright", image: img("1755355761632-b0478d4edbad"),
    tags: ["statement", "large", "living-room"], stock: 14, rating: 4.4 },
  { name: "Snake Plant", slug: "snake-plant", category: "indoor", price: 89900,
    description: "Nearly indestructible, with stiff upright leaves striped in green and gold. Tolerates neglect, low light, and irregular watering.",
    careLevel: "easy", light: "low", image: img("1482868357067-cd81f209dc34"),
    tags: ["beginner", "air-purifying", "bedroom"], stock: 32, rating: 4.8 },
  { name: "Monstera Deliciosa", slug: "monstera-deliciosa", category: "indoor", price: 159900,
    description: "The split-leaf icon. Climbs when given a pole, and rewards bright, indirect light with dramatic fenestrated leaves.",
    careLevel: "easy", light: "bright", image: img("1750341005643-e79d6ec30979"),
    tags: ["popular", "climbing", "living-room"], stock: 21, rating: 4.9 },
  { name: "Golden Pothos", slug: "golden-pothos", category: "indoor", price: 59900,
    description: "Trailing vines with heart-shaped, marbled leaves. Forgiving of missed waterings and low light, and easy to propagate.",
    careLevel: "easy", light: "low", image: img("1534726955665-2cb2d145f2ad"),
    tags: ["beginner", "trailing", "shelf"], stock: 40, rating: 4.7 },
  { name: "Echeveria Elegans", slug: "echeveria-elegans", category: "succulent", price: 34900,
    description: "A rosette succulent in soft blue-green, forming tight geometric layers. Needs bright light and infrequent, deep watering.",
    careLevel: "easy", light: "bright", image: img("1767639276398-38b97ab27e53"),
    tags: ["desk", "small", "rosette"], stock: 55, rating: 4.6 },
  { name: "Zebra Haworthia", slug: "zebra-haworthia", category: "succulent", price: 29900,
    description: "Compact succulent with striking white-striped leaves. Perfect for a sunny windowsill or desk, and slow to outgrow its pot.",
    careLevel: "easy", light: "medium", image: img("1526134873661-24b337d0052f"),
    tags: ["desk", "small", "striped"], stock: 38, rating: 4.5 },
  { name: "Japanese Maple (Dwarf)", slug: "japanese-maple-dwarf", category: "outdoor", price: 389900,
    description: "A patio-friendly dwarf cultivar with delicate, deep-red foliage that turns brilliant scarlet in autumn.",
    careLevel: "moderate", light: "medium", image: img("1540126556370-fae1500ef91b"),
    tags: ["patio", "seasonal", "tree"], stock: 9, rating: 4.7 },
  { name: "Lavender (Hidcote)", slug: "lavender-hidcote", category: "outdoor", price: 44900,
    description: "Compact, fragrant lavender that thrives in full sun and well-drained soil. Deer-resistant and pollinator-friendly.",
    careLevel: "easy", light: "bright", image: img("1499002238440-d264edd596ec"),
    tags: ["fragrant", "garden", "pollinator"], stock: 46, rating: 4.8 },
  { name: "Ribbed Stoneware Planter", slug: "ribbed-stoneware-planter", category: "planter", price: 129900,
    description: "Hand-thrown stoneware with a soft ribbed texture and a matte glaze. Includes drainage hole and saucer.",
    careLevel: "easy", light: "medium", image: img("1611651625032-153048f0da00"),
    tags: ["ceramic", "medium", "matte"], stock: 27, rating: 4.9 },
  { name: "Woven Seagrass Basket Planter", slug: "woven-seagrass-basket", category: "planter", price: 89900,
    description: "A natural-fiber basket sized to slip over a standard plastic nursery pot, for an instant textural upgrade.",
    careLevel: "easy", light: "medium", image: img("1588706838478-acc49b5d9fcf"),
    tags: ["natural", "basket", "cover-pot"], stock: 33, rating: 4.6 },
  { name: "Concrete Cylinder Planter", slug: "concrete-cylinder-planter", category: "planter", price: 109900,
    description: "Minimalist raw-concrete cylinder with a smooth finish. Weighty and weatherproof, at home indoors or out.",
    careLevel: "easy", light: "medium", image: img("1523263889714-d345f8119047"),
    tags: ["concrete", "modern", "outdoor-ok"], stock: 19, rating: 4.5 },
  { name: "Precision Watering Can, 1.5L", slug: "precision-watering-can", category: "care", price: 99900,
    description: "A long, narrow brass spout for precise watering at the soil line. Powder-coated steel body in matte sage.",
    careLevel: "easy", light: "low", image: img("1599277100479-3252d492a19a"),
    tags: ["tool", "watering", "gift"], stock: 41, rating: 4.8 },
  { name: "Moisture Meter", slug: "moisture-meter", category: "care", price: 49900,
    description: "No-battery probe that reads soil moisture instantly, so you water exactly when your plant needs it.",
    careLevel: "easy", light: "low", image: img("1661712663315-d851d40bcf07"),
    tags: ["tool", "beginner", "gift"], stock: 50, rating: 4.4 },
  { name: "Pruning Snips", slug: "pruning-snips", category: "care", price: 64900,
    description: "Sharp, spring-loaded stainless steel snips sized for houseplant trims and precise cuttings.",
    careLevel: "easy", light: "low", image: img("1523301551780-cd17359a95d0"),
    tags: ["tool", "propagation"], stock: 37, rating: 4.7 },
  { name: "Slow-Release Plant Food", slug: "slow-release-plant-food", category: "care", price: 39900,
    description: "Balanced NPK pellets that feed steadily for up to 3 months. Just sprinkle on the soil surface and water as usual.",
    careLevel: "easy", light: "low", image: img("1710223221719-6251cb1b5c5b"),
    tags: ["nutrients", "beginner"], stock: 60, rating: 4.6 },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`[seed] inserted ${products.length} products`);

  // Demo admin account (safe to re-run: it is only created once)
  const adminEmail = "admin@verdant.com";
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    console.log("[seed] created admin user: admin@verdant.com / admin123");
  } else {
    console.log("[seed] admin user already exists");
  }
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
