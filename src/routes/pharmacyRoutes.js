import express from "express";
import {
  getPharmacies,
  getPharmacyById,
  createPharmacy,
} from "../controllers/pharmacyController.js";

const router = express.Router();

router.get("/", getPharmacies);
router.get("/:id", getPharmacyById);
router.post("/", createPharmacy); // for testing

export default router;