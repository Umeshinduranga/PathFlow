import express from "express";
import cors from "cors";

const app = express();

// Allow frontend to talk to backend
app.use(cors());

// Allow backend to read JSON in request body
app.use(express.json());

// Test route for browser
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// ✅ Our POST route for learning path
app.post("/generate-path", (req, res) => {
  const { skills, goal } = req.body;

  res.json({
    steps: [
      `Learn the basics of ${skills}`,
      `Do beginner projects related to ${goal}`,
      "Study advanced concepts",
      "Build a portfolio project",
      "Practice interview questions",
      "Apply for jobs/internships"
    ]
  });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
