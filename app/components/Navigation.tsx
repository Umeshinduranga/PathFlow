"use client";

import React from "react";
import { useAppContext } from "@/app/context/AppContext";

type Route = "/" | "/generate" | "/dashboard" | "/my-learning" | "/profile" | "/settings";

interface NavigationProps {
    currentRoute: Route;
    navigate: (route: Route) => void;
}

const navLinks: { label: string; route: Route; emoji: string }[] = [
    { label: "Home", route: "/", emoji: "" },
    { label: "Generate Path", route: "/generate", emoji: "" },
    { label: "Dashboard", route: "/dashboard", emoji: "📊" },
    { label: "My Learning", route: "/my-learning", emoji: "📚" },
    { label: "Profile", route: "/profile", emoji: "👤" },
    { label: "Settings", route: "/settings", emoji: "⚙️" },
];

const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color: "white",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    transition: "background-color 0.3s",
    fontFamily: "Poppins",
    fontWeight: "bold",
    backgroundColor: isActive ? "rgba(60,26,107, 0.6)" : "rgba(60,26,107, 0.3)",
    border: "1px solid rgba(60,26,107, 0.4)",
    marginRight: "0.5rem",
    cursor: "pointer",
    fontSize: "0.9rem",
});

export default function Navigation({ currentRoute, navigate }: NavigationProps) {
    const { currentUser, logout } = useAppContext();

    return (
        <nav
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                padding: "1rem 2rem",
                marginBottom: "2rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(60,26,107, 0.2)",
                border: "1px solid rgba(60,26,107, 0.3)",
            }}
        >
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <button
                    onClick={() => navigate("/")}
                    style={{
                        ...linkStyle(false),
                        fontSize: "1.5rem",
                        backgroundColor: "transparent",
                        border: "none",
                        textShadow: "0 0 10px rgba(60,26,107, 0.5)",
                        margin: 0,
                    }}
                >
                    🎯 PathFlow
                </button>

                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
                    {navLinks.map(({ label, route, emoji }) => (
                        <button
                            key={route}
                            onClick={() => navigate(route)}
                            style={linkStyle(currentRoute === route)}
                        >
                            {emoji} {label}
                        </button>
                    ))}

                    {/* User info + Logout */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "rgba(60,26,107, 0.2)",
                            borderRadius: "12px",
                            border: "1px solid rgba(60,26,107, 0.3)",
                            marginLeft: "0.5rem",
                        }}
                    >
                        <span style={{ color: "white", fontFamily: "Poppins", fontSize: "0.9rem" }}>
                            👋 Hi, {currentUser?.name}!
                        </span>
                        <button
                            onClick={logout}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#ff6b6b",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontFamily: "Poppins",
                                fontWeight: "bold",
                            }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
