import { RequestHandler,Request,Response } from "express";
import { Test } from "../types/test";

const testRoute:RequestHandler = (req: Request, res: Response) => {
  const testData: Test = {
    name: "thejas",
    email: "thejasbk1@gmail.com",
    phoneNumber: 908909898098,
  };
  res.json(testData);
};

export const userController={
    testRoute,
}