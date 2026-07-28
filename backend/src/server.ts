import express, { Request, Response, urlencoded } from "express";
const app = express();
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

//mongo setup
main().then(() => console.log("MongoDB connected"));
async function main(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URL!);
}

//uses
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(urlencoded({ extended: true, limit: "40kb" }));

//controllers
import { setSocketConnection } from "./controllers/sockets";

//routes
import userRoutes from "./routes/auth.routes";

import imageRoutes from "./routes/images.routes";
import boardRoutes from "./routes/boards.routes"

//sockets setup
const server = createServer(app);
const io = setSocketConnection(server);

//all routes
app.use("/images", imageRoutes);
app.use(
  "/auth",
  userRoutes,
);
app.use("/boards", boardRoutes);




server.listen(8080, () => {
  console.log("server started on port 8080");
});
