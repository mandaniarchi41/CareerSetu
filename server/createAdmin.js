const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const adminEmail = 'admin@careersetu.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: 'adminpassword',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully:');
      console.log('Email: admin@careersetu.com');
      console.log('Password: adminpassword');
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log('Admin user already exists, updated role to admin.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });
