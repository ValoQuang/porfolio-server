import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const Users = require("../models/user.model");

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const newUser = new Users({ username, email, password, role });
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

export const signIn = async (req: Request, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userEmail = await Users.findOne({ email });
    if (!userEmail) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await userEmail.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
     // Generate a JWT token
     const token = jwt.sign({ userId: userEmail._id }, 'secretKey');
     res.status(200).json({ token });

  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
};
