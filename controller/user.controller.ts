import jwt from "jsonwebtoken";
import { Request, Response } from "express";
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    const newUser = new Users({ username, email, hashedPassword });
    await newUser.save();
    // return 201
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
     // Generate a JWT token
     const token = jwt.sign({ userId: existingUser._id }, 'secretKey');
     res.status(200).json({ token });

  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    existingUser.resetToken = resetToken;
    existingUser.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await existingUser.save();
    res.status(200).json({ message: 'Password reset token sent' });
  } catch (error) {
    console.error('Error generating reset token:', error);
    res.status(500).json({ error: 'An error occurred while generating the reset token' });
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
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Encrypt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and reset token fields
    existingUser.password = hashedPassword;
    existingUser.resetToken = undefined;
    existingUser.resetTokenExpiration = undefined;
    await existingUser.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch(error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing the password" });
  }
};