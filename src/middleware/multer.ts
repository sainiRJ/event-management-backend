import multer from "multer";

const storage = multer.memoryStorage(); // to get buffer in req.file
const upload = multer({ storage });

export default upload;
