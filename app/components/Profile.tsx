"use client";

import React, { useState, useEffect } from "react";

interface ProfileData {
    user: { _id: string; name: string; email: string; createdAt: string };
    stats: {
        totalPaths: number;
        totalSteps: number;
        completedSteps: number;
        completionRate: number;
        accountAge: number;
        recentPaths: Array<{ goal: string; createdAt: string; generatedBy: string }>;
    };
}

export default function Profile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [message, setMessage] = useState({ type: "", text: "" });

    const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const token = getToken();
            if (!token) {
                setMessage({ type: "error", text: "Please log in to view your profile" });
                setLoading(false);
                return;
            }
            const response = await fetch("/api/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load profile");
            setProfile(data);
            setFormData({ name: data.user.name, email: data.user.email });
        } catch (err) {
            setMessage({ type: "error", text: (err as Error).message || "Failed to load profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = getToken();
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update profile");
            setMessage({ type: "success", text: data.message });
            setEditing(false);
            fetchProfile();
        } catch (err) {
            setMessage({ type: "error", text: (err as Error).message || "Failed to update profile" });
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "0.75rem", backgroundColor: "rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "6px", color: "#fff", fontSize: "1rem",
    };

    if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "#fff" }}>⏳ Loading profile...</div>;

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", color: "#fff" }}>
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem", background: "linear-gradient(to right, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    My Profile
                </h1>
                <p style={{ color: "#9ca3af" }}>Manage your account and view your stats</p>
            </div>

            {message.text && (
                <div style={{ padding: "1rem", marginBottom: "1.5rem", borderRadius: "8px", backgroundColor: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${message.type === "success" ? "#22c55e" : "#ef4444"}`, color: message.type === "success" ? "#22c55e" : "#ef4444" }}>
                    {message.text}
                </div>
            )}

            {profile && (
                <>
                    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr" }}>
                        {/* Profile Info */}
                        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>👤 Profile Information</h2>
                                {!editing && (
                                    <button onClick={() => setEditing(true)} style={{ padding: "0.5rem 1rem", backgroundColor: "#3b82f6", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontSize: "0.9rem" }}>
                                        ✏️ Edit
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleUpdate}>
                                    {[{ label: "Name", type: "text", key: "name" }, { label: "Email", type: "email", key: "email" }].map(({ label, type, key }) => (
                                        <div key={key} style={{ marginBottom: "1rem" }}>
                                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#9ca3af" }}>{label}</label>
                                            <input type={type} value={formData[key as keyof typeof formData]}
                                                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                                style={inputStyle} required />
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                                        <button type="submit" style={{ flex: 1, padding: "0.75rem", backgroundColor: "#22c55e", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>💾 Save</button>
                                        <button type="button" onClick={() => { setEditing(false); setFormData({ name: profile.user.name, email: profile.user.email }); setMessage({ type: "", text: "" }); }}
                                            style={{ flex: 1, padding: "0.75rem", backgroundColor: "rgba(255, 255, 255, 0.1)", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer" }}>❌ Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    {[{ label: "Name", value: profile.user.name }, { label: "Email", value: profile.user.email }, { label: "Member Since", value: formatDate(profile.user.createdAt) }].map(({ label, value }) => (
                                        <div key={label} style={{ marginBottom: "1rem" }}>
                                            <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "0.25rem" }}>{label}</p>
                                            <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>📊 Your Statistics</h2>
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {[
                                    { value: profile.stats.totalPaths, label: "Learning Paths Created", color: "59, 130, 246" },
                                    { value: `${profile.stats.completionRate}%`, label: "Completion Rate", color: "168, 85, 247" },
                                    { value: `${profile.stats.completedSteps}/${profile.stats.totalSteps}`, label: "Steps Completed", color: "34, 197, 94" },
                                    { value: profile.stats.accountAge, label: "Days Active", color: "251, 146, 60" },
                                ].map(({ value, label, color }) => (
                                    <div key={label} style={{ padding: "1rem", backgroundColor: `rgba(${color}, 0.1)`, borderRadius: "8px", border: `1px solid rgba(${color}, 0.3)` }}>
                                        <p style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{value}</p>
                                        <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {profile.stats.recentPaths.length > 0 && (
                        <div style={{ marginTop: "2rem", backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>🎯 Recent Learning Paths</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {profile.stats.recentPaths.map((path, index) => (
                                    <div key={index} style={{ padding: "1rem", backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <p style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{path.goal}</p>
                                            <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{formatDate(path.createdAt)} • Generated by: {path.generatedBy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
