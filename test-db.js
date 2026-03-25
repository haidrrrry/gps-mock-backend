const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./api/helpers/User');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const email = 'test@test.com';
        const user = await User.findOne({ email });
        console.log('Current Limit before:', user.deviceLimit);

        const res = await User.updateOne({ _id: user._id }, { $inc: { deviceLimit: -1 } });
        console.log('Update result:', res);

        const user2 = await User.findOne({ email });
        console.log('Current Limit after:', user2.deviceLimit);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
