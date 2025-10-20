import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage({ type: 'success', text: response.data.message });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user/account`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password: deletePassword }
        }
      );
      
      // Clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      alert('Account deleted successfully');
      navigate('/');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to delete account'
      });
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '700px',
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
          ⚙️ Settings
        </h1>
        <p style={{ color: '#9ca3af' }}>Manage your account settings</p>
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

      {/* Change Password Section */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔒 Change Password
        </h2>

        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: '#9ca3af'
            }}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: '#9ca3af'
            }}>
              New Password (min. 6 characters)
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: '#9ca3af'
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#6b7280' : '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {loading ? '⏳ Changing...' : '🔐 Change Password'}
          </button>
        </form>
      </div>

      {/* Delete Account Section */}
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ Danger Zone
        </h2>

        <p style={{
          marginBottom: '1.5rem',
          color: '#9ca3af',
          lineHeight: '1.6'
        }}>
          Once you delete your account, there is no going back. All your learning paths and data will be permanently deleted.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            🗑️ Delete My Account
          </button>
        ) : (
          <div>
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <p style={{
                color: '#ef4444',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                ⚠️ This action cannot be undone!
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                Please enter your password to confirm account deletion.
              </p>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '1rem'
              }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || !deletePassword}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: loading || !deletePassword ? '#6b7280' : '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: loading || !deletePassword ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? '⏳ Deleting...' : '✅ Yes, Delete Forever'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setMessage({ type: '', text: '' });
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
