import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, IUserMethods } from "@/types";

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [30, "Username cannot exceed 30 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        profilePicture: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        learningPaths: [
            {
                type: Schema.Types.ObjectId,
                ref: "LearningPath",
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_doc, ret) {
                delete (ret as Record<string, unknown>).password;
                return ret;
            },
        },
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = async function (): Promise<IUser> {
    this.lastLogin = new Date();
    return this.save();
};

const User: UserModel =
    (mongoose.models.User as UserModel) ||
    mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
