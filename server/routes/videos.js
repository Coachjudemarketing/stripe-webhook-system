import express from "express";
import multer from "multer";
import { uploadVideo, getVideoUrl, deleteVideo, listVideos } from "../services/s3Service.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const userId = req.headers["x-user-id"] || "unknown";
  const result = await uploadVideo(req.file, userId);
  if (result.success) res.json({ success: true, message: "Video uploaded successfully", videoId: result.videoId, url: result.url });
  else res.status(500).json({ success: false, error: result.error });
});

router.get("/:videoId", async (req, res) => {
  const result = await getVideoUrl(req.params.videoId);
  if (result.success) res.json({ success: true, url: result.url });
  else res.status(500).json({ success: false, error: result.error });
});

router.get("/list/:userId", async (req, res) => {
  const result = await listVideos(req.params.userId);
  if (result.success) res.json({ success: true, videos: result.videos });
  else res.status(500).json({ success: false, error: result.error });
});

router.delete("/:videoId", async (req, res) => {
  const result = await deleteVideo(req.params.videoId);
  if (result.success) res.json({ success: true, message: "Video deleted" });
  else res.status(500).json({ success: false, error: result.error });
});

export default router;
