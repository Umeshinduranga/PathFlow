import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import LearningPath from "./models/LearningPath.js";

// Load environment variables FIRST
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());

// Setup Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is working with Gemini AI!");
});

// AI-powered route
app.post("/generate-path", async (req, res) => {
  const { skills, goal } = req.body;

  if (!skills || !goal) {
    return res.status(400).json({ error: "Please provide skills and goal" });
  }

  try {
    const prompt = `
You are a professional career coach and teacher.

Create a clear, beginner-friendly, step-by-step learning path for someone who already knows ${skills} and wants to become a ${goal}.
- Provide exactly 6 steps.
- Number each step.
- Use short, clear sentences.
- Avoid unnecessary text before or after the steps.
- Each step should start with a verb.
`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse steps
    const steps = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && /^\d+\./.test(line));

    // If no steps found, send fallback
    if (steps.length === 0) {
      return res.json({
        steps: [
          "1. Review your current skills in " + skills,
          "2. Learn the fundamentals needed for " + goal,
          "3. Build small beginner projects",
          "4. Study intermediate concepts and tools",
          "5. Create a portfolio with advanced projects",
          "6. Apply for internships or entry-level roles in " + goal
        ]
      });
    }

    res.json({ steps });
  } catch (error) {
    console.error("❌ Error in /generate-path:", error);

    // Fallback response if Gemini API fails
    res.json({
      steps: [
        "1. Review your current skills in " + skills,
        "2. Learn the fundamentals needed for " + goal,
        "3. Build small beginner projects",
        "4. Study intermediate concepts and tools",
        "5. Create a portfolio with advanced projects",
        "6. Apply for internships or entry-level roles in " + goal
      ]
    });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
