import multer from "multer";
import { config } from "../config/env.js";
import { ALLOWED_TYPES } from "../services/storage.service.js";
import { HttpError } from "../utils/http.js";

/** Single-file, in-memory upload with type and size limits. Contents are re-checked in the storage service. */
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => (ALLOWED_TYPES[file.mimetype] ? cb(null, true) : cb(new HttpError(415, "Unsupported file type"))),
}).single("file");
