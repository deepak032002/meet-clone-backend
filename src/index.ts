import { Server } from "socket.io";
import http from "http";
import express from "express";
import pinoHttp from "pino-http";
import cors from "cors";

import prisma from "./prisma";
import userRouter from "./routes/user.routes";
import roomRouter from "./routes/room.routes";
import { authenticateSocketToken } from "./utils/middleware";

const pino = pinoHttp({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const main = async () => {
  const app = express();
  app.set("x-powered-by", false);
  app.set("trust proxy", true);
  app.use(pino);
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/room", roomRouter);
  const server = http.createServer(app);

  const io = new Server(server);

  io.use(authenticateSocketToken);

  io.on("connection", (socket) => {
    socket.on("join", (roomId: string) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", socket.id);
    });

    socket.on("room-size", () => {
      console.log(socket.rooms);
    });
    socket.on("disconnecting", () => {
      console.log(socket.rooms);
    });
  });

  pino.logger.info("connected to database");

  server.listen("5000", () => {
    pino.logger.info("server is running on port 5000");
  });
};

prisma
  .$connect()
  .then(main)
  .catch((error) => {
    console.error(error);
  });
