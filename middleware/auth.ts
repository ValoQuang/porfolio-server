import { Secret, verify, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const Users = require("../models/user.model");

export class AppError extends Error {
  status: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.status = statusCode;
  }
}

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  userEmail: string;
}

interface CustomRequest extends Request {
  userId?: string;
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

    if (!decoded.userId || !decoded.userEmail) {
      next(new AppError("Invalid token or it may be expired", 400));
    } else {
      const user = await Users.findById(decoded.userId);
      if (user && user.isActive) {
        req.userId = decoded.userId;
        next();
      } else {
        next(new AppError("Please Login first", 400));
      }
    }
  } catch (error) {
    next(new AppError(error, 400));
  }
};

