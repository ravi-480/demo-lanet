import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: "dlxrojwkw",
  api_key: "486154395265794",
  api_secret: "-n2xYO_W3sTyllmd2hel28dkTUE",
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept image
    } else {
      cb(null, false);
    }
  },
});

export const uploadEventImage = upload.single("image");

export const uploadWithoutImage = upload.none();
