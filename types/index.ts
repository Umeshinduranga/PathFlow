import { Types } from "mongoose";

// ─── User Types ──────────────────────────────────────────────────────────────

export interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    name: string;
    profilePicture: string | null;
    isActive: boolean;
    role: "user" | "admin";
    lastLogin: Date | null;
    learningPaths: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
    updateLastLogin(): Promise<IUser>;
}

export interface UserPublic {
    id: string;
    username: string;
    email: string;
    name: string;
    role: "user" | "admin";
    lastLogin?: Date | null;
    createdAt?: Date;
}

export interface AuthPayload {
    userId: string;
    username: string;
}

export interface AuthenticatedUser {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    username: string;
    email: string;
    name: string;
    role: "user" | "admin";
}

// ─── Learning Path Types ──────────────────────────────────────────────────────

export type GeneratedBy =
    | "ai"
    | "manual"
    | "fallback"
    | "gemini-direct"
    | "gemini-sdk"
    | "openai";

export interface ILearningPath {
    _id: Types.ObjectId;
    skills: string[];
    goal: string;
    path: string[];
    generatedBy: GeneratedBy;
    userId: Types.ObjectId | null;
    completedSteps: number[];
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface LearningPathWithProgress extends Pick<ILearningPath, "_id" | "goal" | "skills" | "path" | "generatedBy" | "createdAt" | "updatedAt"> {
    completedSteps: number[];
    totalSteps: number;
    completedCount: number;
    progressPercentage: number;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface GeneratePathRequest {
    skills: string;
    goal: string;
}

export interface GeneratePathResponse {
    success: boolean;
    steps: string[];
    metadata: {
        generatedBy: GeneratedBy | "fallback";
        aiProvider: string;
        responseTime: number;
        timestamp: number;
        message?: string;
    };
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: UserPublic;
    token: string;
}

export interface ApiError {
    success: false;
    error: string;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface PopularSkill {
    skill: string;
    count: number;
}

export interface PopularGoal {
    goal: string;
    count: number;
}

export interface DashboardStats {
    totalPaths: number;
    recentPaths: Array<{
        goal: string;
        skills: string[];
        createdAt: string;
        generatedBy: string;
    }>;
    popularSkills: PopularSkill[];
    popularGoals: PopularGoal[];
    message?: string;
}

// ─── Profile Types ────────────────────────────────────────────────────────────

export interface ProfileStats {
    totalPaths: number;
    totalSteps: number;
    completedSteps: number;
    completionRate: number;
    accountAge: number;
    recentPaths: Array<{
        goal: string;
        createdAt: Date;
        generatedBy: string;
    }>;
}

export interface ProfileResponse {
    user: {
        _id: string;
        name: string;
        email: string;
        createdAt: Date;
    };
    stats: ProfileStats;
}

// ─── Context Types ────────────────────────────────────────────────────────────

export interface AppContextValue {
    learningPaths: ILearningPath[];
    setLearningPaths: React.Dispatch<React.SetStateAction<ILearningPath[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
    isAuthenticated: boolean;
    currentUser: UserPublic | null;
    login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; user?: UserPublic; error?: string }>;
    register: (userData: RegisterRequest) => Promise<{ success: boolean; user?: UserPublic; error?: string }>;
    logout: () => Promise<void>;
    demoUsers: DemoUser[];
}

export interface DemoUser {
    username: string;
    password: string;
    name: string;
    email: string;
}
