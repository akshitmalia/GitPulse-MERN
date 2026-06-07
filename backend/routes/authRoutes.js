import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import protect from "../middleware/protect.js";

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sendTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/" }),
  function (req, res) {
    const token = generateToken(req.user._id);
    sendTokenCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL}/`);
  }
);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  function (req, res) {
    const token = generateToken(req.user._id);
    sendTokenCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL}/`);
  }
);

// Get current user
router.get("/me", protect, function (req, res) {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    favourites: req.user.favourites,
  });
});

// Logout
router.post("/logout", function (req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ message: "Logged out successfully" });
});

export default router;