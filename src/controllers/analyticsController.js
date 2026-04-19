import Doctor from "../models/Doctor.js";
import Pharmacy from "../models/Pharmacy.js";

/* ===================== OVERVIEW ===================== */
export const getOverview = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();

    const availableDoctors = await Doctor.countDocuments({ available: true });
    const openPharmacies = await Pharmacy.countDocuments({ open: true });

    const avgFeeResult = await Doctor.aggregate([
      { $match: { available: true } },
      {
        $group: {
          _id: null,
          avgFee: { $avg: "$fee" },
        },
      },
    ]);

    const avgFee = avgFeeResult[0]?.avgFee || 0;

    const estimatedRevenue = availableDoctors * avgFee;

    res.json({
      totalDoctors,
      totalPharmacies,
      availableDoctors,
      openPharmacies,
      availabilityRate:
        totalDoctors > 0
          ? Number(((availableDoctors / totalDoctors) * 100).toFixed(1))
          : 0,
      estimatedRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== DOCTORS ANALYTICS ===================== */
export const getDoctorsAnalytics = async (req, res) => {
  try {
    // specialization
    const bySpecialization = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
          count: { $sum: 1 },
          avgFee: { $avg: "$fee" },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          avgFee: { $round: ["$avgFee", 0] },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // city
    const byCity = await Doctor.aggregate([
      {
        $group: {
          _id: "$address",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // experience buckets
    const experienceDistribution = await Doctor.aggregate([
      {
        $bucket: {
          groupBy: "$experience",
          boundaries: [0, 5, 10, 15, 100],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-5" },
                { case: { $eq: ["$_id", 5] }, then: "5-10" },
                { case: { $eq: ["$_id", 10] }, then: "10-15" },
                { case: { $eq: ["$_id", 15] }, then: "15+" },
              ],
              default: "Other",
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 🔥 NEW: growth (monthly)
    const growth = await Doctor.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // 🔥 NEW: demand score
    const topDoctors = await Doctor.aggregate([
      {
        $project: {
          name: 1,
          specialization: 1,
          rating: 1,
          fee: 1,
          demandScore: {
            $multiply: ["$rating", "$reviewCount"],
          },
        },
      },
      { $sort: { demandScore: -1 } },
      { $limit: 5 },
    ]);

    // 🔥 NEW: gap analysis
    const gapAnalysis = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
          total: { $sum: 1 },
          available: {
            $sum: { $cond: ["$available", 1, 0] },
          },
        },
      },
      {
        $project: {
          specialization: "$_id",
          shortage: { $subtract: ["$total", "$available"] },
          _id: 0,
        },
      },
      { $sort: { shortage: -1 } },
    ]);
    // 🔥 Demand vs Supply
const demandVsSupply = await Doctor.aggregate([
  {
    $group: {
      _id: "$specialization",
      totalDoctors: { $sum: 1 },
      availableDoctors: {
        $sum: { $cond: ["$available", 1, 0] },
      },
      avgRating: { $avg: "$rating" },
      totalReviews: { $sum: "$reviewCount" },
    },
  },
  {
    $project: {
      specialization: "$_id",
      supply: "$availableDoctors",
      demandScore: {
        $multiply: ["$avgRating", "$totalReviews"],
      },
      shortage: {
        $subtract: ["$totalDoctors", "$availableDoctors"],
      },
      _id: 0,
    },
  },
  { $sort: { shortage: -1 } },
]);

    res.json({
      bySpecialization,
      byCity,
      experienceDistribution,
      growth,
      topDoctors,
      gapAnalysis,
      demandVsSupply
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== PHARMACY ===================== */
export const getPharmaciesAnalytics = async (req, res) => {
  try {
    const openVsClosed = await Pharmacy.aggregate([
      {
        $group: {
          _id: "$open",
          count: { $sum: 1 },
        },
      },
    ]);

    const open = openVsClosed.find((i) => i._id === true)?.count || 0;
    const closed = openVsClosed.find((i) => i._id === false)?.count || 0;

    const byCity = await Pharmacy.aggregate([
      {
        $group: {
          _id: "$address",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 🔥 NEW: medicine availability ratio
    const topPharmacies = await Pharmacy.aggregate([
      {
        $project: {
          name: 1,
          address: 1,
          availabilityRate: {
            $divide: [
              {
                $size: {
                  $filter: {
                    input: "$medicines",
                    cond: { $eq: ["$$this.available", true] },
                  },
                },
              },
              { $size: "$medicines" },
            ],
          },
        },
      },
      { $sort: { availabilityRate: -1 } },
      { $limit: 5 },
    ]);

    const topMedicines = await Pharmacy.aggregate([
      { $unwind: "$medicines" },
      {
        $group: {
          _id: "$medicines.name",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      openVsClosed: { open, closed },
      byCity,
      topMedicines,
      topPharmacies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== INSIGHTS ===================== */
export const getInsights = async (req, res) => {
  try {
    const insights = [];

    const topCity = await Doctor.aggregate([
      { $group: { _id: "$address", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const gap = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
          total: { $sum: 1 },
          available: {
            $sum: { $cond: ["$available", 1, 0] },
          },
        },
      },
      {
        $project: {
          specialization: "$_id",
          shortage: { $subtract: ["$total", "$available"] },
        },
      },
      { $sort: { shortage: -1 } },
      { $limit: 1 },
    ]);

    if (topCity[0])
      insights.push(
        `${topCity[0]._id} has highest doctor concentration (${topCity[0].count})`
      );

    if (gap[0])
      insights.push(
        `${gap[0].specialization} shows highest shortage (${gap[0].shortage})`
      );

    insights.push("Platform shows uneven healthcare distribution");

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};