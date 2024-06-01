import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import morgon from "morgan";
import cookieParser from "cookie-parser";

import prisma from "./prisma";
import userRouter from "./routes/user.routes";
import roomRouter from "./routes/room.routes";
import { authenticateSocketToken } from "./utils/middleware";
import { socketFn } from "./socket";

const corsOption = {
  origin: "http://localhost:3000",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const main = async () => {
  const app = express();
  const server = http.createServer(app);

  app.set("x-powered-by", false);
  app.set("trust proxy", true);
  app.use(cors(corsOption));
  app.use(morgon("dev"));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/room", roomRouter);

  const io = new Server(server, {
    cors: corsOption,
  });

  io.use(authenticateSocketToken);

  io.on("connection", (socket) => socketFn(socket, io));

  console.log("Connected to db successfully!");
  server.listen(5000, () => {
    console.log("server is running on port 5000");
  });
};

prisma
  .$connect()
  .then(main)
  .catch((error) => {
    console.error(error);
  });
