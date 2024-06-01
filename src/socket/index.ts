import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const socketFn = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("join", async (data) => {
    try {
      const { userId, roomId, peerId } = data;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      await prisma.$transaction(async (tx) => {
        const ifUserInRoom = await tx.room_User.findFirst({
          where: {
            roomId: roomId,
            userId: userId,
          },
        });

        if (ifUserInRoom) {
          await tx.room_User.update({
            where: {
              id: ifUserInRoom.id,
            },
            data: {
              socketId: socket.id,
              peerId: peerId,
            },
          });
        } else {
          await tx.room_User.create({
            data: {
              roomId: roomId,
              peerId: peerId,
              socketId: socket.id,
              userId: userId,
            },
          });
        }
      });

      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", { ...user, peerId });

      const allMembers = await prisma.room_User.findMany({
        where: {
          roomId: roomId,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          socketId: true,
          peerId: true,
          roomId: true,
        },
      });

      io.to(roomId).emit("get-room-users", allMembers);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      await prisma.room_User.delete({
        where: {
          socketId: socket.id,
        },
      });
    } catch (error) {
      console.error(error);
    }
  });
};
