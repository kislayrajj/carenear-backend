import Pharmacy from "../models/Pharmacy.js";

// GET all pharmacies
export const getPharmacies = async (req, res) => {
  try {
    const {
      q,
      medicine,
      open,
      page = 1,
      limit = 8,
    } = req.query;

    let filter = {};

    // 🔍 search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    // open filter
    if (open === "true") {
      filter.open = true;
    }

    // 🔥 STEP 1: fetch base data
    let pharmacies = await Pharmacy.find(filter);

    // 🔥 STEP 2: medicine matching + ranking
    if (medicine) {
      const meds = medicine
        .toLowerCase()
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      pharmacies = pharmacies
        .map((p) => {
          const matched = p.medicines.filter((m) =>
            meds.some((med) =>
              m.name.toLowerCase().includes(med)
            )
          );

          return {
            ...p.toObject(),
            matchCount: matched.length,
          };
        })
        .filter((p) => p.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount); // 🔥 ranking
    }

    // 🔥 STEP 3: pagination
    const total = pharmacies.length;
    const start = (page - 1) * limit;
    const paginated = pharmacies.slice(start, start + Number(limit));

    // 🔥 RESPONSE
    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data: paginated,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET pharmacy by ID
export const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE pharmacy (for testing)
export const createPharmacy = async (req, res) => {
  try {
    const pharmacy = new Pharmacy(req.body);
    await pharmacy.save();
    res.status(201).json(pharmacy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
