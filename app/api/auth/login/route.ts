import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

// POST /api/auth/login
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { usernameOrEmail, password } = await req.json();

        if (!usernameOrEmail || !password) {
            return NextResponse.json(
                { success: false, error: "Username/email and password are required" },
                { status: 400 }
            );
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { email: usernameOrEmail.toLowerCase() },
                { username: usernameOrEmail },
            ],
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid username/email or password" },
                { status: 401 }
            );
        }

        if (user.isActive === false) {
            return NextResponse.json(
                { success: false, error: "Account has been deactivated" },
                { status: 403 }
            );
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: "Invalid username/email or password" },
                { status: 401 }
            );
        }

        await user.updateLastLogin();

        const token = signToken({ userId: user._id.toString(), username: user.username });

        return NextResponse.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, error: "Server error during login" }, { status: 500 });
    }
}
