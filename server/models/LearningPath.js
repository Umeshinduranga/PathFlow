import mongoose from "mongoose";

const LearningPathSchema = new mongoose.Schema({
  skills: String,
  goal: String,
  steps: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("LearningPath", LearningPathSchema);
