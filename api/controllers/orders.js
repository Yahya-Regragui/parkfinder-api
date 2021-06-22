const Order = require("../models/order");
const Parking = require("../models/parking");
const mongoose = require('mongoose');

exports.orders_get_all =   (req, res, next) => {
    Order.find()
    .select('parking quantity _id')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders' + docs._id
            }

        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.orders_create_order = (req, res, next) => {
    Parking.findById(req.body.parkingId)
    .then(parking => {
        if (!parking){
            return res.status(404).json({
                message: "Parking Not Found"
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            parking: req.body.parkingId
        });
        return order.save();
        
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order stored',
            createdOrder:{
                _id: result._id,
                parking: result.parking,
                quantity: result.quantity
            },
            request:{
                type: 'GET',
                url: 'http://localhost:3000/orders' + result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    }

    exports.orders_get_order = (req, res, next) => {
        Order.findById(req.params.orderId)
        .exec()
        .then(order => {
            if (!order){
                return res.status(404).json({
                    message: 'Order Not Found'
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            });
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
    }

exports.orders_delete_order = (req, res, next) => {
    Order.remove({ _id: req.params.orderId})
    .exec()
    .then(result => {
        res.status(200).json({
            message:'Order Deleted',
            request: {
                type: "POST",
                url: "http://localhost:3000/orders",
                body: {parkingId:'ID', quantity: 'Number'}
            }
        });
    } )
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};