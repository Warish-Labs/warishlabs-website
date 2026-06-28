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
   * Extracts the Cloudinary publicId from a secure URL
   */
  static getPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const pathAfterUpload = parts[1];
      const pathParts = pathAfterUpload.split('/');
      // Remove version parameter if present (e.g. v1718293)
      if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
        pathParts.shift();
      }
      const pathWithoutVersion = pathParts.join('/');
      const dotIndex = pathWithoutVersion.lastIndexOf('.');
      if (dotIndex !== -1) {
        return pathWithoutVersion.substring(0, dotIndex);
      }
      return pathWithoutVersion;
    } catch (err) {
      console.error('[MediaService] Error parsing Cloudinary URL:', url, err);
      return null;
    }
  }

  /**
   * Uploads an asset (image or video buffer) to Cloudinary
   * Falls back to a mock local placeholder if Cloudinary is not configured.
   */
  static async uploadAsset(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subFolder: 'products' | 'labs' | 'general' = 'general'
  ): Promise<{ url: string; publicId: string } | null> {
    if (!isConfigured) {
      console.warn('[MediaService] Cloudinary is not configured. Simulating asset upload.');
      const mockPublicId = `mock_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const mockUrl = mimeType.startsWith('video') 
        ? '/docs/VIDEO.mp4' 
        : `/logo.gif`;
      return { url: mockUrl, publicId: mockPublicId };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `warishlabs/${subFolder}`,
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
