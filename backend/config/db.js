const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to the local MongoDB instance and specifically the 'jobportal' database
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected Successfuly: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
