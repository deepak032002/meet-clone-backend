import { Router } from "express";

import { authenticateToken, validateData } from "../utils/middleware";
import {
  userLoginSchema,
  userRegistrationSchema,
  userSendOtpSchema,
  userVerifyOtpSchema,
} from "../utils/validationSchema";

import {
  getOtpService,
  logOutService,
  loginService,
  meService,
  signUpService,
  verifyUserService,
} from "../services/user.service";

const router = Router();

router.post(
  "/signup",
  validateData(userRegistrationSchema, "body"),
  signUpService
);

router.post("/login", validateData(userLoginSchema, "body"), loginService);

router.get("/me", authenticateToken, meService);

router.post("/get-otp", validateData(userSendOtpSchema, "body"), getOtpService);

router.post(
  "/verify-user",
  validateData(userVerifyOtpSchema, "body"),
  verifyUserService
);

router.post("/logout", authenticateToken, logOutService);

const userRouter = router;
export default userRouter;
