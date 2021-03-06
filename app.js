const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require("mongoose");
const bodyParer = require('body-parser')

const parkingsRoutes = require('./api/routes/parkings');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

mongoose.connect('mongodb+srv://ydays:'+ process.env.MONGO_ATLAS_PW +'@cluster0.feqev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);

mongoose.Promise = global.Promise;


app.use(morgan('dev'));
app.use( '/uploads', express.static('uploads'));
app.use(bodyParer.urlencoded({extended: false}));
app.use(bodyParer.json());



app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


// Routes which will handle requests

app.use('/parkings', parkingsRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next)=>{

    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;