import Doctor from "../models/Doctor.js";

export const getDoctors = async (req, res) => {
  try {
    const {
      q,
      specialization,
      available,
      location, // 🔥 NEW
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    // 🔍 search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { specialization: { $regex: q, $options: "i" } },
        { clinic_name: { $regex: q, $options: "i" } },
      ];
    }

    // specialization
    if (specialization && specialization !== "All") {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    // availability
    if (available === "true") {
      filter.available = true;
    }

    // 🔥 FIX: location support
    if (req.query.location) {
      filter.address = {
        $regex: req.query.location,
        $options: "i",
      };
    }

    const skip = (page - 1) * limit;

    const total = await Doctor.countDocuments(filter);

    const doctors = await Doctor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data: doctors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE doctor (for testing/admin)
export const createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
