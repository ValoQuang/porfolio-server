import express from "express";

const router = express.Router();

const userController = require("../controller/user.controller");
const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");

router.post("/signin", userController.signIn);
router.post("/signup", userController.signUp);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/user", loginCheck, isAuth, isAdmin, userController.allUser);

module.exports = router;