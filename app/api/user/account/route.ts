import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import LearningPath from "@/models/LearningPath";
import { authenticateRequest } from "@/lib/auth";

// DELETE /api/user/account
export async function DELETE(req: NextRequest) {
    try {
        const authUser = await authenticateRequest(req, true);

        await connectDB();

        const { password } = await req.json();

        if (!password) {
            return NextResponse.json(
                { success: false, error: "Password is required to delete account" },
                { status: 400 }
            );
        }

        const user = await User.findById(authUser!._id);
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Incorrect password" },
                { status: 401 }
            );
        }

        // Delete all associated learning paths
        await LearningPath.deleteMany({ userId: authUser!._id });

        // Delete user account
        await User.findByIdAndDelete(authUser!._id);

        return NextResponse.json({
            success: true,
            message: "Account and all associated data deleted successfully",
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access") || err.message.includes("expired")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("Delete account error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 });
    }
}
