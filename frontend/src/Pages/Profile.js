import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';
import { saveProfile, fetchMe } from '../actions/userActions';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { Button } from 'primereact/button';

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: '',
    email: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        email: user.email || ''
      };
      setFormData(userData);
      setOriginalData(userData);
    } else {
      // Fetch fresh user data
      dispatch(fetchMe());
    }
  }, [user, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be less than 160 characters';
    }

    // Avatar URL validation (optional)
    if (formData.avatarUrl && !isValidUrl(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors below',
        life: 3000
      });
      return;
    }

    setLoading(true);
    try {
      await dispatch(saveProfile({
        username: formData.username,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl
      })).unwrap();

      setOriginalData(formData);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error || 'Failed to update profile',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <Toast ref={toast} />
      
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-header-content">
              <Button 
                icon="pi pi-arrow-left" 
                className="back-button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              />
              <div className="profile-header-text">
                <h1 className="profile-title">Profile</h1>
                <p className="profile-subtitle">Manage your account information</p>
              </div>
            </div>
          </div>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {formData.avatarUrl ? (
                <img 
                  src={formData.avatarUrl} 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="avatar-placeholder" style={{ display: formData.avatarUrl ? 'none' : 'flex' }}>
                {(formData.username || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="avatar-info">
              <h3>{formData.username || 'User'}</h3>
              <p className="member-since">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`form-input ${errors.username ? 'p-invalid' : ''}`}
                placeholder="Enter username"
              />
              {errors.username && (
                <small className="form-error">{errors.username}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`form-input ${errors.bio ? 'p-invalid' : ''}`}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={160}
              />
              <small className="form-help">
                {formData.bio.length}/160 characters
              </small>
              {errors.bio && (
                <small className="form-error">{errors.bio}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="avatarUrl" className="form-label">
                Avatar URL
              </label>
              <input
                id="avatarUrl"
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                className={`form-input ${errors.avatarUrl ? 'p-invalid' : ''}`}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatarUrl && (
                <small className="form-error">{errors.avatarUrl}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                className="form-input"
                readOnly
              />
              <small className="form-help">
                Email cannot be changed. Contact support if needed.
              </small>
            </div>

            <div className="form-actions">
              <button
                onClick={handleSave}
                disabled={!isDirty() || loading}
                className={`save-button ${loading ? 'loading' : ''}`}
              >
                Save Changes
              </button>
              <button
                onClick={handleReset}
                disabled={!isDirty() || loading}
                className="reset-button"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
