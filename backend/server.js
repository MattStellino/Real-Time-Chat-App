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
const MongoStore = require('connect-mongo');
const { notFound, errorHandler } = require('./middleware/error')
const cors = require('cors');
dotenv.config();

// Check required environment variables
const jwtSecret = process.env.JWT_SECRET;
const sessionSecret = process.env.SESSION_SECRET;
const mongoUri = process.env.MONGO_URI;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is required');
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
        console.log(`Rate limit exceeded for IP ${ip}: ${userData.count}/${maxRequests} requests`);
        return res.status(429).json({ 
          error: 'Too many requests, please try again later.',
          retryAfter: Math.ceil((userData.resetTime - now) / 1000)
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
// Secure CORS configuration - Allow your Vercel frontend domains and local development
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      "https://live-chat-app-swart.vercel.app",
      "https://live-chat-ldpdwrg9y-mattstellinos-projects.vercel.app",
      "https://live-chat-clnalfdz9-mattstellinos-projects.vercel.app"
    ]
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight OPTIONS requests properly
app.options('*', cors());

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: mongoUri,
    collectionName: 'sessions'
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());


// Health check endpoint
app.get('/', (req, res) => {
    res.send('Api is running')
});

// Apply rate limiting - More generous for chat app
app.use('/api/user', simpleRateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes
app.use('/api/message', simpleRateLimit(500, 60 * 1000)); // 500 requests per minute
app.use('/api/chat', simpleRateLimit(500, 60 * 1000)); // 500 requests per minute

// API route mounting
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  // Server startup logging (production safe)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server is running on PORT ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  }
})