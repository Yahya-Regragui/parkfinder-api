const Parking = require("../models/parking");
const mongoose = require("mongoose");
const axios = require("axios")

exports.parkings_get_all = (req, res, next)=> {
    Parking.find()
    .select('-__v')
    .exec()
    .then(docs =>{
        const response = 
             docs.map(doc => {
                return {
                    name: doc.name,
                    description: doc.description,
                    total_spots: doc.totalPlace,
                    reserved_spots: doc.reservedPlace,
                    location_x:  doc.location_x,
                    location_y:  doc.location_y,
                    parkingImage: doc.parkingImage,
                    _id: doc._id
                }
            })
        ;
        res.status(200).json(response);
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    })
}



exports.getAvailablePlaces = async (req, res) => {
    const response = await axios.get('http://192.168.137.2:80')
      console.log(response.data);
      await Parking.updateOne(
        { "_id" : mongoose.Types.ObjectId("60cc62b6105ed4352086a361")},
        {
          $set: { "availablePlace": response.data.detection},
        }
     )
       res.status(200).json(response.data)
        
}






exports.parkings_create_parking = (req, res, next)=> {
    let name = req.body.name
    let location_x = req.body.location_x
    let location_y = req.body.location_y
    let description = req.body.description
    let totalPlace = req.body.totalPlace
    if (name === "" || name == null){
        return res.status(401).json({
            message: 'le nom du parking est requis'
        });
    } 
    if (location_x === "" || location_x == null){
        return res.status(401).json({
            message: 'parking location_x est requis'
        });
    } 
    if (location_y === "" || location_y == null){
        return res.status(401).json({
            message: 'parking location_y est requis'
        });
    } 
    if (description === "" || description == null){
        return res.status(401).json({
            message: 'la description du parking est requise'
        });
    } 
    if (totalPlace === "" || totalPlace == null){
        return res.status(401).json({
            message: 'parking totalPlace est requis'
        });
    } 
    const parking = new Parking({
        _id: new mongoose.Types.ObjectId(), 
        name: req.body.name,
        description: req.body.description,
        parkingImage: req.file.path,
        totalPlace: req.body.totalPlace,
        location_x:  req.body.location_x,
        location_y:  req.body.location_y,
    });
    parking
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Parking créé avec succès !',
                createdParking: {
                    name: result.name,
                    location_x: result.location_x,
                    location_y: result.location_y,
                    description: result.description,
                    _id: result._id,
                    parkingImage: result.parkingImage,
                    totalPlace: result.totalPlace,
                    
                }
            });
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err.message
        }); 
    });
    
}

exports.parkings_get_parking = (req, res, next)=> {
    const id = req.params.parkingId;
    Parking.findById(id)
    .select("-__v")
    .exec()
    .then(doc => {
        console.log("From Database", doc);
        if (doc) {
            res.status(200).json(
                doc,
                
            );
        } else {
            res.status(404).json({message: 'No valid entry found for provided ID'})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});

    });
}

exports.parkings_update_parking = async (req, res, next)=> {
    const id = req.params.parkingId;
    //const updateOps = {};
    //for (const ops of req.body){
      //  updateOps[ops.propName] = ops.value;
    //}
    let name = req.body.name
    let location_x = req.body.location_x
    let location_y = req.body.location_y
    let description = req.body.description
    let totalPlace = req.body.totalPlace
    if (name === "" || name == null){
        return res.status(401).json({
            message: 'le nom du parking est requis'
        });
    } 
    if (location_x === "" || location_x == null){
        return res.status(401).json({
            message: 'parking location_x est requis'
        });
    } 
    if (location_y === "" || location_y == null){
        return res.status(401).json({
            message: 'parking location_y est requis'
        });
    } 
    if (description === "" || description == null){
        return res.status(401).json({
            message: 'la description du parking est requise'
        });
    } 
    if (totalPlace === "" || totalPlace == null){
        return res.status(401).json({
            message: 'parking totalPlace est requis'
        });
    } 
    let userData = {
        name,
        description,
        location_x,
        location_y,
        totalPlace
      }
      await Parking.findByIdAndUpdate(id, userData, {
        new: true,
        useFindAndModify: false
      })
    .exec()
    .then( result => {
     console.log(result);
     res.status(200).json({
         message: 'Parking mis à jour',
         
     });
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    }
    );
 }

 exports.parkings_delete_parking = (req, res, next)=> {
    const id = req.params.parkingId;
     Parking.remove({_id: id})
     .exec()
     .then(result => {
         res.status(200).json({
             message: 'Parking supprimé',
             
         });
     })
     .catch(err => {
         console.log(err);
         res.status(500).json({
             error : err
         })
     });
 }