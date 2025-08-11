import { useState } from "react";

function App() {
  // State variables to store what the user types
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [steps, setSteps] = useState([]);

  // Function to run when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page from refreshing

    try {
      // Send POST request to backend
      const res = await fetch("http://localhost:5000/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, goal }) // send data
      });

      const data = await res.json(); // get the JSON reply
      setSteps(data.steps || []); // save steps into state
    } catch (error) {
      console.error("Error fetching learning path:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Learning Path Generator</h1>

      {/* Form to collect user input */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your skills (e.g., Python)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Your goal (e.g., Data Scientist)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px" }}
        />
        <button type="submit">Generate Path</button>
      </form>

      {/* Show the results */}
      {steps.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Your Learning Path:</h2>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
