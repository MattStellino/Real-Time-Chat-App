// Chat utility functions for media extraction, search, and export

/**
 * Extract media items from messages
 * @param {Array} messages - Array of message objects
 * @returns {Object} Object with photos, videos, and files arrays
 */
export const extractMedia = (messages) => {
  const photos = [];
  const videos = [];
  const files = [];

  if (!messages || !Array.isArray(messages)) {
    return { photos, videos, files };
  }

  messages.forEach((message) => {
    // Check for file attachments
    if (message.attachments && Array.isArray(message.attachments)) {
      message.attachments.forEach((attachment) => {
        const mediaItem = {
          id: `${message._id}-${attachment.name || attachment.url}`,
          kind: getMediaType(attachment),
          url: attachment.url,
          thumbUrl: attachment.thumbUrl || attachment.url,
          name: attachment.name || 'Unknown',
          size: attachment.size || 0,
          createdAt: message.createdAt,
          messageId: message._id,
          sender: message.sender
        };

        if (mediaItem.kind === 'photo') {
          photos.push(mediaItem);
        } else if (mediaItem.kind === 'video') {
          videos.push(mediaItem);
        } else {
          files.push(mediaItem);
        }
      });
    }

    // Check for legacy fileUrl/imageUrl/videoUrl fields
    if (message.imageUrl) {
      photos.push({
        id: `${message._id}-image`,
        kind: 'photo',
        url: message.imageUrl,
        thumbUrl: message.imageUrl,
        name: 'Image',
        size: 0,
        createdAt: message.createdAt,
        messageId: message._id,
        sender: message.sender
      });
    }

    if (message.videoUrl) {
      videos.push({
        id: `${message._id}-video`,
        kind: 'video',
        url: message.videoUrl,
        thumbUrl: message.thumbUrl || message.videoUrl,
        name: 'Video',
        size: 0,
        createdAt: message.createdAt,
        messageId: message._id,
        sender: message.sender
      });
    }

    if (message.fileUrl && !message.imageUrl && !message.videoUrl) {
      files.push({
        id: `${message._id}-file`,
        kind: 'file',
        url: message.fileUrl,
        thumbUrl: null,
        name: message.fileName || 'File',
        size: message.fileSize || 0,
        createdAt: message.createdAt,
        messageId: message._id,
        sender: message.sender
      });
    }
  });

  // Sort by creation date (newest first)
  const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
  
  return {
    photos: photos.sort(sortByDate),
    videos: videos.sort(sortByDate),
    files: files.sort(sortByDate)
  };
};

/**
 * Determine media type from attachment
 * @param {Object} attachment - Attachment object
 * @returns {string} Media type: 'photo', 'video', or 'file'
 */
const getMediaType = (attachment) => {
  const name = attachment.name || '';
  const url = attachment.url || '';
  const mimeType = attachment.mimeType || '';

  // Check by MIME type first
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';

  // Check by file extension
  const extension = name.split('.').pop()?.toLowerCase() || url.split('.').pop()?.toLowerCase() || '';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];

  if (imageExtensions.includes(extension)) return 'photo';
  if (videoExtensions.includes(extension)) return 'video';
  
  return 'file';
};

/**
 * Search messages for a query
 * @param {Array} messages - Array of message objects
 * @param {string} query - Search query
 * @returns {Array} Array of matching messages with snippet
 */
export const searchMessages = (messages, query) => {
  if (!query || query.trim() === '') return [];
  if (!messages || !Array.isArray(messages)) return [];

  const searchTerm = query.toLowerCase().trim();
  const results = [];

  messages.forEach((message) => {
    let match = false;
    let snippet = '';

    // Search in message content
    if (message.content && message.content.toLowerCase().includes(searchTerm)) {
      match = true;
      snippet = message.content;
    }

    // Search in attachment names
    if (message.attachments && Array.isArray(message.attachments)) {
      message.attachments.forEach((attachment) => {
        if (attachment.name && attachment.name.toLowerCase().includes(searchTerm)) {
          match = true;
          snippet = attachment.name;
        }
      });
    }

    if (match) {
      results.push({
        messageId: message._id,
        content: message.content,
        snippet: snippet,
        timestamp: message.createdAt,
        sender: message.sender,
        hasAttachments: message.attachments && message.attachments.length > 0
      });
    }
  });

  // Sort by timestamp (newest first)
  return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Export chat as JSON
 * @param {Object} chat - Chat object
 * @param {Array} messages - Array of messages
 * @param {Array} participants - Array of participants
 * @returns {Blob} JSON blob
 */
export const exportAsJson = (chat, messages, participants = []) => {
  const exportData = {
    chat: {
      id: chat._id,
      name: chat.chatName || chat.displayName,
      isGroupChat: chat.isGroupChat,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    },
    participants: participants.map(p => ({
      id: p._id,
      username: p.username,
      email: p.email
    })),
    messages: messages.map(m => ({
      id: m._id,
      content: m.content,
      sender: m.sender,
      createdAt: m.createdAt,
      attachments: m.attachments || []
    })),
    exportedAt: new Date().toISOString(),
    totalMessages: messages.length
  };

  return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
};

/**
 * Export chat as TXT
 * @param {Object} chat - Chat object
 * @param {Array} messages - Array of messages
 * @param {Array} participants - Array of participants
 * @returns {Blob} TXT blob
 */
export const exportAsTxt = (chat, messages, participants = []) => {
  const chatName = chat.chatName || chat.displayName || 'Unknown Chat';
  const isGroup = chat.isGroupChat;
  
  let content = `Chat Export: ${chatName}\n`;
  content += `Type: ${isGroup ? 'Group Chat' : 'Direct Message'}\n`;
  content += `Created: ${formatDate(chat.createdAt)}\n`;
  content += `Total Messages: ${messages.length}\n\n`;
  
  if (isGroup && participants.length > 0) {
    content += `Participants:\n`;
    participants.forEach(p => {
      content += `- ${p.username} (${p.email})\n`;
    });
    content += `\n`;
  }
  
  content += `Messages:\n`;
  content += `${'='.repeat(50)}\n\n`;
  
  messages.forEach((message) => {
    const timestamp = formatDate(message.timestamp || message.createdAt);
    const sender = message.sender?.username || 'Unknown';
    const messageContent = message.content || '[No text content]';
    
    content += `${timestamp} | ${sender}: ${messageContent}\n`;
    
    if (message.attachments && message.attachments.length > 0) {
      message.attachments.forEach(attachment => {
        content += `  📎 ${attachment.name || 'Attachment'}\n`;
      });
    }
    
    content += `\n`;
  });
  
  return new Blob([content], { type: 'text/plain' });
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Unknown';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate filename for chat export
 * @param {Object} chat - Chat object
 * @param {string} format - Export format ('json' or 'txt')
 * @returns {string} Generated filename
 */
export const generateExportFilename = (chat, format) => {
  const chatName = (chat.chatName || chat.displayName || 'chat')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 16);
  
  return `${chatName}-${timestamp}.${format}`;
};
