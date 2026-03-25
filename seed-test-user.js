const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./api/helpers/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'test@test.com';
        const password = 'test123';
        
        // Check if user already exists
        let user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            console.log('User already exists, updating password and limit...');
            user.password = hashedPassword;
            user.deviceLimit = 3;
            user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
            await user.save();
        } else {
            console.log('Creating new test user...');
            user = new User({
                email,
                password: hashedPassword,
                deviceLimit: 3,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            await user.save();
        }

        console.log('Test user seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding user:', err);
        process.exit(1);
    }
}

seed();
