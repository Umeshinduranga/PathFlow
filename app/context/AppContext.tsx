"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppContextValue, ILearningPath, UserPublic, RegisterRequest, DemoUser } from "@/types";

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = (): AppContextValue => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within AppContextProvider");
    }
    return context;
};

// ─── Auth Service (inline - replaces authService.js) ─────────────────────────

const API_BASE = "/api/auth";

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
}

function setToken(token: string): void {
    localStorage.setItem("authToken", token);
}

function removeToken(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
}

function getStoredUser(): UserPublic | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
}

function setStoredUser(user: UserPublic): void {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

export function isAuthenticated(): boolean {
    return !!(getToken() && getStoredUser());
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}

// ─── Context Provider ─────────────────────────────────────────────────────────

export function AppContextProvider({ children }: { children: React.ReactNode }) {
    const [learningPaths, setLearningPaths] = useState<ILearningPath[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAuth, setIsAuth] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserPublic | null>(null);

    const demoUsers: DemoUser[] = [
        { username: "demo", password: "demo123", name: "Demo User", email: "demo@pathflow.com" },
        { username: "test", password: "test123", name: "Test User", email: "test@pathflow.com" },
        { username: "pathflow", password: "pathflow123", name: "PathFlow User", email: "pathflow@example.com" },
    ];

    // Initialize auth state from localStorage
    useEffect(() => {
        if (isAuthenticated()) {
            setIsAuth(true);
            setCurrentUser(getStoredUser());
        }
    }, []);

    const login = async (
        usernameOrEmail: string,
        password: string
    ): Promise<{ success: boolean; user?: UserPublic; error?: string }> => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernameOrEmail, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error || "Login failed" };
            }
            setToken(data.token);
            setStoredUser(data.user);
            setIsAuth(true);
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, error: (err as Error).message || "Login failed" };
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        userData: RegisterRequest
    ): Promise<{ success: boolean; user?: UserPublic; error?: string }> => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error || "Registration failed" };
            }
            setToken(data.token);
            setStoredUser(data.user);
            setIsAuth(true);
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, error: (err as Error).message || "Registration failed" };
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            const token = getToken();
            if (token) {
                await fetch(`${API_BASE}/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }).catch(() => { });
            }
        } finally {
            removeToken();
            setIsAuth(false);
            setCurrentUser(null);
        }
    };

    const value: AppContextValue = {
        learningPaths,
        setLearningPaths,
        loading,
        setLoading,
        error,
        setError,
        isAuthenticated: isAuth,
        currentUser,
        login,
        register,
        logout,
        demoUsers,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
