import express from "express";
import { getOverview, getDoctorsAnalytics, getPharmaciesAnalytics, getInsights } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/overview", getOverview);
router.get("/doctors", getDoctorsAnalytics);
router.get("/pharmacies", getPharmaciesAnalytics);
router.get("/insights", getInsights);

export default router;