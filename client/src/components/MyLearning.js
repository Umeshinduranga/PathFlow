import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

// Helper function to parse simple markdown
const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Replace **bold** with <strong>
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MyLearning = () => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, in-progress, completed
  const [sortBy, setSortBy] = useState('recent'); // recent, progress, name
  const [selectedPath, setSelectedPath] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMyPaths();
  }, []);

  const fetchMyPaths = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = authService.getToken();
      if (!token) {
        setError('Please log in to view your learning paths');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/paths/my-paths', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPaths(response.data.paths);
      }
    } catch (err) {
      console.error('Error fetching paths:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        authService.removeToken();
      } else {
        setError('Failed to load your learning paths');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompletion = async (pathId, stepIndex) => {
    try {
      const token = authService.getToken();
      const response = await axios.patch(
        `/api/paths/${pathId}/steps/${stepIndex}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setPaths(prevPaths =>
          prevPaths.map(path => {
            if (path._id === pathId) {
              const updatedCompletedSteps = response.data.path.completedSteps;
              const totalSteps = path.totalSteps;
              const completedCount = updatedCompletedSteps.length;
              const progressPercentage = Math.round((completedCount / totalSteps) * 100);
              
              return {
                ...path,
                completedSteps: updatedCompletedSteps,
                completedCount,
                progressPercentage
              };
            }
            return path;
          })
        );

        // Update selected path if it's open
        if (selectedPath && selectedPath._id === pathId) {
          setSelectedPath(prev => ({
            ...prev,
            completedSteps: response.data.path.completedSteps,
            completedCount: response.data.path.completedCount,
            progressPercentage: response.data.path.progressPercentage
          }));
        }
      }
    } catch (err) {
      console.error('Error toggling step:', err);
      setError('Failed to update step completion');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deletePath = async (pathId) => {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`/api/paths/${pathId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPaths(prevPaths => prevPaths.filter(p => p._id !== pathId));
        setShowDeleteConfirm(null);
        if (selectedPath?._id === pathId) {
          setSelectedPath(null);
        }
      }
    } catch (err) {
      console.error('Error deleting path:', err);
      setError('Failed to delete learning path');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter and sort paths
  const getFilteredAndSortedPaths = () => {
    let filtered = [...paths];

    // Apply filter
    if (filter === 'in-progress') {
      filtered = filtered.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100);
    } else if (filter === 'completed') {
      filtered = filtered.filter(p => p.progressPercentage === 100);
    } else if (filter === 'not-started') {
      filtered = filtered.filter(p => p.progressPercentage === 0);
    }

    // Apply sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'progress') {
      filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.goal.localeCompare(b.goal));
    }

    return filtered;
  };

  const filteredPaths = getFilteredAndSortedPaths();

  // Calculate statistics
  const stats = {
    total: paths.length,
    inProgress: paths.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length,
    completed: paths.filter(p => p.progressPercentage === 100).length,
    notStarted: paths.filter(p => p.progressPercentage === 0).length,
    totalSteps: paths.reduce((sum, p) => sum + p.totalSteps, 0),
    completedSteps: paths.reduce((sum, p) => sum + p.completedCount, 0)
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
        <div>Loading your learning paths...</div>
      </div>
    );
  }

  if (error && paths.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '15px',
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Error</h3>
          <p style={{ color: '#ff6b6b' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          📚 My Learning Paths
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
          Track your progress and complete your learning goals
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard icon="📊" label="Total Paths" value={stats.total} color="#667eea" />
        <StatCard icon="🚀" label="In Progress" value={stats.inProgress} color="#f093fb" />
        <StatCard icon="✅" label="Completed" value={stats.completed} color="#4facfe" />
        <StatCard icon="📝" label="Steps Done" value={`${stats.completedSteps}/${stats.totalSteps}`} color="#43e97b" />
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}

      {paths.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          border: '2px dashed rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>No Learning Paths Yet</h2>
          <p style={{ color: '#a0a0a0', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Generate your first learning path to get started!
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Generate Learning Path
          </a>
        </div>
      ) : (
        <>
          {/* Filters and Sort */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label="All"
                count={stats.total}
              />
              <FilterButton
                active={filter === 'in-progress'}
                onClick={() => setFilter('in-progress')}
                label="In Progress"
                count={stats.inProgress}
              />
              <FilterButton
                active={filter === 'completed'}
                onClick={() => setFilter('completed')}
                label="Completed"
                count={stats.completed}
              />
              <FilterButton
                active={filter === 'not-started'}
                onClick={() => setFilter('not-started')}
                label="Not Started"
                count={stats.notStarted}
              />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="progress">Progress</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Learning Paths Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredPaths.map(path => (
              <PathCard
                key={path._id}
                path={path}
                onSelect={() => setSelectedPath(path)}
                onDelete={() => setShowDeleteConfirm(path._id)}
              />
            ))}
          </div>

          {filteredPaths.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0a0a0',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontSize: '1.1rem' }}>No paths match this filter</p>
            </div>
          )}
        </>
      )}

      {/* Path Detail Modal */}
      {selectedPath && (
        <PathDetailModal
          path={selectedPath}
          onClose={() => setSelectedPath(null)}
          onToggleStep={toggleStepCompletion}
          onDelete={() => setShowDeleteConfirm(selectedPath._id)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => deletePath(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '15px',
    padding: '1.5rem',
    textAlign: 'center',
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'default'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.borderColor = color;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</div>
  </div>
);

// Filter Button Component
const FilterButton = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.6rem 1.2rem',
      backgroundColor: active ? '#667eea' : 'rgba(255, 255, 255, 0.05)',
      color: active ? 'white' : '#a0a0a0',
      border: `1px solid ${active ? '#667eea' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.color = 'white';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.target.style.color = '#a0a0a0';
      }
    }}
  >
    {label} ({count})
  </button>
);

// Path Card Component
const PathCard = ({ path, onSelect, onDelete }) => {
  const getProgressColor = (percentage) => {
    if (percentage === 0) return '#6c757d';
    if (percentage < 30) return '#ff6b6b';
    if (percentage < 70) return '#f093fb';
    if (percentage < 100) return '#4facfe';
    return '#43e97b';
  };

  const progressColor = getProgressColor(path.progressPercentage);

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '15px',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'transform 0.2s, border-color 0.2s',
      position: 'relative'
    }}
    onClick={onSelect}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.borderColor = progressColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }}
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#ff6b6b',
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '0.3rem',
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.6}
        title="Delete path"
      >
        🗑️
      </button>

      {/* Goal */}
      <h3 style={{
        fontSize: '1.3rem',
        marginBottom: '0.8rem',
        paddingRight: '2rem',
        color: 'white'
      }}>
        {path.goal}
      </h3>

      {/* Skills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {path.skills.slice(0, 3).map((skill, idx) => (
          <span
            key={idx}
            style={{
              padding: '0.3rem 0.8rem',
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              color: '#667eea',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            {skill}
          </span>
        ))}
        {path.skills.length > 3 && (
          <span style={{
            padding: '0.3rem 0.8rem',
            color: '#a0a0a0',
            fontSize: '0.85rem'
          }}>
            +{path.skills.length - 3} more
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <span style={{ color: '#a0a0a0' }}>Progress</span>
          <span style={{ color: progressColor, fontWeight: 'bold' }}>
            {path.progressPercentage}%
          </span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${path.progressPercentage}%`,
            backgroundColor: progressColor,
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#a0a0a0'
      }}>
        <span>
          {path.completedCount}/{path.totalSteps} steps
        </span>
        <span>
          {new Date(path.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

// Path Detail Modal Component
const PathDetailModal = ({ path, onClose, onToggleStep, onDelete }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}
    onClick={onClose}
    >
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '20px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.7}
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          paddingRight: '3rem',
          color: 'white'
        }}>
          {path.goal}
        </h2>

        {/* Skills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {path.skills.map((skill, idx) => (
            <span
              key={idx}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                color: '#667eea',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <span style={{ color: '#a0a0a0' }}>Overall Progress</span>
            <span style={{
              color: path.progressPercentage === 100 ? '#43e97b' : '#4facfe',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              {path.progressPercentage}%
            </span>
          </div>
          <div style={{
            height: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${path.progressPercentage}%`,
              background: path.progressPercentage === 100 
                ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s ease',
              borderRadius: '10px'
            }} />
          </div>
          <div style={{
            marginTop: '0.8rem',
            fontSize: '0.9rem',
            color: '#a0a0a0',
            textAlign: 'center'
          }}>
            {path.completedCount} of {path.totalSteps} steps completed
          </div>
        </div>

        {/* Learning Steps */}
        <h3 style={{
          fontSize: '1.3rem',
          marginBottom: '1rem',
          color: 'white'
        }}>
          📋 Learning Steps
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {path.path.map((step, index) => {
            const isCompleted = path.completedSteps?.includes(index);
            return (
              <div
                key={index}
                style={{
                  backgroundColor: isCompleted 
                    ? 'rgba(67, 233, 123, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isCompleted ? '#43e97b' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  opacity: isCompleted ? 0.7 : 1
                }}
                onClick={() => onToggleStep(path._id, index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isCompleted 
                    ? 'rgba(67, 233, 123, 0.15)' 
                    : 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isCompleted 
                    ? 'rgba(67, 233, 123, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: `2px solid ${isCompleted ? '#43e97b' : 'rgba(255, 255, 255, 0.3)'}`,
                  backgroundColor: isCompleted ? '#43e97b' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.2s'
                }}>
                  {isCompleted && <span style={{ color: 'white', fontSize: '0.9rem' }}>✓</span>}
                </div>

                {/* Step content */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontWeight: 'bold',
                    color: '#667eea',
                    marginRight: '0.5rem'
                  }}>
                    Step {index + 1}
                  </span>
                  <span style={{ color: isCompleted ? '#a0a0a0' : 'white' }}>
                    {parseMarkdown(step)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            style={{
              padding: '0.8rem 1.5rem',
              backgroundColor: 'rgba(255, 107, 107, 0.2)',
              color: '#ff6b6b',
              border: '1px solid #ff6b6b',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff6b6b';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
              e.target.style.color = '#ff6b6b';
            }}
          >
            🗑️ Delete Path
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '0.8rem 2rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    padding: '2rem'
  }}
  onClick={onCancel}
  >
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '20px',
      padding: '2rem',
      maxWidth: '400px',
      textAlign: 'center'
    }}
    onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>
        Delete Learning Path?
      </h3>
      <p style={{ color: '#a0a0a0', marginBottom: '2rem', lineHeight: '1.6' }}>
        This action cannot be undone. All your progress on this path will be permanently deleted.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.8rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '0.8rem 1.5rem',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#ff5252'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6b6b'}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default MyLearning;
