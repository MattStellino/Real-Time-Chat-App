// Client API utilities for the chat app

/**
 * Open or create a DM with a user
 * @param {string} userId - ID of the user to start a chat with
 * @param {string} token - User authentication token
 * @param {Array} existingChats - Array of existing chats to check for duplicates
 * @returns {Promise<Object>} Chat object (existing or newly created)
 */
export const openOrCreateDM = async (userId, token, existingChats) => {
  if (!userId || !token) {
    throw new Error('User ID and authentication token required');
  }

  // Check if a DM already exists
  const existingChat = existingChats.find(chat => 
    !chat.isGroupChat && 
    chat.users.some(u => u._id === userId)
  );

  if (existingChat) {
    return existingChat;
  }

  // Create new chat
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat creation failed:', errorText);
      throw new Error(`Failed to create chat: ${response.status} ${response.statusText}`);
    }

    const newChat = await response.json();
    
    // Normalize _id to id for consistency
    if (newChat._id && !newChat.id) {
      newChat.id = newChat._id;
    }
    
    return newChat;
  } catch (error) {
    console.error('Create chat error:', error);
    throw new Error('Failed to create chat');
  }
};
