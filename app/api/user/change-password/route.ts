import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth";

// POST /api/user/change-password
export async function POST(req: NextRequest) {
    try {
        const authUser = await authenticateRequest(req, true);

        await connectDB();

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: "New password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Fetch user with password field
        const user = await User.findById(authUser!._id);
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        user.password = newPassword;
        await user.save();

        return NextResponse.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes("token") || err.message.includes("Access") || err.message.includes("expired")) {
            return NextResponse.json({ success: false, error: err.message }, { status: 401 });
        }
        console.error("Change password error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to change password" }, { status: 500 });
    }
}
