import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});
