import { useState } from "react";

function App() {
  // State variables
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>🎯 Learning Path Generator</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Your skills (e.g., Python, HTML)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          style={{ display: "block", width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}
          required
        />
        <input
          type="text"
          placeholder="Your goal (e.g., Data Scientist)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{ display: "block", width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Path"}
        </button>
      </form>

      {/* Error */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Results */}
      {!loading && steps.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Your Learning Path:</h2>
          <ul style={{ lineHeight: "1.8" }}>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {/* No steps case */}
      {!loading && steps.length === 0 && !error && (
        <p style={{ textAlign: "center", color: "#777" }}>No learning path yet. Enter your skills & goal above.</p>
      )}
    </div>
  );
}

export default App;
