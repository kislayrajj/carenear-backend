import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  address: String,
  phone: String,

  open: {
    type: Boolean,
    default: true,
  },

  // medicines inside pharmacy
  medicines: [
    {
      name: String,
      available: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

export default mongoose.model("Pharmacy", pharmacySchema);
