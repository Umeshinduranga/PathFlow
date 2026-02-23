import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// PATCH /api/paths/[pathId]/steps/[stepIndex]  – toggle step completion
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ pathId: string; stepIndex: string }> }
) {
    try {
        const { pathId, stepIndex: stepIndexStr } = await params;
        const stepIndex = parseInt(stepIndexStr, 10);

        if (isNaN(stepIndex) || stepIndex < 0) {
            return NextResponse.json({ success: false, error: "Invalid step index" }, { status: 400 });
        }

        const authUser = await authenticateRequest(req, true);

        await connectDB();

        const path = await LearningPath.findOne({ _id: pathId, userId: authUser!._id });

        if (!path) {
            return NextResponse.json(
                { success: false, error: "Learning path not found or not authorized" },
                { status: 404 }
            );
        }

        if (stepIndex >= path.path.length) {
            return NextResponse.json({ success: false, error: "Step index out of range" }, { status: 400 });
        }

        // Toggle: add or remove the step index from completedSteps
        const completedSteps: number[] = path.completedSteps ?? [];
        const alreadyCompleted = completedSteps.includes(stepIndex);

        const updatedCompletedSteps = alreadyCompleted
            ? completedSteps.filter((s) => s !== stepIndex)
            : [...completedSteps, stepIndex];

        path.completedSteps = updatedCompletedSteps;
        await path.save();

        const totalSteps = path.path.length;
        const completedCount = updatedCompletedSteps.length;
        const progressPercentage =
            totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

        return NextResponse.json({
            success: true,
            path: {
                _id: path._id,
                completedSteps: updatedCompletedSteps,
                completedCount,
                progressPercentage,
            },
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access") || err.message.includes("expired")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("Toggle step error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to update step" }, { status: 500 });
    }
}
