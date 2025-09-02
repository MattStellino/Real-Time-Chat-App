// User model schema for authentication and profile data
// Stores username, email, and hashed password with timestamps
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    // Optional profile fields
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 160 },
    // User preferences
    preferences: {
        theme: { 
            type: String, 
            enum: ['system', 'light', 'dark'], 
            default: 'system' 
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: false },
            sound: { type: Boolean, default: true }
        },
        chat: {
            readReceipts: { type: Boolean, default: true },
            autoScroll: { type: Boolean, default: true }
        }
    }
},
{
    timestamps: true
});

// Method to compare the entered password with the hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model('User', userSchema);

module.exports = User ;
