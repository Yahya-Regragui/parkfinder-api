const User = require('../models/user');


module.exports = async (req, res, next) => {

    let user = await User.findById(req.user.userId, {
        
        isAdmin: 1
    })
    console.log("--------------------" + req.user.userId)
    console.log("--------------------" + user.isAdmin)

        if (user.isAdmin != true){
            return res.status(401).json({
                message: 'you are not admin'
            });
        }
        next();
}
