# Test User Guide 🧪

## **Quick Testing Setup**

For easy testing of the chat application, we've included a test user seeder that creates a pre-configured user account.

### **Creating the Test User**

Run this command in the backend directory:

```bash
npm run seed:test
```

### **Test User Credentials**

Once the seeder runs, you can use these credentials to log in:

- **Email:** `test@example.com`
- **Password:** `test123456`
- **Username:** `TestUser`

### **What You Can Test**

With the test user, you can immediately test:

✅ **User Authentication**
- Login with the test credentials
- Verify user profile loads correctly

✅ **Chat Functionality**
- Create new chats with other users
- Send and receive messages
- Test real-time messaging

✅ **Group Chat Features**
- Create group chats
- Add/remove users from groups
- Test group messaging

✅ **File Sharing**
- Upload images and videos
- Test file attachment functionality

✅ **Search Features**
- Search for other users
- Test user discovery

### **Creating Multiple Test Users**

To test messaging between users, you can:

1. **Register additional users** through the app interface
2. **Use the test user** to start chats with new users
3. **Test group chats** with multiple participants

### **Test User Features**

The test user includes:
- Pre-configured avatar
- Standard user permissions
- All chat features enabled
- Ready for immediate testing

### **Resetting the Test User**

If you need to reset the test user:

1. Delete the user from your database, or
2. Run the seeder again (it will detect existing user and show current credentials)

### **Production Note**

⚠️ **Important:** The test user is only for development/testing. Make sure to:
- Remove test users before production deployment
- Use proper user registration in production
- Never use test credentials in production environments

### **Troubleshooting**

If the seeder fails:
1. Check your MongoDB connection
2. Verify your `.env` file has correct `MONGO_URI`
3. Ensure the backend dependencies are installed
4. Check that the database is accessible

### **Example Usage**

```bash
# 1. Start the backend
cd backend
npm run dev

# 2. Create test user (in another terminal)
npm run seed:test

# 3. Start the frontend
cd ../frontend
npm start

# 4. Open browser to http://localhost:3000
# 5. Login with test@example.com / test123456
# 6. Start testing!
```

Happy testing! 🚀
