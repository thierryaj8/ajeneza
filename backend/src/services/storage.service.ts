import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/env.js";
import { HttpError } from "../utils/http.js";

export const ALLOWED_TYPES: Record<string, { kind: "image" | "pdf" | "document"; ext: string }> = {
  "image/jpeg": { kind: "image", ext: "jpg" },
  "image/png": { kind: "image", ext: "png" },
  "image/webp": { kind: "image", ext: "webp" },
  "image/gif": { kind: "image", ext: "gif" },
  "image/avif": { kind: "image", ext: "avif" },
  "application/pdf": { kind: "pdf", ext: "pdf" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { kind: "document", ext: "docx" },
  "application/msword": { kind: "document", ext: "doc" },
  "text/plain": { kind: "document", ext: "txt" },
};

/** Check the file's magic bytes agree with its declared type (SVG/HTML are never accepted). */
export function sniffMatches(mime: string, buf: Buffer): boolean {
  const hex = buf.subarray(0, 12).toString("hex");
  switch (mime) {
    case "image/jpeg": return hex.startsWith("ffd8ff");
    case "image/png": return hex.startsWith("89504e470d0a1a0a");
    case "image/gif": return hex.startsWith("47494638");
    case "image/webp": return hex.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP";
    case "image/avif": return buf.subarray(4, 12).toString().startsWith("ftypavi");
    case "application/pdf": return buf.subarray(0, 5).toString() === "%PDF-";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": return hex.startsWith("504b0304");
    case "application/msword": return hex.startsWith("d0cf11e0a1b11ae1");
    case "text/plain": return !buf.subarray(0, 512).toString("utf8").match(/<\s*(script|html|svg|iframe)/i);
    default: return false;
  }
}

if (config.cloudinaryUrl) cloudinary.config({ secure: true }); // reads CLOUDINARY_URL from env

export interface StoredFile { url: string; provider: "local" | "cloudinary"; providerId: string; width?: number; height?: number }

export async function storeFile(file: Express.Multer.File, folder: string): Promise<StoredFile> {
  const type = ALLOWED_TYPES[file.mimetype];
  if (!type) throw new HttpError(415, "Unsupported file type");
  if (!sniffMatches(file.mimetype, file.buffer)) throw new HttpError(415, "File contents do not match its type");
  const id = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

  if (config.cloudinaryUrl) {
    const result = await new Promise<{ secure_url: string; public_id: string; width?: number; height?: number }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: `ajeneza/${folder}`, public_id: id, resource_type: type.kind === "image" ? "image" : "raw" },
          (err, res) => (err || !res ? reject(err) : resolve(res)),
        )
        .end(file.buffer);
    });
    return { url: result.secure_url, provider: "cloudinary", providerId: result.public_id, width: result.width, height: result.height };
  }

  const dir = path.resolve(config.uploadDir);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${id}.${type.ext}`;
  await fs.writeFile(path.join(dir, filename), file.buffer);
  // Same-origin path: the unified server serves /uploads directly.
  return { url: `/uploads/${filename}`, provider: "local", providerId: filename };
}

export async function removeFile(provider: string, providerId?: string, kind?: string) {
  if (!providerId) return;
  try {
    if (provider === "cloudinary") await cloudinary.uploader.destroy(providerId, { resource_type: kind === "image" ? "image" : "raw" });
    if (provider === "local") await fs.unlink(path.join(path.resolve(config.uploadDir), path.basename(providerId)));
  } catch (err) {
    console.warn("[media] could not delete stored file", err);
  }
}
