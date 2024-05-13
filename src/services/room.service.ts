import { StatusCodes } from "http-status-codes";
import { responseGenerator } from "../utils/helper";
import { Request, Response } from "express";
import ShortUniqueId from "short-unique-id";

export const getMeetingId = (req: Request, res: Response) => {
  try {
    const uid = new ShortUniqueId({ length: 10, dictionary: "alpha_lower" });
    const id = uid.formattedUUID("$r3-$r4-$r3");

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
