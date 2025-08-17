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
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      console.log("Using API:", API_URL);
      const res = await fetch(`${API_URL}/generate-path`, {
      
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
    <div className="app-container">
      <h1>📚 Personal Learning Path Generator</h1>
  
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your current skills (e.g., Python, HTML)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter your career goal (e.g., Data Scientist)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button type="submit">Generate Path</button>
        </form>
      </div>
  
      {steps.length > 0 && (
        <div className="results-card">
          <h2>🚀 Your Learning Path</h2>
          <ol>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

}

export default App;
