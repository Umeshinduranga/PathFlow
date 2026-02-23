import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { AuthenticatedUser, AuthPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function extractToken(req: NextRequest): string | null {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.replace("Bearer ", "");
}

/**
 * Authenticate a request and return the authenticated user.
 * Returns null if authentication fails (for optional auth).
 * Throws an error with a message for required auth.
 */
export async function authenticateRequest(
    req: NextRequest,
    required = true
): Promise<AuthenticatedUser | null> {
    try {
        const token = extractToken(req);

        if (!token) {
            if (required) {
                throw new Error("Access token is required");
            }
            return null;
        }

        let decoded: AuthPayload;
        try {
            decoded = verifyToken(token);
        } catch (jwtError: unknown) {
            const error = jwtError as { name?: string };
            if (error.name === "TokenExpiredError") {
                throw new Error("Token expired. Please log in again.");
            }
            throw new Error("Invalid or malformed token. Please log in again.");
        }

        await connectDB();

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            if (required) throw new Error("User not found");
            return null;
        }

        if (user.isActive === false) {
            throw new Error("Account is deactivated");
        }

        return {
            _id: user._id,
            userId: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    } catch (error) {
        if (required) throw error;
        return null;
    }
}
