import Doctor from "../models/Doctor.js";
import Pharmacy from "../models/Pharmacy.js";

export const getOverview = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const availableDoctors = await Doctor.countDocuments({ available: true });
    const openPharmacies = await Pharmacy.countDocuments({ open: true });

    const avgFeeResult = await Doctor.aggregate([
      {
        $match: { available: true }
      },
      {
        $group: {
          _id: null,
          avgFee: { $avg: "$fee" }
        }
      }
    ]);

    const avgFee = avgFeeResult[0]?.avgFee || 0;
    const availabilityRate = totalDoctors > 0 ? ((availableDoctors / totalDoctors) * 100).toFixed(1) : 0;
    const estimatedRevenue = availableDoctors * avgFee;

    res.json({
      totalDoctors,
      totalPharmacies,
      availableDoctors,
      openPharmacies,
      availabilityRate: parseFloat(availabilityRate),
      estimatedRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorsAnalytics = async (req, res) => {
  try {
    const bySpecialization = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
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
      {
        $sort: { count: -1 },
      },
    ]);

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
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const avgFeeResult = await Doctor.aggregate([
      {
        $group: {
          _id: null,
          avgFee: { $avg: "$fee" },
        },
      },
    ]);

    const avgRatingResult = await Doctor.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const experienceDistribution = await Doctor.aggregate([
      {
        $bucket: {
          groupBy: "$experience",
          boundaries: [0, 5, 10, 15, 100],
          default: "Unknown",
          output: {
            count: { $sum: 1 },
          },
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
              default: "Unknown",
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    const topDoctors = await Doctor.find()
      .sort({ rating: -1 })
      .limit(5)
      .select("name specialization rating fee");

    res.json({
      bySpecialization,
      byCity,
      avgFee: Math.round(avgFeeResult[0]?.avgFee || 0),
      avgRating: (avgRatingResult[0]?.avgRating || 0).toFixed(1),
      topDoctors,
      experienceDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    const openCount = openVsClosed.find((item) => item._id === true)?.count || 0;
    const closedCount = openVsClosed.find((item) => item._id === false)?.count || 0;

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
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
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
      {
        $sort: { count: -1 },
      },
      { $limit: 10 },
    ]);

    const topPharmacies = await Pharmacy.aggregate([
      {
        $project: {
          name: 1,
          address: 1,
          open: 1,
          availableCount: {
            $size: {
              $filter: {
                input: "$medicines",
                as: "med",
                cond: { $eq: ["$$med.available", true] },
              },
            },
          },
        },
      },
      {
        $sort: { availableCount: -1 },
      },
      { $limit: 5 },
    ]);

    res.json({
      openVsClosed: {
        open: openCount,
        closed: closedCount,
      },
      byCity,
      topMedicines,
      topPharmacies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInsights = async (req, res) => {
  try {
    const insights = [];

    const totalDoctors = await Doctor.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const openPharmacies = await Pharmacy.countDocuments({ open: true });
    const availableDoctors = await Doctor.countDocuments({ available: true });

    const topCity = await Doctor.aggregate([
      { $group: { _id: "$address", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const topSpecialization = await Doctor.aggregate([
      { $group: { _id: "$specialization", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const avgFeeResult = await Doctor.aggregate([
      { $group: { _id: null, avgFee: { $avg: "$fee" } } },
    ]);

    const avgFee = Math.round(avgFeeResult[0]?.avgFee || 0);

    if (totalDoctors > 0 && topCity[0]?._id) {
      insights.push(`${topCity[0]._id} has the highest number of doctors (${topCity[0].count})`);
    }

    if (topSpecialization[0]?._id) {
      insights.push(`${topSpecialization[0]._id}s dominate the system`);
    }

    if (avgFee > 0) {
      insights.push(`Average consultation fee is ₹${avgFee}`);
    }

    if (totalPharmacies > 0) {
      const openPercentage = Math.round((openPharmacies / totalPharmacies) * 100);
      insights.push(`${openPercentage}% pharmacies are currently open`);
    }

    if (totalDoctors > 0 && availableDoctors > 0) {
      const availablePercentage = Math.round((availableDoctors / totalDoctors) * 100);
      insights.push(`${availablePercentage}% doctors are available for appointments`);
    }

    if (insights.length < 4) {
      if (totalDoctors > 0) {
        insights.push(`Total ${totalDoctors} doctors registered in the system`);
      }
      if (totalPharmacies > 0) {
        insights.push(`${totalPharmacies} pharmacies available for medicines`);
      }
    }

    res.json({
      insights: insights.slice(0, 6),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};