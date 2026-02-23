"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import Navigation from "./Navigation";
import SignIn from "./SignIn";
import Home from "./Home";
import GeneratePathForm from "./GeneratePathForm";
import Dashboard from "./Dashboard";
import MyLearning from "./MyLearning";
import Profile from "./Profile";
import Settings from "./Settings";

type Route = "/" | "/generate" | "/dashboard" | "/my-learning" | "/profile" | "/settings";

// Simple client-side router since Next.js App Router pages work differently
export function ClientShell() {
    const { isAuthenticated } = useAppContext();
    const [currentRoute, setCurrentRoute] = useState<Route>("/");

    const navigate = (route: Route) => setCurrentRoute(route);

    if (!isAuthenticated) {
        return <SignIn />;
    }

    const renderPage = () => {
        switch (currentRoute) {
            case "/":
                return <Home navigate={navigate} />;
            case "/generate":
                return <GeneratePathForm />;
            case "/dashboard":
                return <Dashboard />;
            case "/my-learning":
                return <MyLearning />;
            case "/profile":
                return <Profile />;
            case "/settings":
                return <Settings navigate={navigate} />;
            default:
                return <Home navigate={navigate} />;
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Ccircle cx='100' cy='100' r='0.8' fill='%23fff' opacity='0.6' /%3E%3Ccircle cx='400' cy='150' r='0.8' fill='%23fff' opacity='0.9' /%3E%3Ccircle cx='250' cy='400' r='0.8' fill='%23fff' opacity='0.9' /%3E%3C/svg%3E\"), radial-gradient(ellipse at center, #0a0a1a 0%, #0f0a1f 50%, #000000 100%)",
                backgroundRepeat: "repeat, no-repeat",
                backgroundSize: "500px 500px, cover",
            }}
        >
            <Navigation currentRoute={currentRoute} navigate={navigate} />
            <main>{renderPage()}</main>
            <footer
                style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#a0a0a0",
                    borderTop: "1px solid rgba(60,26,107, 0.3)",
                    marginTop: "4rem",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                }}
            >
                <p style={{ margin: 0 }}>Using Next.js &amp; Gemini AI</p>
            </footer>
        </div>
    );
}
