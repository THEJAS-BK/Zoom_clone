import { RequestHandler, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//models
import User from "../models/user.model";
import { RegisterBody } from "../types/usertypes";

const register: RequestHandler = async (
  req: Request<{}, any, RegisterBody>,
  res: Response,
) => {
  try {
    const { name, email, password } = req.body;

    const isUserExist = await User.exists({ email: email });
    if (isUserExist) {
      res.status(400).json({ error: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const userId = newUser._id;

    //get tokens
    const accesToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      },
    );

     const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    res.json({ accesToken, refreshToken });
  } catch (err) {
    console.error(err);
  }
};

const login:RequestHandler = async (
  req: Request<{}, any, { email: string; password: string }>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const userId = user._id;

    //get tokens
    const accesToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      },
    );

     const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    res.json({ accesToken, refreshToken });
  } catch (err) {
    console.error(err);
  }
};

export const userController = {
  register,
  login
};
