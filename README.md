# 🚀 Real-Time Chat Application

A modern, full-stack real-time chat application built with React, Node.js, and Socket.IO.

## ✨ Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT
- **Group chat management**
- **File upload capabilities**
- **Mobile-responsive design**
- **Chrome desktop notifications**
- **Modern React architecture** with Redux
- **Professional UI** with PrimeReact components

## 🛠️ Tech Stack

### Frontend
- React 18 with Hooks
- Redux Toolkit for state management
- PrimeReact for UI components
- Socket.IO client for real-time communication
- Responsive CSS with modern design

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT authentication
- Passport.js for session management
- Multer for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/real-time-chat-app.git
cd real-time-chat-app
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**
```bash
# Create .env file in root directory
NODE_ENV=development
JWT_SECRET=your-local-dev-secret-key
MONGODB_URI=mongodb://127.0.0.1:27017/chatapp
FRONTEND_URL=http://localhost:3000
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

5. **Create a test user (optional but recommended)**
```bash
cd backend
npm run seed:test
```
This creates a test user with credentials:
- **Email:** `test@example.com`
- **Password:** `test123456`

6. **Open your browser**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Deploy Backend**
```bash
npm install -g vercel
vercel --prod
```

2. **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

3. **Set environment variables in Vercel dashboard**
- `NODE_ENV=production`
- `JWT_SECRET=your-production-secret`
- `MONGODB_URI=mongodb+srv://...`
- `FRONTEND_URL=https://your-frontend-url.vercel.app`

## 📱 Features Overview

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing

### Chat Features
- Real-time messaging
- Group chat creation and management
- File and image sharing
- Read receipts
- Typing indicators

### User Experience
- Responsive design for all devices
- Modern, intuitive interface
- Real-time notifications
- Search functionality

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-url.vercel.app
REACT_APP_SOCKET_URL=https://your-backend-url.vercel.app
REACT_APP_ENVIRONMENT=production
```

## 📁 Project Structure

```
real-time-chat-app/
├── backend/                 # Node.js backend
│   ├── config/             # Database and passport config
│   ├── middleware/         # Auth and error middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── Components/     # React components
│   │   ├── actions/        # Redux actions
│   │   ├── reducers/       # Redux reducers
│   │   ├── config/         # Configuration files
│   │   └── services/       # API and socket services
│   └── public/             # Static assets
├── uploads/                # File uploads
├── .gitignore             # Git ignore rules
├── package.json            # Root package.json
└── README.md              # This file
```

## 🧪 Testing

### Quick Testing with Test User

For immediate testing, use the pre-created test user:

```bash
# Create test user
cd backend
npm run seed:test
```

**Test User Credentials:**
- **Email:** `test@example.com`
- **Password:** `test123456`

### Automated Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if implemented)
npm test
```

### Manual Testing Features

With the test user, you can immediately test:
- ✅ User authentication and login
- ✅ Real-time messaging
- ✅ Group chat creation
- ✅ File uploads (images/videos)
- ✅ User search functionality
- ✅ Chat management features

## 📊 Performance

- Optimized bundle size
- Lazy loading for components
- Efficient state management
- Real-time updates with minimal latency

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- Secure file uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- PrimeReact for beautiful UI components
- Socket.IO for real-time communication
- MongoDB for database
- Express.js for backend framework

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using modern web technologies**
