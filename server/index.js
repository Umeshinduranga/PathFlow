import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import mongoose from "mongoose";
import LearningPath from "./models/LearningPath.js";



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));


// Load environment variables
dotenv.config();

//  Create app FIRST
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

//  AI-powered route
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

    //  Correct OpenAI call for modern SDK
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    // Extract text safely
    const text = response.choices?.[0]?.message?.content || "";

    //  Turn into array of steps
    const steps = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && /^\d+\./.test(line));

    res.json({ steps });
  } catch (error) {
    console.error("Error in /generate-path:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});



// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
