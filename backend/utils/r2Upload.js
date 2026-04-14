const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');

// Cloudflare R2 is S3-compatible
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g. https://pub-xxx.r2.dev

// Multer config — store in memory buffer before uploading to R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  },
});

/**
 * Upload a buffer to Cloudflare R2
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} key - Object key (path in bucket), e.g. "posters/MOV-2025-001.jpg"
 * @param {string} mimetype - MIME type of the file
 * @returns {string} Public URL of the uploaded file
 */
const uploadToR2 = async (buffer, key, mimetype) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );
  return `${PUBLIC_URL}/${key}`;
};

/**
 * Delete an object from Cloudflare R2
 * @param {string} key - Object key to delete
 */
const deleteFromR2 = async (key) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
};

module.exports = { upload, uploadToR2, deleteFromR2 };
