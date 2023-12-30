import express from "express";

const router = express.Router();

const userController = require("../controller/user.controller");
const { authenticateUser } = require("../middleware/auth");

router.post("/login", userController.signIn);
router.post("/signup", userController.signUp);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/user", authenticateUser, userController.allUser);


module.exports = router;