import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "../models/Doctor.js";

dotenv.config();

const doctors = [
  {
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    clinic_name: "Heart Care Clinic",
    address: "Mumbai",
    experience: 12,
    fee: 800,
    available: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: "Dr. Arjun Mehta",
    specialization: "General Physician",
    clinic_name: "Mehta Clinic",
    address: "Delhi",
    experience: 8,
    fee: 500,
    available: true,
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: "Dr. Sunita Rao",
    specialization: "Dermatologist",
    clinic_name: "SkinCare Plus",
    address: "Bangalore",
    experience: 15,
    fee: 1000,
    available: false,
    rating: 4.7,
    reviewCount: 201,
  },
  {
    name: "Dr. Rahul Verma",
    specialization: "Neurologist",
    clinic_name: "Neuro Center",
    address: "Hyderabad",
    experience: 10,
    fee: 1200,
    available: true,
    rating: 4.6,
    reviewCount: 150,
  },
  {
    name: "Dr. Kavita Singh",
    specialization: "Pediatrician",
    clinic_name: "Kids Care",
    address: "Kolkata",
    experience: 9,
    fee: 600,
    available: true,
    rating: 4.4,
    reviewCount: 98,
  },
  {
    name: "Dr. Amit Joshi",
    specialization: "Orthopedic",
    clinic_name: "Bone & Joint Clinic",
    address: "Pune",
    experience: 14,
    fee: 900,
    available: false,
    rating: 4.5,
    reviewCount: 130,
  },
  {
    name: "Dr. Neha Kapoor",
    specialization: "Cardiologist",
    clinic_name: "HeartLine Clinic",
    address: "Delhi",
    experience: 11,
    fee: 850,
    available: true,
    rating: 4.7,
    reviewCount: 110,
  },
  {
    name: "Dr. Sameer Khan",
    specialization: "General Physician",
    clinic_name: "City Health",
    address: "Mumbai",
    experience: 6,
    fee: 400,
    available: true,
    rating: 4.3,
    reviewCount: 75,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Doctor.deleteMany(); // clear old data
    await Doctor.insertMany(doctors);

    console.log("✅ Doctors seeded");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();