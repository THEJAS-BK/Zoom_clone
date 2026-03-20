import { RequestHandler,Request,Response } from "express";
import { Test } from "../types/test.types";

const register:RequestHandler = (req: Request, res: Response) => {
 
  const val = req.body;

  console.log(val);

  res.json({mes:"working"});
};

export const userController={
    register,
}