const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected for Cleanup');
    
    // Wipe all existing users (mock students and recruiters)
    await User.deleteMany();
    console.log('All existing user accounts deleted.');

    // Automatically provision a default Admin account
    // since we didn't have one before and we need it for the Admin Dashboard
    await User.create({
        fullname: 'System Admin',
        email: 'admin@jobportal.com',
        phoneNumber: 1111111111,
        password: 'adminpassword',
        role: 'admin'
    });

    console.log('Admin account provisioned: admin@jobportal.com / adminpassword');
    console.log('User Database is now clean! New registrations will appear perfectly.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
