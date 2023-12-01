const mongoose = require('mongoose');
const User = require('./User');

const connect = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {});
        console.log('Database connected successfully');
    } catch (err) {
        console.log(err);
    }
};



mongoose.connection.on('error', err => {
    console.log(err);
});

module.exports = {
    connect,
}