const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Parking = require('../models/parking');
const nodemailer = require("../middleware/nodemailer.config");
const ObjectId = mongoose.Types.ObjectId;


exports.user_signup = (req, res, next) => {
    
    const token = jwt.sign({email: req.body.email},"password")
    let confirmPassword = req.body.confirmPassword;
    let password = req.body.password;
    let username = req.body.username;
    let email = req.body.email;
    let phone = req.body.phone;
    let matricule = req.body.matricule;

    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >= 1){
            return res.status(409).json({
                message: 'L\'adresse e-mail existe déjà!'
            });
        }
        if(username === "" || username == null) {
            return res.status(409).json({
                message: "Nom d'utilisateur requis"
            });
        }
        if(email === "" || email == null) {
            return res.status(409).json({
                message: "l'e-mail est requis"
            });
        }
        if(phone === "" || phone == null) {
            return res.status(409).json({
                message: "le numéro de téléphone est requis"
            });
        }
        if(password === "" || password == null) {
            return res.status(409).json({
                message: "Mot de passe requis"
            });
        }
        
        
        if(confirmPassword != password || confirmPassword == null) {
            return res.status(409).json({
                message: "le mot de passe ne correspond pas"
            });
        }
        
         else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        username: req.body.username,
                        email: req.body.email,
                        password: hash,
                        phone: req.body.phone,
                        matricule: req.body.matricule,
                        confirmCode: token
                    });
                    user
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: "L'utilisateur a été enregistré avec succès ! Merci de consulter votre email"
                        });
                    })
                     .catch(err => {
                         console.log(err);
                         res.status(500).json({
                             error: err
                         });
                     });
                     nodemailer.sendConfirmationEmail(
                        user.username,
                        user.email,
                        user.confirmCode
                 );
                }
            });
        }
    });
    
}

exports.user_login = (req, res, next) => {
   
    let email = req.body.email;
    let password = req.body.password;
    User.find({ email: req.body.email}, )
    .exec()
    .then(user => {
        
        if(email === "" || email == null) {
            return res.status(409).json({
                message: "l'e-mail est requis"
            });
        }
        if(password === "" || password == null) {
            return res.status(409).json({
                message: "Mot de passe requis"
            });
        }
        if (user.length < 1 ){
            return res.status(401).json({
                message: "Le mot de passe ou l'e-mail est incorrect"
            });
        };
        if (user[0].status == false ){
            return res.status(401).json({
                message: 'Vous devez confirmer votre email'
            });
        };
        if (user[0].isBlocked == true ){
            return res.status(401).json({
                message: 'Votre compte est bloqué'
            });
        };

        
        
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            
            if (err){
                return res.status(401).json({
                    message:" Le mot de passe ou l'e-mail est incorrect"
                });
            }
            
            
            
            if (result){
                const token = jwt.sign({
                    email: user[0],
                    userId: user[0]._id
                },  
                
                process.env.JWT_KEY
                );
                return res.status(200).json({
                    message: 'Authentification réussie',
                    username: user[0].username,
                    token: token,
                    id : user[0]._id
                });
            }
            
            return res.status(401).json({
                message: "Le mot de passe ou l'e-mail est incorrect"
            });
            
        });
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}
exports.admin_login = (req, res, next) => {
   
    let email = req.body.email;
    let password = req.body.password;
    User.find({ email: req.body.email}, )
    .exec()
    .then(user => {
        
        if(email === "" || email == null) {
            return res.status(409).json({
                message: "l'e-mail est requis"
            });
        }
        if(password === "" || password == null) {
            return res.status(409).json({
                message: "Le mot de pass est requis"
            });
        }
        if (user.length < 1 ){
            return res.status(401).json({
                message: "Le mot de passe ou l'e-mail est incorrect"
            });
        };
        if (user[0].status == false ){
            return res.status(401).json({
                message: 'Vous devez confirmer votre email'
            });
        };
        if (user[0].isBlocked == true ){
            return res.status(401).json({
                message: 'Votre compte est bloqué'
            });
        };
        if (user[0].isAdmin == false ){
            return res.status(401).json({
                message: "Votre compte n'est pas administrateur"
            });
        };

        
        
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            
            if (err){
                return res.status(401).json({
                    message: "Le mot de passe ou l'e-mail est incorrect"
                });
            }
            
            
            
            if (result){
                const token = jwt.sign({
                    email: user[0],
                    userId: user[0]._id
                },  
                
                process.env.JWT_KEY
                );
                return res.status(200).json({
                    message: 'Authentification réussie',
                    username: user[0].username,
                    token: token,
                    id : user[0]._id
                });
            }
            
            return res.status(401).json({
                message: "Le mot de passe ou l'e-mail est incorrect"
            });
            
        });
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.user_delete = (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Utilisateur supprimé'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        }); 
    });
}

exports.user_verify = (req, res, next) => {
    User.findOne({
      confirmCode: req.params.confirmCode,
    })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: "Utilisateur non trouvé." });
        }
  
        user.status = true;
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
        });
      })
      .catch((e) => console.log("error", e));
  };

exports.reservation = async (req, res) => {

    // Check if user is not blocked
    let user = await User.findById(req.user.userId, {
        reservations: 1,
        username: 1,
        email: 1,
        isBlocked: 1,
        sold : 1
    })

    
    let arrivalTime = req.body.arrivalTime
    let departureTime = req.body.departureTime
    let scanned = 0
    let parkingId = req.body.parkingId
    let parkingName = req.body.parkingName
    let username = user.username
    let id = ObjectId()
    let qrCode = id.toString()
    let date = new Date().toISOString()
    let carNumber = req.body.carNumber
    if(arrivalTime === "" || arrivalTime == 'null'){
        return res.status(400).json({ message: "L'heure d'arrivée est requise"})
      }
    if(parkingId === "" || parkingId == null){
        return res.status(400).json({ message: "ParkingId est requis"})
      }
    if(carNumber === "" || carNumber == null){
        return res.status(400).json({ message: "Le numéro de voiture est requis"})
      }
      
    // Save user receipt
    let regExTimeArrival = /([0-9]?[0-9]):([0-9][0-9])/;
    let regExTimeArrArrival = regExTimeArrival.exec(arrivalTime);
    let timeHrArrival = regExTimeArrArrival[1] * 3600 ;
    let timeMinArrival = regExTimeArrArrival[2] * 60 ;
    let timeMsArrival = timeHrArrival + timeMinArrival;
    
    
    let timeMsDeparture
    if(departureTime == 'null'){
        departureTime = null;
    }
    if(departureTime != null){
    let regExTimeDeparture = /([0-9]?[0-9]):([0-9][0-9])/;
    let regExTimeArrDeparture = regExTimeDeparture.exec(departureTime);
    let timeHrDeparture = regExTimeArrDeparture[1] * 3600 ;
    let timeMinDeparture = regExTimeArrDeparture[2] * 60 ;
    timeMsDeparture = timeHrDeparture + timeMinDeparture;
    timeMsDeparture = timeMsDeparture
   
    }
    
    let reservation = { id, date, arrivalTime, departureTime, scanned, parkingId, parkingName, qrCode, carNumber, username }
    user.reservations.push(reservation)
    
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    let regExTimeToday = /([0-9]?[0-9]):([0-9]?[0-9])/;
    let regExTimeArrToday = regExTimeToday.exec(time);
    let timeHrToday = regExTimeArrToday[1] * 3600 ;
    let timeMinToday = regExTimeArrToday[2] * 60 ;
    let timeMsToday = timeHrToday + timeMinToday;
    
    user.sold = user.sold - 2
    let placeAvailable = await Parking.findOne(
      { "_id" : mongoose.Types.ObjectId(parkingId)},
      
       { "reservedPlace": 1, "totalPlace": 1, "availablePlace":1 },
      
   )
    if(user.sold < 0){
      return res.status(400).json({ message: "Veuillez recharger votre compte"})
    }
    
  
    if(placeAvailable.reservedPlace == placeAvailable.totalPlace || placeAvailable.availablePlace == 0){
      return res.status(400).json({ message: "Toutes les places ont été réservées"})
    }
    
    if(departureTime != null){
    if(timeMsArrival > timeMsDeparture){
      return res.status(400).json({ message: "Le départ doit être après l'arrivée"})
    }
  }
    if(timeMsArrival < timeMsToday || timeMsArrival > timeMsToday + 3600){
      return res.status(400).json({ message: "Vous ne pouvez réserver qu'une heure à l'avance"})
    }
  
    
  
    else{
    await user.save()
    await Parking.updateOne(
      { "_id" : mongoose.Types.ObjectId(parkingId)},
      {
        $inc: { "reservedPlace": 1 },
      }
   )
   
  
    return res.status(200).json({ message: "Réservation réussie", id })
  }
  }

exports.getQr = async (req, res) => {
    let id = req.params.id
    let user = await User.find();
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    let regExTimeToday = /([0-9]?[0-9]):([0-9]?[0-9])/;
    let regExTimeArrToday = regExTimeToday.exec(time);
    let timeHrToday = regExTimeArrToday[1] * 3600 ;
    let timeMinToday = regExTimeArrToday[2] * 60 ;
    let timeMsToday = timeHrToday + timeMinToday;
  
  
    let db_product = await User.findOne({"reservations.id" :   mongoose.Types.ObjectId(id)}, {"reservations.$" : 1, "sold" : 1} )
    let regExTimeArrival = /([0-9]?[0-9]):([0-9][0-9])/;
    let regExTimeArrArrival = regExTimeArrival.exec(db_product.reservations[0]['arrivalTime']);
    let timeHrArrival = regExTimeArrArrival[1] * 3600 ;
    let timeMinArrival= regExTimeArrArrival[2] * 60 ;
    let timeMsArrival = timeHrArrival + timeMinArrival;  
  
    let timeMsDeparture
    if(db_product.reservations[0]['departureTime'] != null){
    let regExTimeDeparture = /([0-9]?[0-9]):([0-9][0-9])/;
    let regExTimeArrDeparture = regExTimeDeparture.exec(db_product.reservations[0]['departureTime']);
    let timeHrDeparture = regExTimeArrDeparture[1] * 3600 ;
    let timeMinDeparture= regExTimeArrDeparture[2] * 60 ;
    timeMsDeparture = timeHrDeparture + timeMinDeparture;
    }
    if (db_product == null || db_product.reservations[0]['scanned'] >= 2) {
        return res.status(400).json({ message: "Code QR invalide" })
      }if(timeMsArrival > timeMsToday + 900 || timeMsArrival < timeMsToday - 900){
        return res.status(400).json({ message: "Heure non valide" })
      }
      else{

        await User.updateOne(
            { "reservations.id" : mongoose.Types.ObjectId(id)},
            {
              $set: { "reservations.$.arrivalTime": time },
            }
         )
       
       await User.updateOne(
          { "reservations.id" : mongoose.Types.ObjectId(id)},
          {
            $inc: { "reservations.$.scanned": 1 },
          }
       )
       if(db_product.reservations[0]['scanned'] == 1){
        departureTime = db_product.reservations[0]['departureTime'] ? timeMsDeparture: timeMsToday;
        
        if(timeMsDeparture < timeMsToday + 600){
          return res.status(400).json({ message: "Temps écoulé" })
        }
        let spentTime = (departureTime - timeMsArrival) * 0.001
        if(spentTime > db_product.sold){
          return res.status(400).json({ message: "Solde insuffisant Veuillez recharger le compte" })
        }
        
        if(spentTime > 0){
          await User.updateOne(
            { "reservations.id" : mongoose.Types.ObjectId(id)},
            {
              $inc: { "sold": -spentTime },
            }
         )
        }
       await Parking.updateOne(
        { "_id" : mongoose.Types.ObjectId(db_product.reservations[0]['parkingId'])},
        {
          $inc: { "reservedPlace": -1 },
        }
     )
   
        await User.updateOne(
            { "reservations.id" : mongoose.Types.ObjectId(id)},
            {
              $set: { "reservations.$.departureTime": time },
            }
         )

     
      }
      if(db_product.reservations[0]['scanned'] == 0){
        return res.status(200).json({ message: "Bienvenue au parking" })
      }else{
        return res.status(200).json({ message: "À la prochaine!" })
      }
      
    }
   
  }

exports.getReservation = async (req, res) => {

    let user = await User.findById(req.user.userId,{
      reservations: 1,
      username: 1,
      email: 1,
      isBlocked: 1,
      sold : 1
  })
  
  const sortedReservations = user.reservations.sort(function(a,b){
    return new Date(b.date) - new Date(a.date);
  });

  return res.status(200).json(
                
                   sortedReservations.slice(0, 10)
                )

  }
exports.getSold = async (req, res) => { 

    let user = await User.findById(req.user.userId, {
      sold : 1
  })
  
  return res.status(200).json({
                   sold : user.sold
                });

  }

exports.updateSold = async (req, res) => { 

    let user = await User.findById(req.user.userId, {
      sold : 1
  })
  let addSold = req.body.addSold;
  await User.updateOne(
    { "_id" : mongoose.Types.ObjectId(user._id)},
    {
      $inc: { "sold": addSold },
    }
 )
  return res.status(200).json({
                   message : "votre solde a été rechargé avec succès"
  });

  }

exports.get_all_users = (req, res, next) => {
    User.find()
    .select('-__v')
    .exec()
    .then(docs =>{
        const response = 
            docs.map(doc => {
                return {
                    username: doc.username,
                    email: doc.email,
                    matricule: doc.matricule,
                    phone: doc.phone,
                    isBlocked:  doc.isBlocked,
                    isAdmin:  doc.isAdmin,
                    sold: doc.sold,
                    reservations: doc.reservations.length,
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
exports.get_all_reservations = async (req, res, next) => {
    /*User.find()
    .select('-__v')
    .exec()
    .then(docs =>{
        const response = {
            reservations: docs.map(doc => 
                 doc.reservations,
            )
        };
        res.status(200).json(response.reservations);
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    })*/
    let users = await User.find()
    let reservations = []
    users.forEach(user => {
        user.reservations.forEach(reservation => {
            reservations.push({username: user.username , date : reservation.date, arrivalTime : reservation.arrivalTime, departureTime : reservation.departureTime, scanned : reservation.scanned, parkingName : reservation.parkingName, carNumber : reservation.carNumber})
        })
    })

    res.json(reservations)
}

exports.block_user= async (req, res, next) => {
    let id = req.params.id
    let user = await User.findById(id, {
        isBlocked : 1,
        username : 1
    })
    if (user.isBlocked == true){
        return res.status(400).json(
            user.username + " est déjà bloqué"
         );
    }
    await User.updateOne(
        { "_id" : mongoose.Types.ObjectId(id)},
        
         { "isBlocked": true },
        
     )

    return res.status(200).json(
        user.username + " est bloqué"
     );

}
exports.activate_user= async (req, res, next) => {
    let id = req.params.id
    let user = await User.findById(id, {
        isBlocked : 1,
        username : 1
    })
    if (user.isBlocked == false){
        return res.status(400).json(
            user.username + " est déjà actif"
         );
    }
    await User.updateOne(
        { "_id" : mongoose.Types.ObjectId(id)},
        
         { "isBlocked": false },
        
     )

    return res.status(200).json(
        user.username + " est activé"
     );

}

exports.get_stats_admin = async (req, res, next) => {
    
    let counter
    let confirmed = 0
    let totalTimeSpent = 0
    let users = await User.find()
    let parkings = await Parking.find()
    let reservations = []
    let parkingsSpent = {}
    let parkingOccupationPercentage = {}
    let parkingOccupation = {}


            users.forEach(user => {
                user.reservations.forEach(reservation => {
                    reservations.push({username: user.username , date : reservation.date, arrivalTime : reservation.arrivalTime, departureTime : reservation.departureTime, scanned : reservation.scanned, parkingName : reservation.parkingName, carNumber : reservation.carNumber})
                    if(reservation.scanned == 2){
                    
                
                        if(reservation.departureTime != null){
                            let regExTimeArrival = /([0-9]?[0-9]):([0-9][0-9])/;
            let regExTimeArrArrival = regExTimeArrival.exec(reservation.arrivalTime);
            let timeHrArrival = regExTimeArrArrival[1] * 3600 ;
            let timeMinArrival= regExTimeArrArrival[2] * 60 ;
            let timeMsArrival = timeHrArrival + timeMinArrival;  
          
          
            let regExTimeDeparture = /([0-9]?[0-9]):([0-9][0-9])/;
            let regExTimeArrDeparture = regExTimeDeparture.exec(reservation.departureTime);
            let timeHrDeparture = regExTimeArrDeparture[1] * 3600 ;
            let timeMinDeparture= regExTimeArrDeparture[2] * 60 ;
            let timeMsDeparture = timeHrDeparture + timeMinDeparture;
                            let value = timeMsDeparture - timeMsArrival
                            if(value > 0){
                                totalTimeSpent = totalTimeSpent + value
                            }
        
            
                        }
                    }
               
                })
            })
            reservations.forEach(reservation => {
               if(!(reservation.parkingName in parkingsSpent)){
                   parkingsSpent[reservation.parkingName] = 2
               }else{
                parkingsSpent[reservation.parkingName] =  parkingsSpent[reservation.parkingName] + 2
                   if(reservation.scanned == 2){
                    if(reservation.departureTime != null){
                        let regExTimeArrival = /([0-9]?[0-9]):([0-9][0-9])/;
        let regExTimeArrArrival = regExTimeArrival.exec(reservation.arrivalTime);
        let timeHrArrival = regExTimeArrArrival[1] * 3600 ;
        let timeMinArrival= regExTimeArrArrival[2] * 60 ;
        let timeMsArrival = timeHrArrival + timeMinArrival;  
      
      
        let regExTimeDeparture = /([0-9]?[0-9]):([0-9][0-9])/;
        let regExTimeArrDeparture = regExTimeDeparture.exec(reservation.departureTime);
        let timeHrDeparture = regExTimeArrDeparture[1] * 3600 ;
        let timeMinDeparture= regExTimeArrDeparture[2] * 60 ;
        let timeMsDeparture = timeHrDeparture + timeMinDeparture;
                        let value = timeMsDeparture - timeMsArrival
                        if(value > 0){
                            parkingsSpent[reservation.parkingName] = parkingsSpent[reservation.parkingName] + value*0.001 
                        }
    
        
                    } 
                   }
               }  
            })

            parkings.forEach(parking => {
                if(!(parking.name in parkingOccupationPercentage)){
                    parkingOccupationPercentage[parking.name] = (parking.totalPlace - parking.availablePlace)/parking.totalPlace*100
                }
             })

             parkings.forEach(parking => {
                if(!(parking.name in parkingOccupation)){
                    parkingOccupation[parking.name] = parking.totalPlace - parking.availablePlace
                }
             })

            

            console.log(parkingsSpent)
            console.log(parkings)
            console.log(parkingOccupationPercentage)
            
            
    counter = reservations.length
    

    res.json({"chiffreAffaireParking" : parkingsSpent, "chiffreAffaireGlobal" : counter*2 + totalTimeSpent*0.001, "parkingOccupationPercentage" : parkingOccupationPercentage, "parkingOccupation" : parkingOccupation})
    
}
exports.get_stats = async (req, res, next) => {
    
    let counter
    let confirmed = 0
    let totalTimeSpent = 0
    let users = await User.findById(req.user.userId)
    let reservations = []
        users.reservations.forEach(reservation => {
            reservations.push({
                date : reservation.date, arrivalTime : reservation.arrivalTime, departureTime : reservation.departureTime, scanned : reservation.scanned, parkingName : reservation.parkingName, carNumber : reservation.carNumber})
                if(reservation.scanned == 2){
                    
                
                if(reservation.departureTime != null){
                    let regExTimeArrival = /([0-9]?[0-9]):([0-9][0-9])/;
    let regExTimeArrArrival = regExTimeArrival.exec(reservation.arrivalTime);
    let timeHrArrival = regExTimeArrArrival[1] * 3600 ;
    let timeMinArrival= regExTimeArrArrival[2] * 60 ;
    let timeMsArrival = timeHrArrival + timeMinArrival;  
  
  
    let regExTimeDeparture = /([0-9]?[0-9]):([0-9][0-9])/;
    let regExTimeArrDeparture = regExTimeDeparture.exec(reservation.departureTime);
    let timeHrDeparture = regExTimeArrDeparture[1] * 3600 ;
    let timeMinDeparture= regExTimeArrDeparture[2] * 60 ;
    let timeMsDeparture = timeHrDeparture + timeMinDeparture;
                    let value = timeMsDeparture - timeMsArrival
                    if(value > 0){
                        totalTimeSpent = totalTimeSpent + value
                    }

    
                }
            }
               
            })
            
    counter = reservations.length
    

    res.json({"numberOfReservations" : counter, "totalSpent" : counter*2 + totalTimeSpent*0.001, "totalTimeSpent" : totalTimeSpent/60})
    
}

exports.user_update_info = async (req, res, next) => {

    let username = req.body.username
    let phone = req.body.phone
    let matricule = req.body.matricule

    

    let user = await User.findById(req.user.userId, {
        _id : 1,
        username: 1,
        phone: 1,
        matricule : 1

    })
    
    if ( phone == "" || phone == null ){
        await User.updateOne(
            { "_id" : mongoose.Types.ObjectId(user._id)},
            
             { "phone": user.phone },
             )
    }
    else {
        await User.updateOne(
            { "_id" : mongoose.Types.ObjectId(user._id)},
            
             { "phone": phone },
             )
    }
    if ( username == "" || username == null ){
        await User.updateOne(
            { "_id" : mongoose.Types.ObjectId(user._id)},
            
             { "username": user.username },
             )
    }
    else {
        await User.updateOne(
            { "_id" : mongoose.Types.ObjectId(user._id)},
            
             { "username": username },
             )
    }
    if ( matricule == "" || matricule == null ){
        await User.updateOne(
            { "_id" : mongoose.Types.ObjectId(user._id)},
            
             { "matricule": user.matricule },
             )
    }
    else {
        await User.updateOne(
            { "_id" : mongoose.Types.ObjectId(user._id)},
            
             { "matricule": matricule },
             )
    }
    
     return res.status(200).json(
        "les modifications ont été effectuées avec succès"
        
     );
     

}

exports.getAvailablePlaces = async (req, res) => {
    try{
    const response = await axios.get('http://192.168.137.2:80')
      console.log(response.data);
      await Parking.updateOne(
        { "_id" : mongoose.Types.ObjectId("60cc62b6105ed4352086a361")},
        {
          $set: { "availablePlace": response.data.detection},
        }
     )
     return res.status(200).json(response.data)
    }catch{
        return res.status(400).json({detection : "IOT introuvable"})
    }
        
}

exports.getReservationAll = async (req, res) => {

    let user = await User.findById(req.user.userId,{
      reservations: 1,
      username: 1,
      email: 1,
      isBlocked: 1,
      sold : 1
  })
  
  const sortedReservations = user.reservations.sort(function(a,b){
    return new Date(b.date) - new Date(a.date);
  });

  return res.status(200).json(
                
                   sortedReservations
                )

  }