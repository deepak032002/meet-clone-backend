import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { responseGenerator } from "./helper";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ExtendedError } from "socket.io/dist/namespace";
import cookieParser from "cookie-parser";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export function validateData(
  schema: z.ZodEffects<z.ZodObject<any, any>> | z.ZodObject<any, any>,
  type: "body" | "query" | "params"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (type === "body") {
        schema.parse(req.body);
      }

      if (type === "query") {
        schema.parse(req.query);
      }

      if (type === "params") {
        schema.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));

        responseGenerator(
          res,
          StatusCodes.BAD_REQUEST,
          "Invalid data",
          errorMessages
        );
      } else {
        responseGenerator(
          res,
          StatusCodes.BAD_REQUEST,
          "Internal Server Error"
        );
      }
    }
  };
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies["geek-token"] as string;
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return responseGenerator(res, StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return responseGenerator(res, StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    req.user = { id: (user as JwtPayload)?.id };

    next();
  });
}

export function authenticateSocketToken(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: (err?: ExtendedError | undefined) => void
) {
  try {
    const token = socket.handshake.headers?.cookie
      ? (socket.handshake.headers?.cookie?.split("=")[1] as string)
      : (socket.handshake.headers?.token as string);

    if (token == null) {
      throw new Error("Unauthorized");
    }

    const user = jwt.verify(token, process.env.JWT_SECRET as string);

    socket.data.user = { id: (user as JwtPayload)?.id };
    next();
  } catch (error: Error | any) {
    next({ message: error.message, name: error.name });
  }
}
