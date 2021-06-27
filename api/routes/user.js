const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const checkAuth = require('../middleware/check-auth')
const checkAdmin = require('../middleware/admin-auth');

router.post('/signup',UserController.user_signup );


router.post('/login', UserController.user_login);


router.post('/admin/login',UserController.admin_login);


router.get("/confirm/:confirmCode", UserController.user_verify)

router.post("/reservation",checkAuth, UserController.reservation);

router.get("/reservations",checkAuth, UserController.getReservation);

router.get("/qr/:id", UserController.getQr);

router.get("/sold", checkAuth,UserController.getSold);

router.put("/sold", checkAuth,UserController.updateSold);

router.get("/admin/users", checkAuth,checkAdmin,UserController.get_all_users);

router.get("/stats", checkAuth, UserController.get_stats);

router.get("/admin/stats", checkAuth, checkAdmin, UserController.get_stats_admin);

router.get("/admin/reservations", checkAuth,checkAdmin,UserController.get_all_reservations);

router.put("/profile", checkAuth,UserController.user_update_info);

router.put("/admin/block/:id", checkAuth,checkAdmin,UserController.block_user);

router.put("/admin/activate/:id", checkAuth,checkAdmin,UserController.activate_user);

router.delete('/admin/:userId', checkAuth,checkAdmin,UserController.user_delete);

router.get("/reservationsall",checkAuth, UserController.getReservationAll);




module.exports = router;