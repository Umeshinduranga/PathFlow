import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// GET /api/dashboard/my-paths
export async function GET(req: NextRequest) {
    try {
        const user = await authenticateRequest(req, true);

        await connectDB();

        const userPaths = await LearningPath.find({ userId: user!._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("goal skills createdAt");

        return NextResponse.json({ success: true, userPaths });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: "Failed to fetch paths" }, { status: 500 });
    }
}
