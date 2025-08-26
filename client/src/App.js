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
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || "http://localhost:5000");

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
              backgroundColor: "#007bff",
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
      borderTop: "4px solid #007bff",
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
    backgroundColor: "#007bff",
    padding: "1rem 2rem",
    marginBottom: "2rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  }}>
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Link to="/" style={{
        color: "white",
        textDecoration: "none",
        fontSize: "1.5rem",
        fontWeight: "bold"
      }}>
        🎯 Learning Path Generator
      </Link>
      <div>
        <Link to="/" style={{
          color: "white",
          textDecoration: "none",
          marginRight: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          transition: "background-color 0.3s"
        }}>
          Home
        </Link>
        <Link to="/generate" style={{
          color: "white",
          textDecoration: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          transition: "background-color 0.3s"
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
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "800px",
        padding: "3rem",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "15px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
      }}>
        <h1 style={{ 
          fontSize: "3rem", 
          marginBottom: "1rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
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
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "50px",
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
            transform: "translateY(0)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(40, 167, 69, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(40, 167, 69, 0.3)";
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
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    padding: "2rem",
    borderRadius: "15px",
    border: "1px solid #dee2e6",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
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
        color: "#495057",
        fontSize: "1.8rem"
      }}>
        📚 Your Learning Path
      </h2>
      {metadata && (
        <div style={{
          fontSize: "0.9rem",
          color: "#6c757d",
          textAlign: "right"
        }}>
          <div>Generated by: {metadata.generatedBy === 'ai' ? '🤖 AI' : '🔧 Fallback'}</div>
          <div>Response time: {metadata.responseTime}ms</div>
        </div>
      )}
    </div>
    
    <div style={{
      backgroundColor: "#ffffff",
      padding: "1.5rem",
      borderRadius: "10px",
      marginBottom: "1.5rem",
      border: "1px solid #e9ecef"
    }}>
      <p style={{ margin: 0, color: "#495057" }}>
        <strong>From:</strong> {skills} → <strong>To:</strong> {goal}
      </p>
    </div>

    <div style={{ lineHeight: "1.8" }}>
      {steps.map((step, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#ffffff",
            padding: "1rem 1.5rem",
            marginBottom: "1rem",
            borderRadius: "10px",
            border: "1px solid #e9ecef",
            display: "flex",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "default"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            width: "30px",
            height: "30px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            marginRight: "1rem",
            flexShrink: 0
          }}>
            {index + 1}
          </div>
          <span style={{ color: "#495057" }}>{step.replace(/^\d+\.\s*/, '')}</span>
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
      color: "#333"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "15px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        border: "1px solid #e9ecef"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          color: "#007bff", 
          marginBottom: "2rem",
          fontSize: "2.5rem"
        }}>
          🎯 Generate Your Learning Path
        </h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#495057"
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
                border: validationErrors.skills ? "2px solid #dc3545" : "1px solid #ced4da",
                fontSize: "1rem",
                transition: "border-color 0.3s ease",
                boxSizing: "border-box"
              }}
              maxLength={200}
              disabled={loading}
            />
            {validationErrors.skills && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                {validationErrors.skills}
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "#6c757d", margin: "0.5rem 0 0 0" }}>
              {skills.length}/200 characters
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#495057"
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
                border: validationErrors.goal ? "2px solid #dc3545" : "1px solid #ced4da",
                fontSize: "1rem",
                transition: "border-color 0.3s ease",
                boxSizing: "border-box"
              }}
              maxLength={100}
              disabled={loading}
            />
            {validationErrors.goal && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                {validationErrors.goal}
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "#6c757d", margin: "0.5rem 0 0 0" }}>
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
                backgroundColor: loading ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1.1rem",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
                opacity: (!skills.trim() || !goal.trim()) ? 0.6 : 1
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
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #f5c6cb",
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
            color: "#6c757d",
            padding: "2rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            border: "2px dashed #dee2e6"
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
        color: "#007bff",
        textDecoration: "none",
        fontSize: "1.1rem",
        padding: "0.5rem 1rem",
        border: "2px solid #007bff",
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
          <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
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
              color: "#6c757d",
              borderTop: "1px solid #dee2e6",
              marginTop: "4rem",
              backgroundColor: "#ffffff"
            }}>
              <p style={{ margin: 0 }}>
                Made with ❤️ using React & Gemini AI
              </p>
            </footer>
          </div>
        </Router>
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;