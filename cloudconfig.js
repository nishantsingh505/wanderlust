// utils/cloudinary.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload to Cloudinary
const uploadToCloudinary = async (
  fileBuffer,
  mimetype,
  folder = "wanderlust_DEV",
  filename
) => {
  const fileData = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
  const generateFilename = (prefix = "listing") => {
    const timestamp = Date.now(); // e.g., 1715173123456
    return `${prefix}_${timestamp}`;
  };
  filename = generateFilename();

  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    public_id: filename ? filename.split(".")[0] : undefined, // use original name without extension
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });

  return result;
};

module.exports = {
  upload, // multer middleware
  uploadToCloudinary, // function to upload file
};
