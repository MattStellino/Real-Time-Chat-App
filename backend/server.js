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
const jwtSecret = process.env.JWT_SECRET;


connectDB();

const app = express();
app.use(cors());

app.use(express.json());

app.use(session({
  secret: jwtSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
    res.send('Api is running')
});

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server is running on PORT ${PORT}`))