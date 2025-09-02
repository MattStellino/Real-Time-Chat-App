const express = require("express");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const authenticateUser = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/messages';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
}); 

const router = express.Router();

// Get all Messages
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(400);
    throw new Error(error.message);
  }
});

// Simple XSS prevention function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Create New Message
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, attachments, clientGeneratedId } = req.body;

  if ((!content || content.trim() === '') && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: "Message must have content or attachments" });
  }

  if (!chatId) {
    return res.status(400).json({ error: "Chat ID is required" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content ? sanitizeInput(content.trim()) : '',
    chat: chatId,
  };

  // Add attachments if provided
  if (attachments && attachments.length > 0) {
    newMessage.attachments = attachments;
  }

  // Add client generated ID for deduplication
  if (clientGeneratedId) {
    newMessage.clientGeneratedId = clientGeneratedId;
  }

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "username pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

          await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

      // Increment unread count for all users in the chat except the sender
      const chat = await Chat.findById(chatId);
      if (chat) {
        for (const userId of chat.users) {
          if (userId.toString() !== req.user._id.toString()) {
            // Find existing unread count for this user
            const existingCount = chat.unreadCounts.find(
              uc => uc.user.toString() === userId.toString()
            );
            
            if (existingCount) {
              existingCount.count += 1;
            } else {
              chat.unreadCounts.push({ user: userId, count: 1 });
            }
          }
        }
        await chat.save();
      }


    res.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(400);
    throw new Error(error.message);
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
    }
  }
  if (err.message === 'Only images and videos are allowed') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Upload file endpoint
const uploadFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileUrl = `/uploads/messages/${file.filename}`;
    
    // Determine file type
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    const response = {
      id: file.filename,
      url: fileUrl,
      type: isImage ? 'image' : isVideo ? 'video' : 'unknown',
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    };

    // For images, we could add width/height detection here
    // For videos, we could add duration detection here
    
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user has already read this message
    const alreadyRead = message.readBy.some(read => read.user.toString() === userId.toString());
    
    if (!alreadyRead) {
      message.readBy.push({ user: userId, readAt: new Date() });
      await message.save();
    }

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Mark all messages in a chat as read
const markChatAsRead = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Find all unread messages in the chat for this user
    const unreadMessages = await Message.find({
      chat: chatId,
      'readBy.user': { $ne: userId },
      sender: { $ne: userId } // Don't mark own messages as read
    });

    // Mark all unread messages as read
    for (const message of unreadMessages) {
      message.readBy.push({ user: userId, readAt: new Date() });
      await message.save();
    }

    // Reset unread count for this user in this chat
    const chat = await Chat.findById(chatId);
    if (chat) {
      const userUnreadCount = chat.unreadCounts.find(
        uc => uc.user.toString() === userId.toString()
      );
      if (userUnreadCount) {
        userUnreadCount.count = 0;
        await chat.save();
      }
    }

    res.json({ 
      success: true, 
      message: `${unreadMessages.length} messages marked as read` 
    });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ error: 'Failed to mark chat as read' });
  }
});

// Attach the message routes
router.route("/:chatId").get(authenticateUser, allMessages);
router.route("/").post(authenticateUser, sendMessage);
router.route("/upload").post(authenticateUser, upload.single('file'), handleMulterError, uploadFile);
router.route("/:messageId/read").put(authenticateUser, markAsRead);
router.route("/chat/:chatId/read").put(authenticateUser, markChatAsRead);

module.exports = router;
