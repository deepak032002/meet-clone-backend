import { Router } from "express";
import { authenticateToken, validateData } from "../utils/middleware";
import { getMeetingId, getRoomInfo } from "../services/room.service";
import { getRoomInfoSchema } from "../utils/validationSchema";

const router = Router();

router.get("/get-meeting-id", authenticateToken, getMeetingId);
router.get(
  "/get-room-info",
  authenticateToken,
  validateData(getRoomInfoSchema, "query"),
  getRoomInfo
);

export default router;
