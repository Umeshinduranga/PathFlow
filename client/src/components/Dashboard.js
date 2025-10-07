import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [userPaths, setUserPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Test server connectivity first
      console.log('Testing server connectivity...');
      
      // Fetch general stats with timeout and better error handling
      const statsResponse = await axios.get('/api/dashboard/stats', {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Stats response:', statsResponse.data);
      setStats(statsResponse.data.stats);

      // Try to fetch user's personal paths if authenticated
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userPathsResponse = await axios.get('/api/dashboard/my-paths', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000
          });
          setUserPaths(userPathsResponse.data.userPaths || []);
        } catch (userError) {
          // User not authenticated or error - continue with general stats only
          console.log('User paths not available:', userError.message);
        }
      }

    } catch (err) {
      console.error('Dashboard error details:', err);
      console.log('Error type:', typeof err);
      console.log('Error properties:', Object.keys(err));
      
      // Don't show error, just use fallback data and show a warning
      setError(''); // Clear error to show dashboard with demo data
      
      // Set comprehensive fallback demo data
      setStats({
        totalPaths: 12,
        recentPaths: [
          {
            goal: 'Full Stack Developer',
            skills: ['JavaScript', 'React', 'Node.js'],
            createdAt: new Date().toISOString(),
            generatedBy: 'demo'
          },
          {
            goal: 'Data Scientist',
            skills: ['Python', 'Machine Learning', 'Statistics'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            generatedBy: 'demo'
          },
          {
            goal: 'Frontend Developer',
            skills: ['HTML', 'CSS', 'React'],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            generatedBy: 'demo'
          }
        ],
        popularSkills: [
          { skill: 'JavaScript', count: 15 },
          { skill: 'Python', count: 12 },
          { skill: 'React', count: 10 },
          { skill: 'HTML', count: 8 },
          { skill: 'CSS', count: 7 },
          { skill: 'Node.js', count: 6 },
          { skill: 'Git', count: 5 },
          { skill: 'SQL', count: 4 }
        ],
        popularGoals: [
          { goal: 'Full Stack Developer', count: 8 },
          { goal: 'Frontend Developer', count: 6 },
          { goal: 'Data Scientist', count: 4 },
          { goal: 'Backend Developer', count: 3 },
          { goal: 'Mobile Developer', count: 2 },
          { goal: 'DevOps Engineer', count: 2 }
        ],
        message: '⚠️ Demo Mode: Unable to connect to backend server. Make sure to run "npm run dev" to see live data.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>📊</div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '15px',
          padding: '2rem',
          color: '#ff6b6b'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Connection Error</h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {error}
          </p>
          <button
            onClick={fetchDashboardData}
            style={{
              backgroundColor: '#3c1a6b',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Retry Connection
          </button>
          <div style={{
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            opacity: 0.8,
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            color: '#ffc107'
          }}>
            <strong>Troubleshooting Tips:</strong><br/>
            • Make sure both servers are running: <code>npm run dev</code><br/>
            • Check that port 5000 is available<br/>
            • Refresh the page and try again
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none'
        }}>
          📊 Learning Dashboard
        </h1>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.8,
          margin: 0
        }}>
          Track your learning journey and explore community insights
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Platform Stats */}
        <div style={{
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
          borderRadius: '15px',
          padding: '1.5rem',
          border: '1px solid rgba(60,26,107, 0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#667eea',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🌟 Platform Stats
          </h3>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Total Learning Paths:</strong> {stats?.totalPaths || 0}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Recent Activity:</strong> {stats?.recentPaths?.length || 0} paths created recently
            </div>
            {stats?.message && (
              <div style={{
                fontSize: '0.9rem',
                color: '#ffc107',
                marginTop: '1rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '5px'
              }}>
                💡 {stats.message}
              </div>
            )}
          </div>
        </div>

        {/* User Stats (if available) */}
        {userPaths.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(20, 20, 30, 0.9)',
            borderRadius: '15px',
            padding: '1.5rem',
            border: '1px solid rgba(60,26,107, 0.4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#28a745',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👤 Your Progress
            </h3>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Your Learning Paths:</strong> {userPaths.length}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Latest Goal:</strong> {userPaths[0]?.goal || 'None yet'}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Keep it up!</strong> 🚀
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popular Skills */}
      {stats?.popularSkills && stats.popularSkills.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
          borderRadius: '15px',
          padding: '1.5rem',
          border: '1px solid rgba(60,26,107, 0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#ffc107',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔥 Trending Skills
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem'
          }}>
            {stats.popularSkills.map((skill, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 193, 7, 0.2)',
                  color: '#ffc107',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{skill.skill}</span>
                <span style={{
                  backgroundColor: 'rgba(255, 193, 7, 0.3)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem'
                }}>
                  {skill.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Goals */}
      {stats?.popularGoals && stats.popularGoals.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
          borderRadius: '15px',
          padding: '1.5rem',
          border: '1px solid rgba(60,26,107, 0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#28a745',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🎯 Popular Career Goals
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.8rem'
          }}>
            {stats.popularGoals.map((goal, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  color: '#28a745',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(40, 167, 69, 0.3)',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>
                  {goal.goal}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {goal.count} learners
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentPaths && stats.recentPaths.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
          borderRadius: '15px',
          padding: '1.5rem',
          border: '1px solid rgba(60,26,107, 0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#667eea',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📈 Recent Learning Paths
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            {stats.recentPaths.slice(0, 5).map((path, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}
              >
                <div style={{
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '0.3rem'
                }}>
                  {path.goal}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  opacity: 0.8,
                  marginBottom: '0.3rem'
                }}>
                  Skills: {path.skills.join(', ')}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.6
                }}>
                  Created: {new Date(path.createdAt).toLocaleDateString()} • 
                  Generated by: {path.generatedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;