const mongoose = require('mongoose');

module.exports = (client) => {
    mongoose
        .connect(
            process.env.MONGODB_URL || 'mongodb+srv://Aluxit:SadeqHosseini1387@aluxit.f5xgdpv.mongodb.net/?appName=Aluxit',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )
        .then(() => console.log('Mongo Connected'))
        .catch((err) => console.log('MongoDB connection error:', err));
};
