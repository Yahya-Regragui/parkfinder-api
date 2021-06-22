const express = require('express');
const router = express.Router();
const multer = require("multer");
const checkAuth = require('../middleware/check-auth');
const ParkingsController = require('../controllers/parkings')

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
    
    
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const Parking = require("../models/parking");


router.get('/',checkAuth, ParkingsController.parkings_get_all);
router.post('/', checkAuth, upload.single('parkingImage'), ParkingsController.parkings_create_parking);

router.get('/available',checkAuth, ParkingsController.getAvailablePlaces);


router.get('/:parkingId', checkAuth,ParkingsController.parkings_get_parking );

router.patch('/:parkingId', checkAuth,ParkingsController.parkings_update_parking);
router.delete('/:parkingId', checkAuth,ParkingsController.parkings_delete_parking);

module.exports = router;