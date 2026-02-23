import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

// POST /api/auth/register
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { username, email, password, name } = await req.json();

        if (!username || !email || !password || !name) {
            return NextResponse.json(
                { success: false, error: "All fields are required (username, email, password, name)" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 30) {
            return NextResponse.json(
                { success: false, error: "Username must be between 3 and 30 characters" },
                { status: 400 }
            );
        }

        // Check for existing user
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }],
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? "email" : "username";
            return NextResponse.json(
                { success: false, error: `This ${field} is already registered` },
                { status: 409 }
            );
        }

        const user = new User({ username, email: email.toLowerCase(), password, name });
        await user.save();
        await user.updateLastLogin();

        const token = signToken({ userId: user._id.toString(), username: user.username });

        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        }, { status: 201 });
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err.code === 11000) {
            return NextResponse.json({ success: false, error: "Username or email already exists" }, { status: 409 });
        }
        console.error("Register error:", err.message);
        return NextResponse.json({ success: false, error: "Server error during registration" }, { status: 500 });
    }
}
