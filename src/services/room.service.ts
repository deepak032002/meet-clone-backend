import { StatusCodes } from "http-status-codes";
import { responseGenerator } from "../utils/helper";
import { Request, Response } from "express";
import ShortUniqueId from "short-unique-id";
import prisma from "../prisma";

export const getMeetingId = async (req: Request, res: Response) => {
  try {
    const uid = new ShortUniqueId({ length: 10, dictionary: "alpha_lower" });
    const id = uid.formattedUUID("$r3-$r4-$r3");

    const roomCreateRes = await prisma.room.create({
      data: {
        roomId: id,
        owner: {
          connect: {
            id: req.user?.id,
          },
        },
      },
    });

    if (!roomCreateRes) {
      return responseGenerator(
        res,
        StatusCodes.NOT_ACCEPTABLE,
        "Something went wrong!"
      );
    }

    return responseGenerator(res, StatusCodes.OK, "Meeting ID", { id });
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong!",
      error
    );
  }
};

export const getRoomInfo = async (req: Request, res: Response) => {
  try {
    const room = await prisma.room.findUnique({
      where: {
        roomId: req.query.roomId as string,
      },
      select: {
        id: true,
        roomId: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!room) {
      return responseGenerator(res, StatusCodes.NOT_FOUND, "Room not found");
    }

    responseGenerator(res, StatusCodes.OK, "Meeting ID", { room });
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong!",
      error
    );
  }
};
