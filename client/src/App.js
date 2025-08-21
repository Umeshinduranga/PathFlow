import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Landing Page
function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "30px", color: "#007bff" }}>
        🎯 Welcome to Learning Path Generator
      </h1>
      <Link to="/generate">
        <button
          style={{
            padding: "14px 28px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          🚀 Generate Path
        </button>
      </Link>
    </div>
  );
}

// Generate Path Form Page
function GeneratePathForm() {
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setSteps([]);

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      console.log("Using API:", API_URL);

      const res = await fetch(`${API_URL}/generate-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, goal }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate learning path. Try again.");
      }

      const data = await res.json();
      setSteps(data.steps || []);
      if (data.steps && data.steps.length > 0) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "700px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
        color: "#333",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#007bff", marginBottom: "20px" }}>
        🎯 Learning Path Generator
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Your skills (e.g., Python, HTML)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
          required
        />
        <input
          type="text"
          placeholder="Your goal (e.g., Data Scientist)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Generating..." : "🚀 Generate Path"}
        </button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {success && (
        <p style={{ color: "green", textAlign: "center" }}>
          ✅ Learning path generated successfully!
        </p>
      )}

      {!loading && steps.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <h2 style={{ marginBottom: "15px" }}>📚 Your Learning Path:</h2>
          <ul style={{ lineHeight: "1.8" }}>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {!loading && steps.length === 0 && !error && !success && (
        <p style={{ textAlign: "center", color: "#777" }}>
          Start by entering your skills & goal above 👆
        </p>
      )}
    </div>
  );
}

// Main App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<GeneratePathForm />} />
      </Routes>
    </Router>
  );
}

export default App;
