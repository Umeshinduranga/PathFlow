import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// POST /api/auth/logout
export async function POST(req: NextRequest) {
    try {
        // Optionally validate the token was real (fire-and-forget style)
        await authenticateRequest(req, false);

        // Stateless JWT - client should remove the token.
        // Server can't invalidate JWT without a blacklist, but we can log and confirm.
        return NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch {
        // Still return success - if token was bad, user was already logged out effectively
        return NextResponse.json({ success: true, message: "Logged out" });
    }
}
