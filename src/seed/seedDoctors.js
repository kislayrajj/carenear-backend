import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();
await connectDB();

const cities = ["Delhi", "Mumbai", "Pune", "Bangalore", "Hyderabad"];
const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "General Physician",
];

const doctors = [];

for (let i = 1; i <= 120; i++) {
  doctors.push({
    name: `Dr. Test ${i}`,
    specialization: specializations[Math.floor(Math.random() * specializations.length)],
    clinic_name: `Clinic ${i}`,
    address: cities[Math.floor(Math.random() * cities.length)],
    experience: Math.floor(Math.random() * 20) + 1,
    fee: Math.floor(Math.random() * 1200) + 300,
    available: Math.random() > 0.3,
    rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
    reviewCount: Math.floor(Math.random() * 200),
  });
}

await Doctor.deleteMany();
await Doctor.insertMany(doctors);

console.log("🔥 Doctors Seeded");
process.exit();