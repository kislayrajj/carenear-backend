import Pharmacy from "../models/Pharmacy.js";

// GET all pharmacies
export const getPharmacies = async (req, res) => {
  try {
    const { q, medicine, open } = req.query;

    let filter = {};

    // 🔍 search by name/address
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    //  open filter
    if (open === "true") {
      filter.open = true;
    }

    let pharmacies = await Pharmacy.find(filter);

    // SMART MEDICINE MATCHING
    if (medicine) {
      const meds = medicine
        .toLowerCase()
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean); // removes empty like ","

      pharmacies = pharmacies
        .map((p) => {
          const matched = p.medicines.filter((m) =>
            meds.some((med) => m.name.toLowerCase().includes(med)),
          );

          return {
            ...p.toObject(),
            matchCount: matched.length,
          };
        })
        .filter((p) => p.matchCount > 0); // 🔥 THIS LINE IS CRITICAL
    }

    res.json(pharmacies);
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
