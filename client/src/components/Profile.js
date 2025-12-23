import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to view your profile' });
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || ''}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProfile(response.data);
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        setMessage({
          type: 'error',
          text: 'Session expired. Please log in again.'
        });
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      }
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL || ''}/api/user/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage({ type: 'success', text: response.data.message });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update profile'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p style={{ marginTop: '1rem' }}>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>
        <p>Failed to load profile</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          My Profile
        </h1>
        <p style={{ color: '#9ca3af' }}>Manage your account and view your stats</p>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
          color: message.type === 'success' ? '#22c55e' : '#ef4444'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        {/* Profile Information */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
              👤 Profile Information
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#22c55e',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  💾 Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: profile.user.name,
                      email: profile.user.email
                    });
                    setMessage({ type: '', text: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Name</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.user.name}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Email</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.user.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Member Since</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{formatDate(profile.user.createdAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            📊 Your Statistics
          </h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {profile.stats.totalPaths}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Learning Paths Created</p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {profile.stats.completionRate}%
              </p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Completion Rate</p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {profile.stats.completedSteps}/{profile.stats.totalSteps}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Steps Completed</p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(251, 146, 60, 0.3)'
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {profile.stats.accountAge}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Days Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Paths */}
      {profile.stats.recentPaths.length > 0 && (
        <div style={{
          marginTop: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            🎯 Recent Learning Paths
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {profile.stats.recentPaths.map((path, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{path.goal}</p>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    {formatDate(path.createdAt)} • Generated by: {path.generatedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
