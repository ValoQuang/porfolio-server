import { Secret, verify, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const Users = require("../models/user.model");

export class AppError extends Error {
  status: number;
  constructor(message: any, statusCode: number) {
    super(message);
    this.status = statusCode;
  }
}

export interface CustomRequest extends Request {
  email: string;
  userId: string;
  username: string;
}

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  username: string;
}

export const authenticateUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const secretKey: Secret = process.env.JWT_LOGIN_KEY as Secret;
    const decoded = verify(token, secretKey) as CustomJwtPayload;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }
    if (!decoded.userId || !decoded.username) {
      next(new AppError("Invalid token or it may be expired", 400));
    } else {
      const user = await Users.findById(decoded.userId);
      if (user) {
        req.userId = decoded.userId;
        req.username = decoded.username;
        req.email = decoded.email;
        next();
      } else {
        next(new AppError("Please Login first", 400));
      }
    }
  } catch (error) {
    next(new AppError(error, 400));
  }
};

