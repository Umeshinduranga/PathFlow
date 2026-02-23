import mongoose, { Schema, Model } from "mongoose";
import { ILearningPath } from "@/types";

const learningPathSchema = new Schema<ILearningPath>(
    {
        skills: {
            type: [String],
            required: true,
        },
        goal: {
            type: String,
            required: true,
        },
        path: {
            type: [String],
            required: true,
        },
        generatedBy: {
            type: String,
            enum: ["ai", "manual", "fallback", "gemini-direct", "gemini-sdk", "openai"],
            default: "ai",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        completedSteps: {
            type: [Number],
            default: [],
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const LearningPath: Model<ILearningPath> =
    (mongoose.models.LearningPath as Model<ILearningPath>) ||
    mongoose.model<ILearningPath>("LearningPath", learningPathSchema);

export default LearningPath;
