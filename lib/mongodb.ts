import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.warn("⚠️  MONGO_URI not provided - running without database");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// In Next.js, we use a global cache to preserve the connection across hot-reloads in dev
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

async function connectDB(): Promise<typeof mongoose | null> {
    if (!MONGO_URI) {
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
            console.log("✅ MongoDB connected successfully");
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("⚠️ MongoDB connection failed:", (e as Error).message);
        throw e;
    }

    return cached.conn;
}

export default connectDB;
