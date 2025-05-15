import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream"; // Import Readable from stream instead of using require()

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

/**
 * Uploads a file to Cloudinary
 * @param file Buffer containing the file data
 * @param folder Folder path in Cloudinary
 * @param publicId Optional public ID for the file
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: Buffer,
  folder: string = "cloudio",
  publicId?: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      public_id: publicId,
      resource_type: "auto" as const, // Add type assertion to fix the error
    };

    // Using the upload_stream API for Buffer uploads
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryUploadResult);
      }
    );

    // Convert Buffer to Stream
    const readableStream = new Readable();
    readableStream.push(file);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Deletes a file from Cloudinary
 * @param publicId Public ID of the file
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Determines the file type based on extension
 * @param fileName Filename with extension
 * @returns File type category
 */
export function getFileType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return "image";
  } else if (extension === "pdf") {
    return "pdf";
  } else if (["doc", "docx"].includes(extension)) {
    return "word";
  } else if (["xls", "xlsx", "csv"].includes(extension)) {
    return "spreadsheet";
  } else if (
    ["js", "ts", "html", "css", "json", "php", "py"].includes(extension)
  ) {
    return "code";
  } else if (["txt", "md"].includes(extension)) {
    return "document";
  }

  return "other";
}

/**
 * Generates a signed URL for file downloads
 * @param publicId The file's public ID
 * @param expiresIn Expiration time in seconds (default: 3600)
 * @returns Signed URL string
 */
export function generateSignedUrl(
  publicId: string,
  expiresIn: number = 3600
): string {
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn;

  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    timestamp,
  });
}
