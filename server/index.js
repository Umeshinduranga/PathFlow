import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

// ✅ Create app FIRST
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// ✅ AI-powered route
app.post("/generate-path", async (req, res) => {
  const { skills, goal } = req.body;

  if (!skills || !goal) {
    return res.status(400).json({ error: "Please provide skills and goal" });
  }

  try {
    const prompt = `Create a beginner-friendly, step-by-step learning path for someone who knows ${skills} and wants to become a ${goal}. Include 6 clear steps.`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const text = response.output_text || "No steps generated.";
    const steps = text.split("\n").filter(line => line.trim() !== "");

    res.json({ steps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
