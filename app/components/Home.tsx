"use client";

import React from "react";
import { useAppContext } from "@/app/context/AppContext";

type Route = "/" | "/generate" | "/dashboard" | "/my-learning" | "/profile" | "/settings";

interface HomeProps {
    navigate: (route: Route) => void;
}

export default function Home({ navigate }: HomeProps) {
    const { currentUser } = useAppContext();

    return (
        <div
            style={{
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial, sans-serif",
                padding: "2rem",
                color: "white",
                textAlign: "center",
            }}
        >
            <div
                style={{
                    maxWidth: "800px",
                    padding: "3rem",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "15px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 50px rgba(60,26,107, 0.2)",
                }}
            >
                <h1
                    style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(60,26,107, 0.5)",
                    }}
                >
                    🎯 Welcome to PathFlow, {currentUser?.name}!
                </h1>
                <p
                    style={{
                        fontSize: "1.3rem",
                        marginBottom: "2rem",
                        opacity: 0.9,
                        lineHeight: "1.6",
                    }}
                >
                    Transform your skills into your dream career with personalized, AI-generated learning
                    roadmaps tailored just for you.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: "2rem",
                    }}
                >
                    {[
                        { emoji: "🤖", label: "AI-Powered" },
                        { emoji: "🎯", label: "Personalized" },
                        { emoji: "⚡", label: "Fast & Free" },
                    ].map(({ emoji, label }) => (
                        <div key={label} style={{ textAlign: "center", minWidth: "150px" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{emoji}</div>
                            <p>{label}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate("/generate")}
                    style={{
                        padding: "1rem 2rem",
                        backgroundColor: "#3c1a6b",
                        color: "white",
                        border: "none",
                        borderRadius: "50px",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(60,26,107, 0.3), 0 0 30px rgba(60,26,107, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 6px 20px rgba(60,26,107, 0.5), 0 0 40px rgba(60,26,107, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 4px 15px rgba(60,26,107, 0.3), 0 0 30px rgba(60,26,107, 0.2)";
                    }}
                >
                    🚀 Start Your Journey
                </button>
            </div>
        </div>
    );
}
