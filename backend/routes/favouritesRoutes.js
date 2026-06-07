import express from "express";
import User from "../models/user.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// GET - fetch all favourites for logged in user
async function getFavourites(req, res) {
  try {
    res.json(req.user.favourites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching favourites" });
  }
}

// POST - add a repo to favourites
async function addFavourite(req, res) {
  try {
    const { repoId, repoName, ownerLogin, description, stars, forks } = req.body;

    const alreadyExists = req.user.favourites.find(
      (f) => f.repoId === repoId
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Repo already in favourites" });
    }

    req.user.favourites.push({ repoId, repoName, ownerLogin, description, stars, forks });
    await req.user.save();

    res.status(201).json(req.user.favourites);
  } catch (err) {
    res.status(500).json({ message: "Error adding favourite" });
  }
}

// DELETE - remove a repo from favourites
async function removeFavourite(req, res) {
  try {
    const { repoId } = req.params;

    req.user.favourites = req.user.favourites.filter(
      (f) => f.repoId !== Number(repoId)
    );

    await req.user.save();

    res.json(req.user.favourites);
  } catch (err) {
    res.status(500).json({ message: "Error removing favourite" });
  }
}

// PUT - update notes on a favourite (optional but completes CRUD)
async function updateFavourite(req, res) {
  try {
    const { repoId } = req.params;
    const { description } = req.body;

    const favourite = req.user.favourites.find(
      (f) => f.repoId === Number(repoId)
    );

    if (!favourite) {
      return res.status(404).json({ message: "Favourite not found" });
    }

    favourite.description = description;
    await req.user.save();

    res.json(req.user.favourites);
  } catch (err) {
    res.status(500).json({ message: "Error updating favourite" });
  }
}

router.get("/", protect, getFavourites);
router.post("/", protect, addFavourite);
router.delete("/:repoId", protect, removeFavourite);
router.put("/:repoId", protect, updateFavourite);

export default router;