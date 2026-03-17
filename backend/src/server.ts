import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv"
dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);

//types
import type {Test} from "./types/test"


app.get("/", (req: Request, res: Response) => {
  res.json({ message: "this is backend code" });
});
app.get("/test",(req:Request,res:Response)=>{
    const testData:Test={
        name:"thejas",
        email:"thejasbk1@gamil.com",
        phoneNumber:908909898098
    }
    res.json(testData)
})

app.listen(8080, () => {
  console.log("server started on port 8080");
});
