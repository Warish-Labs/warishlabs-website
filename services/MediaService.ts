import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if credentials are set
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export class MediaService {
  /**
   * Uploads an asset (image or video buffer) to Cloudinary
   * Falls back to a mock local placeholder if Cloudinary is not configured.
   */
  static async uploadAsset(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string; publicId: string } | null> {
    if (!isConfigured) {
      console.warn('[MediaService] Cloudinary is not configured. Simulating asset upload.');
      const mockPublicId = `mock_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      // In dev fallback, return a mock URL. We can use a public asset path or random unsplash image
      const mockUrl = mimeType.startsWith('video') 
        ? '/Docs/VIDEO.mp4' 
        : `/Docs/Logo.png`; // Fallback to logo assets in Docs
      return { url: mockUrl, publicId: mockPublicId };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'warishlabs',
          resource_type: mimeType.startsWith('video') ? 'video' : 'image',
          filename_override: fileName,
        },
        (error, result) => {
          if (error) {
            console.error('[MediaService] Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            reject(new Error('Cloudinary upload result was empty'));
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Deletes an asset from Cloudinary by its publicId
   */
  static async deleteAsset(publicId: string): Promise<boolean> {
    if (!isConfigured || publicId.startsWith('mock_')) {
      console.log(`[MediaService] Cloudinary mock delete: deleted publicId ${publicId}`);
      return true;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error(`[MediaService] Cloudinary delete error for publicId ${publicId}:`, error);
      return false;
    }
  }
}
