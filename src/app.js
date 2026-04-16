import express from "express";
import cors from "cors";
import doctorRoutes from "./routes/doctorRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api/doctors", doctorRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;