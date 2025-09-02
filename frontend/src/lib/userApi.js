// User API client for profile and settings management
// Handles authenticated requests to user endpoints

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user`;

/**
 * Get current user profile
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User object without password
 */
export const getMe = async (token) => {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user profile' }));
    throw new Error(errorData.error || 'Failed to fetch user profile');
  }

  return response.json();
};

/**
 * Update user profile
 * @param {Object} payload - Profile data to update
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Updated user object
 */
export const updateProfile = async (payload, token) => {
  const response = await fetch(`${API_BASE}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to update profile' }));
    throw new Error(errorData.error || 'Failed to update profile');
  }

  return response.json();
};

/**
 * Update user preferences
 * @param {Object} preferences - Preferences object to update
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Updated user object
 */
export const updatePreferences = async (preferences, token) => {
  const response = await fetch(`${API_BASE}/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ preferences }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to update preferences' }));
    throw new Error(errorData.error || 'Failed to update preferences');
  }

  return response.json();
};

/**
 * Change user password
 * @param {Object} passwordData - { currentPassword, newPassword }
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (passwordData, token) => {
  const response = await fetch(`${API_BASE}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to change password' }));
    throw new Error(errorData.error || 'Failed to change password');
  }

  return response.json();
};

/**
 * Get another user's public profile
 * @param {string} userId - ID of the user to fetch
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User's public profile
 */
export const getUserProfile = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user profile' }));
      throw new Error(errorData.error || 'Failed to fetch user profile');
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('❌ getUserProfile exception:', error);
    throw error;
  }
};
