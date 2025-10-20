import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import authService from "./services/authService";
import MarketInsights from "./components/MarketInsights";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initAuth = () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        setCurrentUser(authService.getCurrentUser());
      }
    };
    initAuth();
  }, []);

  // Demo users for quick login (these won't be saved to database)
  const demoUsers = [
    { username: "demo", password: "demo123", name: "Demo User", email: "demo@pathflow.com" },
    { username: "test", password: "test123", name: "Test User", email: "test@pathflow.com" },
    { username: "pathflow", password: "pathflow123", name: "PathFlow User", email: "pathflow@example.com" }
  ];

  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      const response = await authService.login({ usernameOrEmail, password });
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if server request fails
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const value = {
    learningPaths,
    setLearningPaths,
    loading,
    setLoading,
    error,
    setError,
    apiUrl,
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    demoUsers
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

// Sign In Component
const SignIn = () => {
  const { login, register, demoUsers } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
    username: "",
    email: "",
    name: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.usernameOrEmail, formData.password);
      } else {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }
        
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser) => {
    setError("");
    setLoading(true);
    
    try {
      const result = await login(demoUser.username, demoUser.password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      usernameOrEmail: "",
      password: "",
      username: "",
      email: "",
      name: "",
      confirmPassword: ""
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at center, #0a0a1a 0%, #0f0a1f 50%, #000000 100%)",

    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "3rem",
        borderRadius: "20px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(60,26,107, 0.3)",
        border: "1px solid rgba(60,26,107, 0.4)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            color: "white",
            fontSize: "2.5rem",
            margin: "0 0 0.5rem 0",
            textShadow: "0 0 20px rgba(60,26,107, 0.8)",
            fontFamily: "'Poppins', sans-serif"
          }}>
            🎯 PathFlow
          </h1>
          <p style={{
            color: "#a0a0a0",
            margin: 0,
            fontSize: "1.1rem"
          }}>
            AI-Powered Learning Path Generator
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            backgroundColor: "rgba(60,26,107, 0.2)",
            borderRadius: "25px",
            padding: "4px",
            border: "1px solid rgba(60,26,107, 0.3)"
          }}>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              style={{
                padding: "8px 20px",
                backgroundColor: isLogin ? "#3c1a6b" : "transparent",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.3s ease"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              style={{
                padding: "8px 20px",
                backgroundColor: !isLogin ? "#3c1a6b" : "transparent",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.3s ease"
              }}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
          {/* Login Form */}
          {isLogin ? (
            <>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Username or Email
                </label>
                <input
                  type="text"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your username or email"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>
            </>
          ) : (
            /* Registration Form */
            <>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(60,26,107, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3c1a6b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(60,26,107, 0.5)"}
                />
              </div>
            </>
          )}

          {error && (
            <div style={{
              backgroundColor: "rgba(220, 53, 69, 0.2)",
              color: "#f5c6cb",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              textAlign: "center"
            }}>
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
              boxShadow: "0 4px 15px rgba(60,26,107, 0.4)"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#2d1554";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#3c1a6b";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "🔄 Please wait..." : isLogin ? "🚀 Sign In" : "✨ Create Account"}
          </button>
        </form>

        {/* Demo Credentials Toggle */}
        {isLogin && (
          <>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3c1a6b",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                {showCredentials ? "Hide" : "Show"} Demo Credentials
              </button>
            </div>

            {/* Demo Credentials */}
            {showCredentials && (
              <div style={{
                backgroundColor: "rgba(60,26,107, 0.2)",
                padding: "1.5rem",
                borderRadius: "10px",
                border: "1px solid rgba(60,26,107, 0.3)"
              }}>
                <h4 style={{
                  color: "white",
                  margin: "0 0 1rem 0",
                  textAlign: "center"
                }}>
                  🔑 Demo Accounts
                </h4>
                <div style={{ fontSize: "0.9rem" }}>
                  {demoUsers.map((user, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                        marginBottom: "0.5rem",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: "6px",
                        color: "white"
                      }}
                    >
                      <div>
                        <strong>{user.username}</strong> / {user.password}
                        <br />
                        <span style={{ fontSize: "0.8rem", color: "#a0a0a0" }}>
                          {user.name} - {user.email}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDemoLogin(user)}
                        disabled={loading}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: loading ? "#6c757d" : "#3c1a6b",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "0.8rem"
                        }}
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: "1rem",
                  padding: "0.8rem",
                  backgroundColor: "rgba(255, 193, 7, 0.2)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 193, 7, 0.3)"
                }}>
                  <p style={{
                    color: "#ffc107",
                    fontSize: "0.8rem",
                    margin: 0,
                    textAlign: "center"
                  }}>
                    💡 These are demo accounts. For new users, please register above!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "2rem",
          color: "#666",
          fontSize: "0.9rem"
        }}>
          <p style={{ margin: 0 }}>
            🤖 Powered by AI • 🔐 Secure Database Storage
          </p>
        </div>
      </div>
    </div>
  );
};

// Navigation Component (Updated with logout)
const Navigation = () => {
  const { currentUser, logout } = useAppContext();

  return (
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
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link to="/" style={{
            color: "white",
            textDecoration: "none",
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            transition: "background-color 0.3s",
            fontFamily: 'Poppins',
            fontWeight: "bold",
            backgroundColor: "rgba(60,26,107, 0.3)",
            border: "1px solid rgba(60,26,107, 0.4)"
          }}>
            Home
          </Link>
          <Link to="/generate" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            transition: "background-color 0.3s",
            fontFamily: 'Poppins',
            backgroundColor: "rgba(60,26,107, 0.3)",
            fontWeight: "bold",
            border: "1px solid rgba(60,26,107, 0.4)",
            marginRight: "1rem"
          }}>
            Generate Path
          </Link>
          
          <Link to="/dashboard" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            transition: "background-color 0.3s",
            fontFamily: 'Poppins',
            backgroundColor: "rgba(60,26,107, 0.3)",
            fontWeight: "bold",
            border: "1px solid rgba(60,26,107, 0.4)",
            marginRight: "1rem"
          }}>
            📊 Dashboard
          </Link>
          
          <Link to="/profile" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            transition: "background-color 0.3s",
            fontFamily: 'Poppins',
            backgroundColor: "rgba(60,26,107, 0.3)",
            fontWeight: "bold",
            border: "1px solid rgba(60,26,107, 0.4)",
            marginRight: "1rem"
          }}>
            👤 Profile
          </Link>
          
          <Link to="/settings" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            transition: "background-color 0.3s",
            fontFamily: 'Poppins',
            backgroundColor: "rgba(60,26,107, 0.3)",
            fontWeight: "bold",
            border: "1px solid rgba(60,26,107, 0.4)",
            marginRight: "1rem"
          }}>
            ⚙️ Settings
          </Link>
          
          {/* User Info and Logout */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(60,26,107, 0.2)",
            borderRadius: "12px",
            border: "1px solid rgba(60,26,107, 0.3)"
          }}>
            <span style={{
              color: "white",
              fontFamily: 'Poppins',
              fontSize: "0.9rem"
            }}>
              👋 Hi, {currentUser?.name}!
            </span>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                color: "#ff6b6b",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontFamily: 'Poppins',
                fontWeight: "bold"
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enhanced Landing Page
function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

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
          🎯 Welcome to PathFlow, {currentUser?.name}!
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
          <div>Generated by: {
            metadata.generatedBy === 'gemini-direct' || metadata.generatedBy === 'gemini-sdk' ? '🤖 Gemini AI' :
            metadata.generatedBy === 'openai' ? '🤖 OpenAI' :
            metadata.generatedBy === 'ai' ? '🤖 AI' :
            '🔧 Fallback'
          }</div>
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

// Roadmap Generator Component (inline)
const RoadmapGenerator = ({ steps, skills, goal, onDownload }) => {
  const canvasRef = useRef(null);
  const { apiUrl } = useAppContext();  // use apiUrl from context
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);

  // Canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const NODE_RADIUS = 40;
  const SPACING_X = 180;
  const SPACING_Y = 120;

  // Colors
  const COLORS = {
    background: '#0a0a1a',
    accent: '#3c1a6b',
    accentLight: '#6b4ba1',
    white: '#ffffff',
    gray: '#a0a0a0',
    success: '#28a745',
    connection: '#4a2c7a'
  };

  // 🔑 Fetch simplified roadmap steps
  const fetchSimplifiedSteps = async () => {
    try {
      const response = await fetch(`${apiUrl}/generate-roadmap-steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, goal })
      });
      if (!response.ok) throw new Error("Failed to fetch roadmap steps");
      const data = await response.json();
      return data.steps || steps;
    } catch (err) {
      console.error("Error fetching simplified steps:", err.message);
      return steps; // fallback to detailed steps
    }
  };

  // Generate roadmap on canvas
  const generateRoadmap = async () => {
    setIsGenerating(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const simplifiedSteps = await fetchSimplifiedSteps();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Clear and set background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Add subtle grid pattern
    ctx.strokeStyle = 'rgba(60, 26, 107, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Title section
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Learning Roadmap', CANVAS_WIDTH / 2, 60);
    
    // Subtitle with skills and goal
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = COLORS.gray;
    const subtitle = `From: ${skills} → To: ${goal}`;
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, 90);
    
    // Calculate positions for steps in a zigzag pattern
    const positions = [];
    const startY = 200;
    const centerX = CANVAS_WIDTH / 2;
    
    simplifiedSteps.forEach((step, index) => {
      const isEven = index % 2 === 0;
      const offsetX = isEven ? -SPACING_X : SPACING_X;
      const x = centerX + offsetX;
      const y = startY + (index * SPACING_Y);
      positions.push({ x, y, isEven });
    });
    
    // Draw connections between steps
    ctx.strokeStyle = COLORS.connection;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      // Add glow effect to connections
      ctx.shadowColor = COLORS.accent;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(current.x, current.y + NODE_RADIUS);
      
      // Create curved connection
      const midY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, midY, next.x, next.y - NODE_RADIUS);
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }
    
    ctx.setLineDash([]); // Reset dash pattern
    
    // Function to simplify step text for roadmap display
    const simplifyStepText = (stepText, stepIndex) => {
      const text = stepText.replace(/^\d+\.\s*/, '').toLowerCase().trim();
      
      // Enhanced patterns with better extraction logic
      const extractors = [
        // Direct technology/language mentions
        {
          regex: /\b(python|java|javascript|js|typescript|react|angular|vue|node\.?js?|express|django|flask|spring|html|css|sass|scss|bootstrap|tailwind)\b/i,
          format: (match) => `Learn ${capitalizeFirst(match)}`
        },
        {
          regex: /\b(mysql|postgresql|mongodb|redis|sqlite|database|sql)\b/i,
          format: (match) => `Learn ${capitalizeFirst(match === 'database' ? 'Databases' : match)}`
        },
        {
          regex: /\b(docker|kubernetes|aws|azure|gcp|git|github|gitlab|ci\/cd|devops)\b/i,
          format: (match) => `Learn ${capitalizeFirst(match)}`
        },
        {
          regex: /\b(rest|api|graphql|microservices|authentication|security|testing|unit test|integration)\b/i,
          format: (match) => `Learn ${capitalizeFirst(match)}`
        },
        
        // Project-related activities
        {
          regex: /build.*?(project|application|app|website|portfolio|demo)/i,
          format: () => 'Build Projects'
        },
        {
          regex: /create.*?(portfolio|website|project|application|app)/i,
          format: () => 'Create Portfolio'
        },
        {
          regex: /develop.*?(application|app|website|project|solution)/i,
          format: () => 'Develop Apps'
        },
        {
          regex: /design.*?(ui|ux|interface|user experience|website)/i,
          format: () => 'Design UI/UX'
        },
        
        // Learning activities
        {
          regex: /study.*?(fundamentals|basics|concepts|principles)/i,
          format: () => 'Study Fundamentals'
        },
        {
          regex: /learn.*?(advanced|complex|deeper)/i,
          format: () => 'Advanced Learning'
        },
        {
          regex: /practice.*?(coding|programming|development)/i,
          format: () => 'Practice Coding'
        },
        {
          regex: /master.*?(skills|techniques|concepts)/i,
          format: () => 'Master Skills'
        },
        
        // Career activities
        {
          regex: /network|networking|connect.*?(professional|developer|community)/i,
          format: () => 'Network & Connect'
        },
        {
          regex: /apply.*?(job|position|role|career)/i,
          format: () => 'Apply for Jobs'
        },
        {
          regex: /interview|preparation|prepare.*?interview/i,
          format: () => 'Interview Prep'
        },
        {
          regex: /job.*?(search|hunt|application)/i,
          format: () => 'Job Search'
        },
        
        // General activities
        {
          regex: /deploy|deployment|hosting|production/i,
          format: () => 'Deploy Apps'
        },
        {
          regex: /test|testing|qa|quality/i,
          format: () => 'Test & Debug'
        },
        {
          regex: /optimize|optimization|performance/i,
          format: () => 'Optimize Code'
        }
      ];
      
      // Helper function to capitalize first letter
      function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      
      // Try each extractor pattern
      for (const extractor of extractors) {
        const match = text.match(extractor.regex);
        if (match) {
          const result = extractor.format(match[1] || match[0]);
          if (result && result.length > 0) {
            return result;
          }
        }
      }
      
      // Enhanced fallback logic
      const meaningfulWords = text
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .split(' ')
        .filter(word => 
          word.length > 2 && 
          !['the', 'and', 'for', 'your', 'you', 'with', 'that', 'this', 'from', 'into', 'about', 'will', 'can', 'should', 'would', 'could', 'must', 'need', 'want', 'make', 'get', 'use', 'work', 'learn', 'study', 'understand', 'know', 'take', 'start', 'begin', 'complete'].includes(word.toLowerCase())
        );
      
      if (meaningfulWords.length >= 2) {
        const key1 = capitalizeFirst(meaningfulWords[0]);
        const key2 = capitalizeFirst(meaningfulWords[1]);
        return `${key1} ${key2}`;
      } else if (meaningfulWords.length === 1) {
        return capitalizeFirst(meaningfulWords[0]);
      }
      
      // Final fallback
      return `Step ${stepIndex + 1}`;
    };

    // Draw step nodes and text
    simplifiedSteps.forEach((step, index) => {
      const pos = positions[index];
      const originalStepText = step.replace(/^\d+\.\s*/, '');
      const simplifiedText = simplifyStepText(originalStepText, index);
      
      // Draw node circle with gradient effect
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, NODE_RADIUS);
      gradient.addColorStop(0, COLORS.accentLight);
      gradient.addColorStop(1, COLORS.accent);
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = COLORS.accent;
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Draw step number
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), pos.x, pos.y + 8);
      
      // Draw simplified step text
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 18px Arial, sans-serif';
      
      // Word wrap for simplified text (should be shorter now)
      const words = simplifiedText.split(' ');
      const maxWidth = 160; // Reduced width since text is shorter
      let lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      // Limit to maximum 2 lines for clean look
      if (lines.length > 2) {
        lines = [lines[0], lines[1].substring(0, 10) + '...'];
      }
      
      // Position text based on node position
      const textX = pos.isEven ? pos.x - NODE_RADIUS - 15 : pos.x + NODE_RADIUS + 15;
      ctx.textAlign = pos.isEven ? 'right' : 'left';
      
      lines.forEach((line, lineIndex) => {
        const textY = pos.y + (lineIndex - lines.length / 2) * 22 + 5;
        ctx.fillText(line, textX, textY);
      });
    });
    
    // Add footer
    ctx.fillStyle = COLORS.gray;
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by PathFlow AI • ' + new Date().toLocaleDateString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
    
    setRoadmapGenerated(true);
    setIsGenerating(false);
  };

  // Download roadmap as JPG
  const downloadRoadmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create download link
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `learning-roadmap-${Date.now()}.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onDownload) onDownload();
    }, 'image/jpeg', 0.9);
  };

  // Auto-generate when component mounts
  useEffect(() => {
    if (steps && steps.length > 0) {
      generateRoadmap();
    }
  }, [steps]);

  if (!steps || steps.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#a0a0a0',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '10px',
        border: '2px dashed rgba(60,26,107, 0.3)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
        <p>Generate a learning path first to create your roadmap!</p>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '2rem',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '2rem',
      borderRadius: '15px',
      border: '1px solid rgba(60,26,107, 0.3)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5), 0 0 30px rgba(60,26,107, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{
          margin: 0,
          color: 'white',
          fontSize: '1.8rem',
          textShadow: '0 0 10px rgba(60,26,107, 0.5)'
        }}>
          🗺️ Visual Roadmap
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={generateRoadmap}
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              backgroundColor: isGenerating ? '#6c757d' : '#3c1a6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 10px rgba(60,26,107, 0.3)'
            }}
          >
            {isGenerating ? '🔄 Generating...' : '🎨 Regenerate'}
          </button>
          
          {roadmapGenerated && (
            <button
              onClick={downloadRoadmap}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 10px rgba(40, 167, 69, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📥 Download JPG
            </button>
          )}
        </div>
      </div>
      
      {isGenerating && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#a0a0a0'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3c1a6b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p>Creating your visual roadmap...</p>
          </div>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '10px',
        padding: '1rem',
        border: '1px solid rgba(60,26,107, 0.2)'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: isGenerating ? 'none' : 'block'
          }}
        />
      </div>
      
      {roadmapGenerated && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(40, 167, 69, 0.3)',
          textAlign: 'center',
          color: '#d4edda'
        }}>
          ✅ Roadmap generated successfully! Click "Download JPG" to save it.
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Enhanced Generate Path Form Page with Roadmap Integration
function GeneratePathForm() {
  const { apiUrl, loading, setLoading, error, setError } = useAppContext();
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showRoadmap, setShowRoadmap] = useState(false); // New state for roadmap view

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
    setShowRoadmap(false); // Reset view when generating new path

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
    setShowRoadmap(false); // Reset roadmap view
  };

  const handleDownloadComplete = () => {
    // Optional: Add success message or analytics tracking
    console.log("Roadmap downloaded successfully!");
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px", // Increased width for roadmap
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
          <>
            {/* View Toggle Buttons */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "2rem"
            }}>
              <button
                onClick={() => setShowRoadmap(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: !showRoadmap ? "#3c1a6b" : "rgba(60,26,107, 0.3)",
                  color: "white",
                  border: "1px solid rgba(60,26,107, 0.5)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  transition: "all 0.3s ease"
                }}
              >
                📋 Text View
              </button>
              <button
                onClick={() => setShowRoadmap(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: showRoadmap ? "#3c1a6b" : "rgba(60,26,107, 0.3)",
                  color: "white",
                  border: "1px solid rgba(60,26,107, 0.5)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  transition: "all 0.3s ease"
                }}
              >
                🗺️ Roadmap View
              </button>
            </div>

            {/* Conditional Rendering */}
            {showRoadmap ? (
              <RoadmapGenerator
                steps={result.steps}
                skills={result.skills}
                goal={result.goal}
                onDownload={handleDownloadComplete}
              />
            ) : (
              <LearningPathDisplay
                steps={result.steps}
                skills={result.skills}
                goal={result.goal}
                metadata={result.metadata}
              />
            )}
            
            {/* Market Insights Component */}
            <MarketInsights goal={result.goal} />
          </>
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  
  if (!isAuthenticated) {
    return <SignIn />;
  }
  
  return children;
};

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
            <Routes>
              <Route path="/*" element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/generate" element={<GeneratePathForm />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
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
                  </>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;