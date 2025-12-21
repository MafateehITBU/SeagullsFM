import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Support both individual environment variables and CLOUDINARY_URL
let cloudName, apiKey, apiSecret;

if (process.env.CLOUDINARY_URL) {
  // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  try {
    const url = new URL(process.env.CLOUDINARY_URL);
    apiKey = url.username;
    apiSecret = url.password;
    cloudName = url.hostname;
    console.log('Using CLOUDINARY_URL configuration');
  } catch (error) {
    console.error('Error parsing CLOUDINARY_URL:', error);
  }
} else {
  // Use individual environment variables
  cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = process.env.CLOUDINARY_API_KEY;
  apiSecret = process.env.CLOUDINARY_API_SECRET;
  console.log('Using individual environment variables');
}

// Fallback to hardcoded values if environment variables are not set
if (!cloudName || !apiKey || !apiSecret) {
  console.log('Using fallback Cloudinary configuration');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('Cloudinary configured with cloud_name:', cloudName);
console.log('Cloudinary API key set:', apiKey ? 'YES' : 'NO');
console.log('Cloudinary API secret set:', apiSecret ? 'YES' : 'NO');

export default cloudinary; 