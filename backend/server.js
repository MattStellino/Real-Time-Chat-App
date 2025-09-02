// Express server setup for real-time chat application
// Configures middleware, routes, and database connection
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')
const chatRoutes = require('./routes/chatRoutes')
const passport = require('./config/passportConfig'); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const { notFound, errorHandler } = require('./middleware/error')
const cors = require('cors');
dotenv.config();

// Check required environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Simple in-memory rate limiting (basic protection)
const requestCounts = new Map();

const simpleRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      const userData = requestCounts.get(ip);
      if (now > userData.resetTime) {
        userData.count = 1;
        userData.resetTime = now + windowMs;
      } else {
        userData.count++;
      }
      
      if (userData.count > maxRequests) {
        return res.status(429).json({ 
          error: 'Too many requests, please try again later.' 
        });
      }
    }
    next();
  };
};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Every hour


connectDB();

const app = express();
// Secure CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL, 'https://live-chat-6qzymnh7z-mattstellinos-projects.vercel.app'].filter(Boolean)
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin, 'Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: jwtSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


// Health check endpoint
app.get('/', (req, res) => {
    res.send('Api is running')
});

// Apply rate limiting
app.use('/api/user', simpleRateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes
app.use('/api/message', simpleRateLimit(30, 60 * 1000)); // 30 requests per minute

// API route mounting
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  // Server startup logging (production safe)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server is running on PORT ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  }
})