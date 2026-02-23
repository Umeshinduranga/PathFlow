import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { generateLearningPath } from "@/lib/ai";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// POST /api/generate-path
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const { skills, goal } = await req.json();

        if (!skills || !goal) {
            return NextResponse.json(
                { success: false, error: "Skills and goal are required" },
                { status: 400 }
            );
        }

        if (skills.length > 200) {
            return NextResponse.json(
                { success: false, error: "Skills description is too long (max 200 characters)" },
                { status: 400 }
            );
        }

        if (goal.length > 100) {
            return NextResponse.json(
                { success: false, error: "Goal description is too long (max 100 characters)" },
                { status: 400 }
            );
        }

        // Generate with AI
        const { steps, provider } = await generateLearningPath(skills.trim(), goal.trim());

        // Try to save to DB (optional - don't fail the request if DB is down)
        let savedPath = null;
        try {
            await connectDB();

            // Get user from token (optional auth)
            const user = await authenticateRequest(req, false);
            const userId = user ? user._id : null;

            const skillsArray = skills.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);

            savedPath = await LearningPath.create({
                skills: skillsArray,
                goal: goal.trim(),
                path: steps,
                generatedBy: provider,
                userId,
            });
        } catch (dbError) {
            console.warn("⚠️ Could not save learning path to DB:", (dbError as Error).message);
        }

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            steps,
            pathId: savedPath?._id || null,
            metadata: {
                generatedBy: provider,
                aiProvider: provider.includes("gemini") ? "Google Gemini" : provider === "openai" ? "OpenAI" : "Fallback",
                responseTime,
                timestamp: Date.now(),
                message: provider === "fallback" ? "AI unavailable - using template path" : undefined,
            },
        });
    } catch (error) {
        console.error("Generate path error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate learning path" },
            { status: 500 }
        );
    }
}
