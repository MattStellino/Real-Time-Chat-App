import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ToggleButton } from 'primereact/togglebutton';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { savePreferences, savePassword, fetchMe } from '../actions/userActions';
import { useNavigate } from 'react-router-dom';
import { chromeNotificationManager } from '../notifications/ChromeNotificationManager';
import './Settings.css';
import { Button } from 'primereact/button';

const Settings = () => {
  const { user } = useSelector((state) => state.user);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: false,
      sound: true
    },
    chat: {
      readReceipts: true,
      autoScroll: true
    }
  });

  // Chrome notification settings state
  const [notificationPermission, setNotificationPermission] = useState(chromeNotificationManager.getPermissionStatus());

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const themeOptions = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load user preferences
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        theme: user.preferences.theme || 'system',
        notifications: {
          email: user.preferences.notifications?.email ?? true,
          push: user.preferences.notifications?.push ?? false,
          sound: user.preferences.notifications?.sound ?? true
        },
        chat: {
          readReceipts: user.preferences.chat?.readReceipts ?? true,
          autoScroll: user.preferences.chat?.autoScroll ?? true
        }
      });
    } else if (user) {
      // Fetch fresh user data if preferences not loaded
      dispatch(fetchMe());
    }
  }, [user, dispatch]);

  // Load notification settings
  useEffect(() => {
    setNotificationPermission(chromeNotificationManager.getPermissionStatus());
  }, []);

  // Apply theme immediately
  useEffect(() => {
    if (preferences.theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else if (preferences.theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    } else {
      // System theme - use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('theme-dark');
        document.documentElement.classList.remove('theme-light');
      } else {
        document.documentElement.classList.add('theme-light');
        document.documentElement.classList.remove('theme-dark');
      }
    }
  }, [preferences.theme]);

  const handlePreferenceChange = async (path, value) => {
    const newPreferences = { ...preferences };
    
    if (path.includes('.')) {
      const [section, key] = path.split('.');
      newPreferences[section] = {
        ...newPreferences[section],
        [key]: value
      };
    } else {
      newPreferences[path] = value;
    }

    setPreferences(newPreferences);

    try {
      await dispatch(savePreferences(newPreferences)).unwrap();
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Settings saved',
        life: 2000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error || 'Failed to save settings',
        life: 3000
      });
    }
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one letter and one number';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors below',
        life: 3000
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await dispatch(savePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Password changed successfully',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error || 'Failed to change password',
        life: 3000
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestNotificationPermission = async () => {
    try {
      const granted = await chromeNotificationManager.requestPermission();
      if (granted) {
        setNotificationPermission('granted');
        toast.current?.show({
          severity: 'success',
          summary: 'Permission Granted',
          detail: 'You can now receive desktop notifications for new messages',
          life: 3000
        });
      } else {
        toast.current?.show({
          severity: 'warn',
          summary: 'Permission Denied',
          detail: 'Desktop notifications are disabled. You can enable them in your browser settings.',
          life: 5000
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to request notification permission',
        life: 3000
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="settings-page">
      <Toast ref={toast} />
      
      <div className="settings-container">
        <div className="settings-header">
          <div className="header-actions">
            <Button
              icon="pi pi-arrow-left"
              onClick={() => navigate(-1)}
              className="back-button"
              text
              size="small"
            />
          </div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your experience</p>
        </div>
        
        <div className="settings-sections">
          {/* Account Section */}
          <div className="settings-card">
            <div className="settings-section">
              <h3>Account</h3>
              <div className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={`form-input ${passwordErrors.currentPassword ? 'p-invalid' : ''}`}
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword && (
                    <small className="form-error">{passwordErrors.currentPassword}</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`form-input ${passwordErrors.newPassword ? 'p-invalid' : ''}`}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <small className="form-error">{passwordErrors.newPassword}</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`form-input ${passwordErrors.confirmPassword ? 'p-invalid' : ''}`}
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <small className="form-error">{passwordErrors.confirmPassword}</small>
                  )}
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="save-button"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-card">
            <div className="settings-section">
              <h3>Notifications</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive email notifications (coming soon)</p>
                </div>
                <ToggleButton
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications.email', e.value)}
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  disabled={true}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications (coming soon)</p>
                </div>
                <ToggleButton
                  checked={preferences.notifications.push}
                  onChange={(e) => handlePreferenceChange('notifications.push', e.value)}
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  disabled={true}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Desktop Notifications</h4>
                  <p>Show desktop notifications for new messages</p>
                </div>
                <div className="notification-controls">
                  <div className="notification-status">
                    <span className={`status-indicator ${notificationPermission === 'granted' ? 'granted' : notificationPermission === 'denied' ? 'denied' : 'default'}`}>
                      {notificationPermission === 'granted' ? '✅ Enabled' : 
                       notificationPermission === 'denied' ? '❌ Disabled' : '⏳ Not Set'}
                    </span>
                  </div>
                  {notificationPermission !== 'granted' && (
                    <Button
                      icon="pi pi-bell"
                      onClick={handleRequestNotificationPermission}
                      className="request-permission-button"
                      size="small"
                      outlined
                      label="Enable Notifications"
                    />
                  )}
                  {notificationPermission === 'granted' && (
                    <Button
                      icon="pi pi-check"
                      className="permission-granted-button"
                      size="small"
                      disabled
                      label="Notifications Active"
                    />
                  )}
                </div>
                {notificationPermission === 'denied' && (
                  <div className="notification-help">
                    <small>
                      Notifications are blocked. To enable them, click the lock icon in your browser's address bar 
                      and allow notifications for this site.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="settings-card">
            <div className="settings-section">
              <h3>Appearance</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Theme</h4>
                  <p>Choose your preferred theme</p>
                </div>
                <Dropdown
                  value={preferences.theme}
                  options={themeOptions}
                  onChange={(e) => handlePreferenceChange('theme', e.value)}
                  className="theme-dropdown"
                />
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="settings-card">
            <div className="settings-section">
              <h3>Chat</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Read Receipts</h4>
                  <p>Show when messages are read by recipients</p>
                </div>
                <ToggleButton
                  checked={preferences.chat.readReceipts}
                  onChange={(e) => handlePreferenceChange('chat.readReceipts', e.value)}
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Auto-scroll on Send</h4>
                  <p>Automatically scroll to bottom when sending messages</p>
                </div>
                <ToggleButton
                  checked={preferences.chat.autoScroll}
                  onChange={(e) => handlePreferenceChange('chat.autoScroll', e.value)}
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-card danger-zone">
            <div className="settings-section">
              <h3>Danger Zone</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data</p>
                </div>
                <button
                  disabled={true}
                  className="save-button"
                  style={{ background: 'var(--danger)', opacity: 0.5 }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
