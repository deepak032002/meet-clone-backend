import { Response } from "express";
import { v2 as cloudinary } from "cloudinary";

export const responseGenerator = (
  res: Response,
  status: number,
  message: string,
  data?: any
) => {
  return res.status(status).json({ status, message, data });
};

export function generatePresignedUrl() {
  const timestamp = Date.now();
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: "my-preset" },
    process.env.CLOUDINARY_SECRET_KEY!
  );

  return `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload?api_key=${process.env.CLOUDINARY_API_KEY}&timestamp=${timestamp}&upload_preset=my-preset&signature=${signature}`;
}
