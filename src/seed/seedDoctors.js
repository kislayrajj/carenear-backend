import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Doctor from "../models/Doctor.js";

dotenv.config();
await connectDB();

// ---------------- DATA POOLS ----------------

const firstNames = [
  "Arjun","Priya","Rohan","Sneha","Amit","Neha","Rahul","Anjali",
  "Karan","Pooja","Vikram","Isha","Aditya","Meera","Siddharth","Nikita"
];

const lastNames = [
  "Mehta","Sharma","Das","Kapoor","Verma","Gupta","Nair","Iyer",
  "Patel","Reddy","Joshi","Malhotra","Singh","Chopra","Bansal"
];

const cities = ["Delhi","Mumbai","Bangalore","Hyderabad","Chennai","Pune"];

const clinics = [
  "Apollo Clinic",
  "Fortis Healthcare",
  "Care Hospital",
  "City Health Center",
  "Sunrise Medical",
  "Medico Hub"
];

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician"
];

// ---------------- HELPERS ----------------

const usedNames = new Set();

const generateUniqueName = () => {
  let name;
  do {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    name = `Dr. ${first} ${last}`;
  } while (usedNames.has(name));

  usedNames.add(name);
  return name;
};

// weighted specialization
const getSpecialization = () => {
  const r = Math.random();
  if (r < 0.3) return "General Physician";
  if (r < 0.5) return "Pediatrician";
  if (r < 0.65) return "Dermatologist";
  if (r < 0.8) return "Cardiologist";
  return specializations[Math.floor(Math.random() * specializations.length)];
};

const generateDoctor = () => {
  const city = cities[Math.floor(Math.random() * cities.length)];

  return {
    name: generateUniqueName(),
    specialization: getSpecialization(),
    clinic_name: clinics[Math.floor(Math.random() * clinics.length)],
    address: city,
    phone: "9" + Math.floor(100000000 + Math.random() * 900000000),

    experience: Math.floor(Math.random() * 20) + 1,

    fee: Math.floor(Math.random() * 1000) + 300,

    available: Math.random() > 0.3,

    rating: +(Math.random() * (5 - 3.5) + 3.5).toFixed(1),

    reviewCount: Math.floor(Math.random() * 200),

    education: ["MBBS", "MD"],
    languages: ["English", "Hindi"],
  };
};

// ---------------- SEED ----------------

const seedDoctors = async () => {
  try {
    await Doctor.deleteMany();

    const doctors = Array.from({ length: 120 }, generateDoctor);

    await Doctor.insertMany(doctors);

    console.log("✅ Doctors seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDoctors();