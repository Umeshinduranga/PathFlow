import mongoose from "mongoose";

const learningPathSchema = new mongoose.Schema({
  skills: {
    type: [String],
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  path: {
    type: [String],
    required: true
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'manual', 'fallback', 'gemini-direct', 'gemini-sdk', 'openai'],
    default: 'ai'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completedSteps: {
    type: [Number],
    default: []
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

export default LearningPath;
