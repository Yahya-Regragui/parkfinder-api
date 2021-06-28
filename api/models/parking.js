const mongoose = require("mongoose");

const parkingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { 
        type: String, 
        required: true 
    },
    location_y: { 
        type: String, 
        required: true 
    },
    location_x: { 
        type: String, 
        required: true 
    },
    parkingImage: {
        type: String,
         required: true
        },
    description: {
        type: String,
         required: true
        },
    totalPlace: {
        type: Number,
        required: true
        },
    reservedPlace: {
        type: Number,
        default: 0
    },
    availablePlace: {
        type: Number,
        default: 50
    }
});

module.exports = mongoose.model('Parking', parkingSchema);
