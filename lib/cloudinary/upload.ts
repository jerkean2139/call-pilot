import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resourceType?: 'image' | 'video' | 'raw' | 'auto' } = {}
): Promise<{ url: string; publicId: string; thumbnailUrl?: string }> {
  const { folder = 'living-legacy', resourceType = 'auto' } = options;

  // If cloudinary isn't configured, return a placeholder
  if (!process.env.CLOUDINARY_API_KEY) {
    return {
      url: `https://placehold.co/800x600/f8e8e8/333?text=Upload+Preview`,
      publicId: `mock-${Date.now()}`,
      thumbnailUrl: `https://placehold.co/200x200/f8e8e8/333?text=Thumb`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl:
            resourceType === 'video'
              ? result.secure_url.replace('/upload/', '/upload/c_fill,h_200,w_200,so_0/')
              : result.secure_url.replace('/upload/', '/upload/c_fill,h_200,w_200/'),
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export function getOptimizedUrl(publicId: string, opts?: { width?: number; height?: number }) {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return publicId;
  const transforms = [`c_fill`, `q_auto`, `f_auto`];
  if (opts?.width) transforms.push(`w_${opts.width}`);
  if (opts?.height) transforms.push(`h_${opts.height}`);
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}
