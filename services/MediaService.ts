import { v2 as cloudinary } from 'cloudinary';

/**
 * Returns true only if all three Cloudinary credentials are present.
 * This is a function (not a const) so tests can control the environment
 * variables via vi.stubEnv before the check runs.
 */
function isConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Lazily configure Cloudinary before each use.
// cloudinary.config() is idempotent so calling it multiple times is safe.
function ensureConfigured(): void {
  if (isConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

export interface CloudinaryFolderEntry {
  path: string;
  name: string;
}

export interface CloudinaryAssetMeta {
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  fileName: string;
  createdAt: string;
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
   * Uploads an asset (image or video buffer) to Cloudinary.
   * folder can be any path string like 'warishlabs/blog' or 'warishlabs/products'.
   * Falls back to a mock local placeholder if Cloudinary is not configured.
   */
  static async uploadAsset(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<{ url: string; publicId: string } | null> {
    if (!isConfigured()) {
      console.warn('[MediaService] Cloudinary is not configured. Simulating asset upload.');
      const mockPublicId = `mock_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const mockUrl = mimeType.startsWith('video')
        ? '/docs/VIDEO.mp4'
        : `/logo.gif`;
      return { url: mockUrl, publicId: mockPublicId };
    }

    ensureConfigured();
    // Normalize folder: if it already starts with 'warishlabs/', use as-is; otherwise prepend
    const normalizedFolder = folder.startsWith('warishlabs/') ? folder : `warishlabs/${folder}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: normalizedFolder,
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
    if (!isConfigured() || publicId.startsWith('mock_')) {
      console.log(`[MediaService] Cloudinary mock delete: deleted publicId ${publicId}`);
      return true;
    }

    ensureConfigured();
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error(`[MediaService] Cloudinary delete error for publicId ${publicId}:`, error);
      return false;
    }
  }

  /**
   * Lists direct children folders of the given parent path.
   * If no parentPath given, lists root folders.
   * Returns an array of folder entries with path + name.
   */
  static async listFolders(parentPath?: string): Promise<CloudinaryFolderEntry[]> {
    if (!isConfigured()) {
      console.warn('[MediaService] Cloudinary not configured — returning mock folder list.');
      return [
        { path: 'warishlabs/products', name: 'products' },
        { path: 'warishlabs/labs', name: 'labs' },
        { path: 'warishlabs/blog', name: 'blog' },
        { path: 'warishlabs/general', name: 'general' },
      ];
    }

    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = parentPath
        ? await cloudinary.api.sub_folders(parentPath)
        : await cloudinary.api.root_folders();

      const folders: Array<{ name: string; path: string }> = response.folders || [];
      return folders.map((f) => ({
        path: f.path,
        name: f.name,
      }));
    } catch (err) {
      console.error('[MediaService] Error listing folders:', err);
      return [];
    }
  }

  /**
   * Recursively walks the entire Cloudinary folder tree starting from root.
   * Returns a flat array of all folder entries: { path, name }.
   * Uses breadth-first traversal to avoid deep call stacks.
   */
  static async walkAllFolders(): Promise<CloudinaryFolderEntry[]> {
    const allFolders: CloudinaryFolderEntry[] = [];
    const queue: Array<string | undefined> = [undefined]; // undefined = root

    while (queue.length > 0) {
      const current = queue.shift();
      const children = await MediaService.listFolders(current);
      for (const child of children) {
        allFolders.push(child);
        queue.push(child.path); // Enqueue this folder to list its children
      }
    }

    return allFolders;
  }

  /**
   * Lists assets inside a specific Cloudinary folder path.
   * Returns array of asset metadata (url, dimensions, size, format).
   */
  static async listFolderAssets(folderPath: string, maxResults = 50): Promise<CloudinaryAssetMeta[]> {
    if (!isConfigured()) {
      console.warn('[MediaService] Cloudinary not configured — returning empty asset list.');
      return [];
    }

    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: maxResults,
        resource_type: 'image',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.resources || []).map((r: any) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width || 0,
        height: r.height || 0,
        bytes: r.bytes || 0,
        format: r.format || '',
        fileName: r.public_id.split('/').pop() || r.public_id,
        createdAt: r.created_at || '',
      }));
    } catch (err) {
      console.error('[MediaService] Error listing folder assets:', err);
      return [];
    }
  }

  /**
   * Lists all assets under the root 'warishlabs' prefix recursively
   */
  static async listAllAssets(maxResults = 500): Promise<CloudinaryAssetMeta[]> {
    if (!isConfigured()) {
      console.warn('[MediaService] Cloudinary not configured — returning empty asset list.');
      return [];
    }

    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'warishlabs',
        max_results: maxResults,
        resource_type: 'image',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.resources || []).map((r: any) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width || 0,
        height: r.height || 0,
        bytes: r.bytes || 0,
        format: r.format || '',
        fileName: r.public_id.split('/').pop() || r.public_id,
        createdAt: r.created_at || '',
      }));
    } catch (err) {
      console.error('[MediaService] Error listing all assets:', err);
      return [];
    }
  }
}
