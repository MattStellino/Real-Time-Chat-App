const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MONGO_URI environment variable is set
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
            
        console.log(`✅ MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`❌ Connection failed. Please check your MONGO_URI environment variable.`);
    process.exit(1);
  }
};

module.exports = connectDB;
