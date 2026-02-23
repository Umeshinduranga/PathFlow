import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// GET /api/user/profile
export async function GET(req: NextRequest) {
    try {
        const authUser = await authenticateRequest(req, true);

        await connectDB();

        const user = await User.findById(authUser!._id).select("-password");
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Gather stats
        const userPaths = await LearningPath.find({ userId: user._id });
        const totalPaths = userPaths.length;
        const totalSteps = userPaths.reduce((sum, p) => sum + p.path.length, 0);
        const completedSteps = userPaths.reduce(
            (sum, p) => sum + (p.completedSteps?.length ?? 0),
            0
        );
        const completionRate =
            totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        const accountAge = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        const recentPaths = userPaths
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((p) => ({ goal: p.goal, createdAt: p.createdAt, generatedBy: p.generatedBy }));

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            stats: { totalPaths, totalSteps, completedSteps, completionRate, accountAge, recentPaths },
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access") || err.message.includes("expired")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("Profile GET error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
    }
}

// PATCH /api/user/profile
export async function PATCH(req: NextRequest) {
    try {
        const authUser = await authenticateRequest(req, true);

        await connectDB();

        const { name, email } = await req.json();

        if (!name && !email) {
            return NextResponse.json(
                { success: false, error: "At least one field (name or email) is required" },
                { status: 400 }
            );
        }

        const updateData: { name?: string; email?: string } = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.toLowerCase().trim();

        // Check email uniqueness
        if (email) {
            const existing = await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: authUser!._id },
            });
            if (existing) {
                return NextResponse.json(
                    { success: false, error: "Email already in use" },
                    { status: 409 }
                );
            }
        }

        const updatedUser = await User.findByIdAndUpdate(authUser!._id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access") || err.message.includes("expired")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("Profile PATCH error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }
}
