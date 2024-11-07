const mongoose = require('mongoose');


const connectDb = () => {

    const connect = mongoose.connect(process.env.CONNECTION_STRING);

    connect.then(() => { 
        console.log('Connected to Database.');
    }).catch(() => {
        console.log('Database connection failed!');
    });

};

module.exports = connectDb;
