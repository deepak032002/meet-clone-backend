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
  loginService,
  meService,
  signUpService,
  verifyUserService,
} from "../services/user.service";

const router = Router();

router.post("/signup", validateData(userRegistrationSchema), signUpService);

router.post("/login", validateData(userLoginSchema), loginService);

router.get("/me", authenticateToken, meService);

router.post("/get-otp", validateData(userSendOtpSchema), getOtpService);

router.post(
  "/verify-user",
  validateData(userVerifyOtpSchema),
  verifyUserService
);

const userRouter = router;
export default userRouter;
