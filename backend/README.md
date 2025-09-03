# Chat App Backend

This is the backend API for the real-time chat application, configured for deployment on Render.

## Environment Variables

Set these environment variables in your Render dashboard:

- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `SESSION_SECRET`: A secure random string for session signing
- `NODE_ENV`: Set to "production"
- `PORT`: Render will set this automatically

## Deployment Steps

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Set the following:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if deploying from root repo)
4. **Add environment variables** as listed above
5. **Deploy!**

## Local Development

```bash
cd backend
npm install
npm run dev
```

## Production Notes

- The server listens on `0.0.0.0` to accept connections from Render's load balancer
- CORS is configured to allow your frontend domain
- Rate limiting is enabled for API protection
- File uploads are served from the `/uploads` directory
