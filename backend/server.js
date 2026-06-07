import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import passport from "passport";
import "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import favouritesRoutes from "./routes/favouritesRoutes.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/gitpulse/auth", authRoutes);
app.use("/gitpulse/favourites", favouritesRoutes);

app.get("/", (req, res) => res.send("GitPulse API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));