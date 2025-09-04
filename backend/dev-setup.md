# Local Development Setup

## **1. Create .env file in backend folder:**

```env
# Database Configuration - Replace with your actual MongoDB URI
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Configuration - Generate a random string
JWT_SECRET=mySuperSecretJWTKey123!@#$%^&*()_+ABCDEFGHIJKLMNOP

# Session Configuration - Generate a different random string
SESSION_SECRET=mySuperSecretSessionKey456!@#$%^&*()_+QRSTUVWXYZ

# Environment
NODE_ENV=development

# Port (local development)
PORT=5000

# Frontend URL (for CORS - local development)
FRONTEND_URL=http://localhost:3000
```

## **2. Install Dependencies:**

```bash
cd backend
npm install
```

## **3. Start Backend:**

```bash
npm run dev
```

## **4. Start Frontend (in another terminal):**

```bash
cd frontend
npm start
```

## **What This Setup Gives You:**

✅ **Local Backend** running on `http://localhost:5000`
✅ **Local Frontend** running on `http://localhost:3000`
✅ **CORS configured** for local development
✅ **Environment variables** for local development
✅ **MongoDB sessions** working locally
✅ **All API endpoints** accessible locally

## **5. Create Test User (Optional but Recommended):**

```bash
npm run seed:test
```

This creates a test user for easy testing:
- **Email:** `test@example.com`
- **Password:** `test123456`
- **Username:** `TestUser`

You can use these credentials to log in and test messaging functionality immediately!

## **Important Notes:**

- **Replace `MONGO_URI`** with your actual MongoDB connection string
- **Generate unique secrets** for JWT_SECRET and SESSION_SECRET
- **Never commit .env file** to GitHub
- **Backend will use localhost:3000** for CORS in development
- **Production will use Vercel domains** for CORS
