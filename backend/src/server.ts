import express, { Request, Response, urlencoded } from "express";
const app = express();
import { createServer } from "node:http";
import mongoose from "mongoose"
import cors from "cors";
import dotenv from "dotenv"
dotenv.config();

//mongo setup
main().then(() => console.log("MongoDB connected"));
async function main(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI!)
}

//uses
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({"limit":"40kb"}));
app.use(urlencoded({extended:true,"limit":"40kb"}));


//controllers
import { setSocketConnection } from "./controllers/socketManger";

//routes
import userRoutes from "./routes/auth.routes"

//sockets setup
const server=createServer(app);
const io=setSocketConnection(server);

//all routes

app.use("/auth", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "this is backend code" });
});
server.listen(8080, () => {
  console.log("server started on port 8080");
});
