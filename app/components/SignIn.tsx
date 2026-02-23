"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { RegisterRequest, DemoUser } from "@/types";

export default function SignIn() {
    const { login, register, demoUsers } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
        username: "",
        email: "",
        name: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let result: { success: boolean; error?: string };

            if (isLogin) {
                result = await login(formData.usernameOrEmail, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords don't match");
                    setLoading(false);
                    return;
                }
                const userData: RegisterRequest = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                };
                result = await register(userData);
            }

            if (!result.success) {
                setError(result.error || "An error occurred");
            }
        } catch (err) {
            setError((err as Error).message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoUser: DemoUser) => {
        setError("");
        setLoading(true);
        try {
            const result = await login(demoUser.username, demoUser.password);
            if (!result.success) setError(result.error || "Demo login failed");
        } catch (err) {
            setError((err as Error).message || "Demo login failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setFormData({
            usernameOrEmail: "", password: "", username: "", email: "", name: "", confirmPassword: "",
        });
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1px solid rgba(60,26,107, 0.5)",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        fontSize: "1rem",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
        outline: "none",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        color: "white",
        marginBottom: "0.5rem",
        fontWeight: "bold",
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(ellipse at center, #0a0a1a 0%, #0f0a1f 50%, #000000 100%)",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: "3rem",
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(60,26,107, 0.3)",
                    border: "1px solid rgba(60,26,107, 0.4)",
                }}
            >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1
                        style={{
                            color: "white",
                            fontSize: "2.5rem",
                            margin: "0 0 0.5rem 0",
                            textShadow: "0 0 20px rgba(60,26,107, 0.8)",
                            fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        🎯 PathFlow
                    </h1>
                    <p style={{ color: "#a0a0a0", margin: 0, fontSize: "1.1rem" }}>
                        AI-Powered Learning Path Generator
                    </p>
                </div>

                {/* Mode Toggle */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            backgroundColor: "rgba(60,26,107, 0.2)",
                            borderRadius: "25px",
                            padding: "4px",
                            border: "1px solid rgba(60,26,107, 0.3)",
                        }}
                    >
                        {["Sign In", "Sign Up"].map((label, i) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => (i === 0 ? setIsLogin(true) : setIsLogin(false))}
                                style={{
                                    padding: "8px 20px",
                                    backgroundColor: (i === 0 ? isLogin : !isLogin) ? "#3c1a6b" : "transparent",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
                    {isLogin ? (
                        <>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={labelStyle}>Username or Email</label>
                                <input
                                    type="text"
                                    name="usernameOrEmail"
                                    value={formData.usernameOrEmail}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username or email"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={labelStyle}>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {[
                                { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name" },
                                { label: "Username", name: "username", type: "text", placeholder: "Choose a username" },
                                { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
                                { label: "Password", name: "password", type: "password", placeholder: "Create a password" },
                                { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
                            ].map(({ label, name, type, placeholder }) => (
                                <div key={name} style={{ marginBottom: "1.5rem" }}>
                                    <label style={labelStyle}>{label}</label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData[name as keyof typeof formData]}
                                        onChange={handleInputChange}
                                        placeholder={placeholder}
                                        required
                                        disabled={loading}
                                        style={inputStyle}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {error && (
                        <div
                            style={{
                                backgroundColor: "rgba(220, 53, 69, 0.2)",
                                color: "#f5c6cb",
                                padding: "1rem",
                                borderRadius: "8px",
                                marginBottom: "1.5rem",
                                border: "1px solid rgba(220, 53, 69, 0.3)",
                                textAlign: "center",
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: loading ? "#6c757d" : "#3c1a6b",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 15px rgba(60,26,107, 0.4)",
                        }}
                    >
                        {loading ? "🔄 Please wait..." : isLogin ? "🚀 Sign In" : "✨ Create Account"}
                    </button>
                </form>

                {/* Demo Credentials */}
                {isLogin && (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                            <button
                                type="button"
                                onClick={() => setShowCredentials(!showCredentials)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#a07de0",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {showCredentials ? "Hide" : "Show"} Demo Credentials
                            </button>
                        </div>

                        {showCredentials && (
                            <div
                                style={{
                                    backgroundColor: "rgba(60,26,107, 0.2)",
                                    padding: "1.5rem",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(60,26,107, 0.3)",
                                }}
                            >
                                <h4 style={{ color: "white", margin: "0 0 1rem 0", textAlign: "center" }}>
                                    🔑 Demo Accounts
                                </h4>
                                {demoUsers.map((user) => (
                                    <div
                                        key={user.username}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.5rem",
                                            marginBottom: "0.5rem",
                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                            borderRadius: "6px",
                                            color: "white",
                                        }}
                                    >
                                        <div>
                                            <strong>{user.username}</strong> / {user.password}
                                            <br />
                                            <span style={{ fontSize: "0.8rem", color: "#a0a0a0" }}>
                                                {user.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDemoLogin(user)}
                                            disabled={loading}
                                            style={{
                                                padding: "4px 10px",
                                                backgroundColor: loading ? "#6c757d" : "#3c1a6b",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: loading ? "not-allowed" : "pointer",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            Use
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div style={{ textAlign: "center", marginTop: "2rem", color: "#666", fontSize: "0.9rem" }}>
                    <p style={{ margin: 0 }}>🤖 Powered by AI • 🔐 Secure Database Storage</p>
                </div>
            </div>
        </div>
    );
}
