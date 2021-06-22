const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { 
        type: String,
         required: true 
        },
    email: { 
        type: String,
        required: true,
        unique:true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,

    },
    
    password: { 
        type:String, 
        required: true 
    },
    phone: { 
        type:Number,
        required:true 
    },
    matricule : { 
        type:String,
        required: false 
        },
    confirmCode: {
        type: String,
        unique: true,
    },
    status: {
        type: Boolean, 
        default: false
    },
    isBlocked: {
        type:Boolean, 
        default: false
    },
    isAdmin: {
        type:Boolean,
        default: false 
    },
    sold: {
        type: Number,
        default: 0
    },
    reservations: [],

    /*

    
    
    
*/
});

module.exports = mongoose.model('User', userSchema);