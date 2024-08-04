import { StatusCodes } from "http-status-codes";
import prisma from "../prisma";
import { generatePresignedUrl, responseGenerator } from "../utils/helper";
import * as argon2 from "argon2";
import { Request, Response } from "express";
import sendMail from "../utils/sendMail";
import { htmlContent } from "../utils/emailContent";
import jwt from "jsonwebtoken";
import moment from "moment";

export const signUpService = async (req: Request, res: Response) => {
  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (userExists) {
      return responseGenerator(
        res,
        StatusCodes.CONFLICT,
        "User already exists"
      );
    }

    const hashPassword = await argon2.hash(req.body.password);

    await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobile: req.body.mobile,
        password: hashPassword,
        image: req.body.image,
      },
    });

    return responseGenerator(
      res,
      StatusCodes.CREATED,
      "User created successfully",
      null
    );
  } catch (error) {
    console.log(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const loginService = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return responseGenerator(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid credentials"
      );
    }

    const verifyPassword = await argon2.verify(
      user.password,
      req.body.password
    );

    if (!verifyPassword) {
      return responseGenerator(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid credentials"
      );
    }

    if (!user?.isVerified) {
      return responseGenerator(
        res,
        StatusCodes.FORBIDDEN,
        "Please verify your email"
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    return responseGenerator(res, StatusCodes.OK, "Login successful", {
      token,
    });
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const meService = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        isVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return responseGenerator(res, StatusCodes.NOT_FOUND, "User not found");
    }

    return responseGenerator(res, StatusCodes.OK, "User found", { user });
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const getOtpService = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return responseGenerator(res, StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.isVerified) {
      return responseGenerator(
        res,
        StatusCodes.CONFLICT,
        "User already verified"
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    if (!user.otp || moment().isAfter(user.otp.expiresAt)) {
      await prisma.user.update({
        where: {
          email: req.body.email,
        },
        data: {
          otp: {
            value: otp.toString(),
            expiresAt: moment().add(10, "minutes").toDate(),
          },
        },
      });
    }

    const msgWait = await sendMail(
      req.body?.email,
      "Email Verification",
      htmlContent.replace("{{OTP_VALUE}}", user.otp?.value || otp.toString())
    );
    console.log(msgWait, "msgWait");

    if (msgWait.rejected.includes(req.body.email)) {
      return responseGenerator(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Email not sent"
      );
    }

    return responseGenerator(
      res,
      StatusCodes.OK,
      "Successfully OTP generated, Check your mail!"
    );
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const verifyUserService = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return responseGenerator(res, StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.isVerified) {
      return responseGenerator(
        res,
        StatusCodes.CONFLICT,
        "User already verified"
      );
    }

    if (user.otp?.value !== req.body.otp) {
      return responseGenerator(res, StatusCodes.UNAUTHORIZED, "Invalid OTP");
    }

    await prisma.user.update({
      where: {
        email: req.body.email,
      },
      data: {
        isVerified: true,
        otp: null,
      },
    });

    return responseGenerator(res, StatusCodes.OK, "User verified");
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const url = generatePresignedUrl();

    return responseGenerator(res, StatusCodes.OK, "Successfully generated", {
      url,
    });
  } catch (error) {
    console.error(error);
    responseGenerator(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};
