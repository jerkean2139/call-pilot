import { v2 as cloudinary } from 'cloudinary';

export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export function getUploadSignature(folder: string, resourceType: 'image' | 'video' = 'image') {
  const cl = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);

  const params: Record<string, any> = {
    timestamp,
    folder,
    resource_type: resourceType,
  };

  // Auto-generate thumbnail for videos
  if (resourceType === 'video') {
    params.eager = 'c_thumb,w_400,h_400,g_auto/f_jpg';
    params.eager_async = true;
  }

  const signature = cl.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
    resourceType,
    ...(resourceType === 'video' ? { eager: params.eager, eagerAsync: true } : {}),
  };
}
