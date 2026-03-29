const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected correctly.');

    // Remove any existing admin
    await Admin.deleteMany({});
    
    // Also remove from User if they mistakenly signed up there
    await User.deleteMany({ email: 'admin@fresherhub.in' });

    // Create the Admin
    const admin = new Admin({
      email: 'admin@fresherhub.in',
      password: 'password123'
    });

    await admin.save();
    
    console.log('✅ Admin Generated Successfully!');
    console.log('Login Email: admin@fresherhub.in');
    console.log('Login Password: password123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
