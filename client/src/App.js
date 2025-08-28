import React, { useState, createContext, useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// Global Context for state management
const AppContext = createContext();

// Custom hook to use the context
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};

// Context Provider Component
const AppContextProvider = ({ children }) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || "");

  const value = {
    learningPaths,
    setLearningPaths,
    loading,
    setLoading,
    error,
    setError,
    apiUrl
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif"
        }}>
          <h2 style={{ color: "#dc3545" }}>🚨 Something went wrong!</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3c1a6b",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    color: "#666"
  }}>
    <div style={{
      width: "40px",
      height: "40px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #3c1a6b",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "15px"
    }} />
    <p>{message}</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Navigation Component
const Navigation = () => (
  <nav style={{
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "1rem 2rem",
    marginBottom: "2rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(60,26,107, 0.2)",
    border: "1px solid rgba(60,26,107, 0.3)"
  }}>
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      <Link to="/" style={{
        color: "white",
        textDecoration: "none",
        fontSize: "1.5rem",
        fontWeight: "bold",
        fontFamily: 'Poppins',
        textShadow: "0 0 10px rgba(60,26,107, 0.5)"
      }}>
        🎯 PathFlow
      </Link>
      <div>
        <Link to="/" style={{
          color: "white",
          textDecoration: "none",
          marginRight: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          transition: "background-color 0.3s",
          fontFamily: 'Poppins',
          fontWeight: "bold",
          backgroundColor: "rgba(60,26,107, 0.3)",
          borderRadius: "12px",
          border: "1px solid rgba(60,26,107, 0.4)"
        }}>
          Home
        </Link>
        <Link to="/generate" style={{
          color: "white",
          textDecoration: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          transition: "background-color 0.3s",
          fontFamily: 'Poppins',
          backgroundColor: "rgba(60,26,107, 0.3)",
          borderRadius: "12px",
          fontWeight: "bold",
          border: "1px solid rgba(60,26,107, 0.4)"
        }}>
          Generate Path
        </Link>
      </div>
    </div>
  </nav>
);

// Enhanced Landing Page
function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "2rem",
      color: "white",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "800px",
        padding: "3rem",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: "15px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 50px rgba(60,26,107, 0.2)"
      }}>
        <h1 style={{ 
          fontSize: "3rem", 
          marginBottom: "1rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(60,26,107, 0.5)"
        }}>
          🎯 AI-Powered Learning Path Generator
        </h1>
        <p style={{ 
          fontSize: "1.3rem", 
          marginBottom: "2rem", 
          opacity: 0.9,
          lineHeight: "1.6"
        }}>
          Transform your skills into your dream career with personalized, 
          AI-generated learning roadmaps tailored just for you.
        </p>
        
        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "2rem"
        }}>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🤖</div>
            <p>AI-Powered</p>
          </div>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎯</div>
            <p>Personalized</p>
          </div>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
            <p>Fast & Free</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/generate')}
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
            transform: "translateY(0)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(60,26,107, 0.5), 0 0 40px rgba(60,26,107, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(60,26,107, 0.3), 0 0 30px rgba(60,26,107, 0.2)";
          }}
        >
          🚀 Start Your Journey
        </button>
      </div>
    </div>
  );
}

// Learning Path Display Component
const LearningPathDisplay = ({ steps, skills, goal, metadata }) => (
  <div style={{
    marginTop: "2rem",
    background: "radial-gradient(ellipse at center, #0a0a1a 0%, #0f0a1f 35%, #000000 100%)",
    padding: "2rem",
    borderRadius: "15px",
    border: "1px solid rgba(60,26,107, 0.3)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5), 0 0 30px rgba(60,26,107, 0.2)"
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
      flexWrap: "wrap"
    }}>
      <h2 style={{ 
        margin: 0, 
        color: "white",
        fontSize: "1.8rem",
        textShadow: "0 0 10px rgba(60,26,107, 0.5)"
      }}>
        📚 Your Learning Path
      </h2>
      {metadata && (
        <div style={{
          fontSize: "0.9rem",
          color: "#a0a0a0",
          textAlign: "right"
        }}>
          <div>Generated by: {metadata.generatedBy === 'ai' ? '🤖 AI' : '🔧 Fallback'}</div>
          <div>Response time: {metadata.responseTime}ms</div>
        </div>
      )}
    </div>
    
    <div style={{
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: "1.5rem",
      borderRadius: "10px",
      marginBottom: "1.5rem",
      border: "1px solid rgba(60,26,107, 0.2)"
    }}>
      <p style={{ margin: 0, color: "white" }}>
        <strong>From:</strong> {skills} → <strong>To:</strong> {goal}
      </p>
    </div>

    <div style={{ lineHeight: "1.8" }}>
      {steps.map((step, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem 1.5rem",
            marginBottom: "1rem",
            borderRadius: "10px",
            border: "1px solid rgba(60,26,107, 0.2)",
            display: "flex",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "default"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(60,26,107, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            width: "30px",
            height: "30px",
            backgroundColor: "#3c1a6b",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            marginRight: "1rem",
            flexShrink: 0,
            boxShadow: "0 0 15px rgba(60,26,107, 0.3)"
          }}>
            {index + 1}
          </div>
          <span style={{ color: "white" }}>{step.replace(/^\d+\.\s*/, '')}</span>
        </div>
      ))}
    </div>
  </div>
);

// Enhanced Generate Path Form Page
function GeneratePathForm() {
  const { apiUrl, loading, setLoading, error, setError } = useAppContext();
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!skills.trim()) {
      errors.skills = "Skills are required";
    } else if (skills.length > 200) {
      errors.skills = "Skills description is too long (max 200 characters)";
    }
    
    if (!goal.trim()) {
      errors.goal = "Goal is required";
    } else if (goal.length > 100) {
      errors.goal = "Goal description is too long (max 100 characters)";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/generate-path`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          skills: skills.trim(), 
          goal: goal.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.steps || data.steps.length === 0) {
        throw new Error("Invalid response from server");
      }

      setResult({
        steps: data.steps,
        skills: skills.trim(),
        goal: goal.trim(),
        metadata: data.metadata
      });

    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate learning path. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSkills("");
    setGoal("");
    setResult(null);
    setError("");
    setValidationErrors({});
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
      color: "white",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: "2rem",
        borderRadius: "15px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(60,26,107, 0.2)",
        border: "1px solid rgba(60,26,107, 0.3)"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          color: "white", 
          marginBottom: "2rem",
          fontSize: "2.5rem",
          textShadow: "0 0 15px rgba(60,26,107, 0.5)"
        }}>
          🎯 Generate Your Learning Path
        </h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "white"
            }}>
              Your Current Skills *
            </label>
            <input
              type="text"
              placeholder="e.g., Python, HTML, CSS, Basic JavaScript"
              value={skills}
              onChange={(e) => {
                setSkills(e.target.value);
                if (validationErrors.skills) {
                  setValidationErrors(prev => ({ ...prev, skills: null }));
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: validationErrors.skills ? "2px solid #dc3545" : "1px solid rgba(60,26,107, 0.3)",
                fontSize: "1rem",
                transition: "border-color 0.3s ease",
                boxSizing: "border-box",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white"
              }}
              maxLength={200}
              disabled={loading}
            />
            {validationErrors.skills && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                {validationErrors.skills}
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "#a0a0a0", margin: "0.5rem 0 0 0" }}>
              {skills.length}/200 characters
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "white"
            }}>
              Your Career Goal *
            </label>
            <input
              type="text"
              placeholder="e.g., Full Stack Developer, Data Scientist, UX Designer"
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                if (validationErrors.goal) {
                  setValidationErrors(prev => ({ ...prev, goal: null }));
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: validationErrors.goal ? "2px solid #dc3545" : "1px solid rgba(60,26,107, 0.3)",
                fontSize: "1rem",
                transition: "border-color 0.3s ease",
                boxSizing: "border-box",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white"
              }}
              maxLength={100}
              disabled={loading}
            />
            {validationErrors.goal && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                {validationErrors.goal}
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "#a0a0a0", margin: "0.5rem 0 0 0" }}>
              {goal.length}/100 characters
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={loading || !skills.trim() || !goal.trim()}
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "12px 24px",
                backgroundColor: loading ? "#6c757d" : "#3c1a6b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1.1rem",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
                opacity: (!skills.trim() || !goal.trim()) ? 0.6 : 1,
                boxShadow: "0 0 15px rgba(60,26,107, 0.3)"
              }}
            >
              {loading ? "🔄 Generating..." : "🚀 Generate Path"}
            </button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold"
                }}
              >
                🔄 Start Over
              </button>
            )}
          </div>
        </form>

        {error && (
          <div style={{
            backgroundColor: "rgba(248, 215, 218, 0.2)",
            color: "#f5c6cb",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid rgba(245, 198, 203, 0.3)",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading && <LoadingSpinner message="Generating your personalized learning path..." />}

        {result && !loading && (
          <LearningPathDisplay
            steps={result.steps}
            skills={result.skills}
            goal={result.goal}
            metadata={result.metadata}
          />
        )}

        {!loading && !result && !error && (
          <div style={{
            textAlign: "center",
            color: "#a0a0a0",
            padding: "2rem",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderRadius: "10px",
            border: "2px dashed rgba(60,26,107, 0.3)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
            <p style={{ fontSize: "1.1rem", margin: 0 }}>
              Enter your skills and career goal above to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 404 Page
function NotFound() {
  return (
    <div style={{
      textAlign: "center",
      padding: "4rem 2rem",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "4rem", margin: 0, color: "#6c757d" }}>404</h1>
      <p style={{ fontSize: "1.2rem", color: "#6c757d", marginBottom: "2rem" }}>
        Page not found
      </p>
      <Link to="/" style={{
        color: "#3c1a6b",
        textDecoration: "none",
        fontSize: "1.1rem",
        padding: "0.5rem 1rem",
        border: "2px solid #3c1a6b",
        borderRadius: "6px",
        transition: "all 0.3s ease"
      }}>
        🏠 Go Home
      </Link>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AppContextProvider>
        <Router>
          <div style={{ 
            minHeight: "100vh", 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Ccircle cx='100' cy='100' r='0.8' fill='%23fff' opacity='0.6' /%3E%3Ccircle cx='400' cy='150' r='0.8' fill='%23fff' opacity='0.9' /%3E%3Ccircle cx='250' cy='400' r='0.8' fill='%23fff' opacity='0.9' /%3E%3C/svg%3E\"), radial-gradient(ellipse at center, #0a0a1a 0%, #0f0a1f 50%, #000000 100%)",
            backgroundRepeat: "repeat, no-repeat",
            backgroundSize: "500px 500px, cover"
          }}>
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/generate" element={<GeneratePathForm />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <footer style={{
              textAlign: "center",
              padding: "2rem",
              color: "#a0a0a0",
              borderTop: "1px solid rgba(60,26,107, 0.3)",
              marginTop: "4rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)"
            }}>
              <p style={{ margin: 0 }}>
                Using React & Gemini AI
              </p>
            </footer>
          </div>
        </Router>
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;