import { Router } from "express";
import { authenticateToken } from "../utils/middleware";
import { getMeetingId } from "../services/room.service";

const router = Router()

router.get("/get-meeting-id", authenticateToken, getMeetingId)

export default router