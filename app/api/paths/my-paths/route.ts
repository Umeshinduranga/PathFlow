import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// GET /api/paths/my-paths  (authenticated)
export async function GET(req: NextRequest) {
    try {
        const user = await authenticateRequest(req, true);

        await connectDB();

        const paths = await LearningPath.find({ userId: user!._id }).sort({ createdAt: -1 });

        // Attach progress metadata
        const pathsWithProgress = paths.map((p) => {
            const totalSteps = p.path.length;
            const completedCount = p.completedSteps?.length ?? 0;
            const progressPercentage =
                totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

            return {
                _id: p._id,
                goal: p.goal,
                skills: p.skills,
                path: p.path,
                generatedBy: p.generatedBy,
                completedSteps: p.completedSteps ?? [],
                totalSteps,
                completedCount,
                progressPercentage,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            };
        });

        return NextResponse.json({ success: true, paths: pathsWithProgress });
    } catch (error) {
        const err = error as Error;
        if (
            err.message.includes("token") ||
            err.message.includes("Access") ||
            err.message.includes("expired")
        ) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("my-paths error:", err.message);
        return NextResponse.json(
            { success: false, error: "Failed to fetch learning paths" },
            { status: 500 }
        );
    }
}
