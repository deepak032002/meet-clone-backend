import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z, AnyZodObject } from "zod";

export const responseGenerator = (
  res: Response,
  status: number,
  message: string,
  data?: any
) => {
  return res.status(status).json({ status, message, data });
};
