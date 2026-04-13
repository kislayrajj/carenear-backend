import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    clinic_name: String,
    address: String,
    phone: String,

    experience: {
      type: Number,
      default: 0,
    },

    fee: {
      type: Number,
      default: 0,
    },

    available: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 4.5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    about: String,

    education: [String],
    languages: [String],

    timings: [
      {
        day: String,
        time: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);