const mongoose = require('mongoose');

const messageModel = mongoose.Schema(
   {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    attachments: [{
      id: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], required: true },
      filename: { type: String },
      size: { type: Number },
      mimeType: { type: String }
    }],
    clientGeneratedId: { type: String },
    readBy: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageModel);

module.exports = Message;