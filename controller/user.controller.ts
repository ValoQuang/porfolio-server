import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { CustomRequest } from "../middleware/auth";
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Users = require("../models/user.model");

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create new user
    const newUser = new Users({
      username: username,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    // return 201
    return res
      .status(201)
      .json({ code: res.statusCode, message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      code: res.statusCode,
      error: "An error occurred while registering the user",
    });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ error: "User not found, please sign up instead" });
    }
    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ code: res.statusCode, error: "Invalid email or password" });
      }
    }
    // Generate a JWT token
    const token = jwt.sign(
      { userId: existingUser._id, username: existingUser.username },
      process.env.JWT_LOGIN_KEY ?? ""
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    existingUser.resetToken = resetToken;
    existingUser.resetTokenExpiration = Date.now() + 3600000;
    await existingUser.save();
    res
      .status(200)
      .json({ code: res.statusCode, message: "Password reset token sent" });
  } catch (error) {
    console.error("Error generating reset token:", error);
    res.status(500).json({
      code: res.statusCode,
      error: "An error occurred while generating the reset token",
    });
  }
};

export const getUser = async (req: CustomRequest, res: Response) => {
  try {
    if (req)
      res.json({
        message: "This is a protected route",
        userId: req.userId,
        username: req.username,
      });
  } catch (error) {
    console.error("Error token:", error);
    res.status(500).json({
      code: res.statusCode,
      error: "An error occurred while logging in",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;
    const existingUser = await Users.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    // Encrypt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and reset token fields
    existingUser.password = hashedPassword;
    existingUser.resetToken = undefined;
    existingUser.resetTokenExpiration = undefined;
    await existingUser.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing the password" });
  }
};
