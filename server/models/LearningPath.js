import express from "express";
import LearningPath from "../models/LearningPath.js";

const router = express.Router();

// ✅ Save a generated path
router.post("/", async (req, res) => {
  try {
    const { skills, goal, path } = req.body;
    const newPath = new LearningPath({ skills, goal, path });
    await newPath.save();
    res.status(201).json(newPath);
  } catch (error) {
    res.status(500).json({ message: "Error saving path", error });
  }
});

// ✅ Get all saved paths
router.get("/", async (req, res) => {
  try {
    const paths = await LearningPath.find();
    res.json(paths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching paths", error });
  }
});

export default router;
