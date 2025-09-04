// Test User Seeder Script
// Creates a test user for easy testing of the chat application
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
require('dotenv').config();

const TEST_USER = {
  username: 'TestUser',
  email: 'test@example.com',
  password: 'test123456',
  pic: 'https://via.placeholder.com/150/007bff/ffffff?text=TU' // Test User avatar
};

const connectDB = async () => {
  try {
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
    process.exit(1);
  }
};

const seedTestUser = async () => {
  try {
    console.log('🌱 Starting test user seeding...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: TEST_USER.email });
    
    if (existingUser) {
      console.log('⚠️  Test user already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Username:', existingUser.username);
      console.log('🔑 Password: test123456');
      console.log('🆔 User ID:', existingUser._id);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    
    // Create the test user
    const testUser = new User({
      username: TEST_USER.username,
      email: TEST_USER.email,
      password: hashedPassword,
      pic: TEST_USER.pic,
    });

    await testUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('👤 Username:', testUser.username);
    console.log('🔑 Password: test123456');
    console.log('🆔 User ID:', testUser._id);
    console.log('');
    console.log('🎯 You can now use these credentials to test the app:');
    console.log('   Email: test@example.com');
    console.log('   Password: test123456');
    
  } catch (error) {
    console.error('❌ Error seeding test user:', error.message);
    process.exit(1);
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedTestUser();
  console.log('🏁 Seeding completed!');
  process.exit(0);
};

// Run the seeder
runSeeder();
