// src/lib/validations.ts
/**
 * Validates a file name
 * @param fileName The file name to validate
 * @returns True if valid, false otherwise
 */
export function isValidFileName(fileName: string): boolean {
  if (!fileName || fileName.trim() === "") return false;

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(fileName)) return false;

  // Check for reserved names in Windows
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];

  const baseName = fileName.split(".")[0].toUpperCase();
  if (reservedNames.includes(baseName)) return false;

  // Check maximum length
  if (fileName.length > 255) return false;

  return true;
}

/**
 * Validates a file size
 * @param fileSize The file size in bytes
 * @param maxSize The maximum allowed size in bytes (default: 10MB)
 * @returns True if valid, false otherwise
 */
export function isValidFileSize(
  fileSize: number,
  maxSize: number = 10 * 1024 * 1024
): boolean {
  return fileSize > 0 && fileSize <= maxSize;
}

/**
 * Formats bytes into human-readable size
 * @param bytes Number of bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
