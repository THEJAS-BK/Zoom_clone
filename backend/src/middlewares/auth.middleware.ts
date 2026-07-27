import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
//type
interface jwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authHeader = (req: Request, res: Response, next: NextFunction) => {
  const authHeaderVal = req.headers.authorization;
  if (!authHeaderVal || !authHeaderVal.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }
  const token = authHeaderVal.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as unknown as jwtPayload;
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
