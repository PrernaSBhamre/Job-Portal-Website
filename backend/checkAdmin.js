const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config({ path: __dirname + '/.env' }); // explicit path

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Admin.countDocuments();
    console.log('ADMIN COUNT:', count);
    process.exit();
};
check();
