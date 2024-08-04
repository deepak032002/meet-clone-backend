import { z } from "zod";

export const userRegistrationSchema = z
  .object({
    firstName: z.string().min(3),
    lastName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    mobile: z
      .string()
      .regex(
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
        "Phone number is not valid"
      ),
    confirmPassword: z.string().min(8),
    image: z.string().optional(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const userLoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const userSendOtpSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const userVerifyOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(6),
  })
  .strict();
