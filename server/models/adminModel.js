const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
    
});

const Admin  = new mongoose.model('admins', adminSchema);

module.exports = Admin;