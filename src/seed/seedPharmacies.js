import mongoose from "mongoose";
import dotenv from "dotenv";
import Pharmacy from "../models/Pharmacy.js";

dotenv.config();

const pharmacies = [
  {
    name: "Apollo Pharmacy",
    address: "Mumbai",
    phone: "9876500001",
    open: true,
    medicines: [
      { name: "Paracetamol", available: true },
      { name: "Aspirin", available: true },
      { name: "Metformin", available: false },
    ],
  },
  {
    name: "MedPlus",
    address: "Delhi",
    phone: "9876500002",
    open: true,
    medicines: [
      { name: "Paracetamol", available: true },
      { name: "Insulin", available: true },
    ],
  },
  {
    name: "HealthCare Pharmacy",
    address: "Bangalore",
    phone: "9876500003",
    open: false,
    medicines: [
      { name: "Ibuprofen", available: true },
      { name: "Amoxicillin", available: true },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Pharmacy.deleteMany();
    await Pharmacy.insertMany(pharmacies);

    console.log("✅ Pharmacies seeded");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();