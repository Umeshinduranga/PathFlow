import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// DELETE /api/paths/[pathId]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ pathId: string }> }
) {
    try {
        const { pathId } = await params;
        const authUser = await authenticateRequest(req, true);

        await connectDB();

        const path = await LearningPath.findOne({ _id: pathId, userId: authUser!._id });

        if (!path) {
            return NextResponse.json(
                { success: false, error: "Learning path not found or not authorized" },
                { status: 404 }
            );
        }

        await LearningPath.findByIdAndDelete(pathId);

        return NextResponse.json({ success: true, message: "Learning path deleted successfully" });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access") || err.message.includes("expired")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("Delete path error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to delete learning path" }, { status: 500 });
    }
}
