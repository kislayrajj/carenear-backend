import mongoose from "mongoose";
import Pharmacy from "../models/Pharmacy.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();
await connectDB();

const cities = ["Delhi", "Mumbai", "Pune", "Bangalore", "Hyderabad"];
const medicines = ["Paracetamol", "Aspirin", "Ibuprofen", "Insulin", "Amoxicillin"];

const pharmacies = [];

for (let i = 1; i <= 60; i++) {
  pharmacies.push({
    name: `Pharmacy ${i}`,
    address: cities[Math.floor(Math.random() * cities.length)],
    phone: `98765${10000 + i}`,
    open: Math.random() > 0.2,
    medicines: medicines.map((m) => ({
      name: m,
      available: Math.random() > 0.3,
    })),
  });
}

await Pharmacy.deleteMany();
await Pharmacy.insertMany(pharmacies);

console.log("🔥 Pharmacies Seeded");
process.exit();