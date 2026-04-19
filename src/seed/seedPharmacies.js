import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Pharmacy from "../models/Pharmacy.js";

dotenv.config();
await connectDB();

//  DATA POOLS 

const cities = ["Delhi","Mumbai","Bangalore","Hyderabad","Chennai","Pune"];

const prefixes = ["Apollo","City","Health","Wellness","Care","Medico","LifeCare"];
const suffixes = ["Pharmacy","Medicals","Drug Store","Health Hub","Care Center"];

const medicinesList = [
  "Paracetamol",
  "Ibuprofen",
  "Insulin",
  "Metformin",
  "Amoxicillin",
  "Aspirin",
  "Cetirizine",
  "Azithromycin",
  "Pantoprazole"
];

//  HELPERS 

const usedNames = new Set();

const generateUniquePharmacyName = (city) => {
  let name;

  do {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    name = `${p} ${s} ${city}`;
  } while (usedNames.has(name));

  usedNames.add(name);
  return name;
};

const generateMedicines = () => {
  return medicinesList.map((m) => ({
    name: m,
    available: Math.random() > 0.2
  }));
};

const generatePharmacy = () => {
  const city = cities[Math.floor(Math.random() * cities.length)];

  return {
    name: generateUniquePharmacyName(city),
    address: city,
    phone: "9" + Math.floor(100000000 + Math.random() * 900000000),
    open: Math.random() > 0.2,
    medicines: generateMedicines()
  };
};

//  SEED 

const seedPharmacies = async () => {
  try {
    await Pharmacy.deleteMany();

    const pharmacies = Array.from({ length: 60 }, generatePharmacy);

    await Pharmacy.insertMany(pharmacies);

    console.log(" Pharmacies seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPharmacies();