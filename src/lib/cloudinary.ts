import type { MediaItem } from '../types';

interface SignResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: 'image' | 'video';
  eager?: string;
  eagerAsync?: boolean;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

async function getSignature(token: string, resourceType: 'image' | 'video'): Promise<SignResponse> {
  const res = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resourceType }),
  });
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

export async function uploadToCloudinary(
  file: File,
  token: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<MediaItem> {
  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';

  const sign = await getSignature(token, resourceType);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', sign.timestamp.toString());
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);
  if (sign.eager) {
    formData.append('eager', sign.eager);
    formData.append('eager_async', 'true');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`;

    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);

        const media: MediaItem = {
          url: data.secure_url,
          type: resourceType,
          publicId: data.public_id,
        };

        if (isVideo) {
          media.duration = data.duration;
          // Generate thumbnail URL from Cloudinary transformations
          media.thumbnailUrl = data.secure_url
            .replace('/video/upload/', '/video/upload/c_thumb,w_400,h_400,g_auto/f_jpg/')
            .replace(/\.[^.]+$/, '.jpg');
        }

        resolve(media);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(formData);
  });
}

export function getMediaUrl(item: MediaItem | string): string {
  if (typeof item === 'string') return item; // base64 backward compat
  return item.url;
}

export function isVideoMedia(item: MediaItem | string): boolean {
  if (typeof item === 'string') return false; // base64 is always image
  return item.type === 'video';
}

export function getVideoThumbnail(item: MediaItem): string {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  // Fallback: generate from URL
  return item.url
    .replace('/video/upload/', '/video/upload/c_thumb,w_400,h_400,g_auto/f_jpg/')
    .replace(/\.[^.]+$/, '.jpg');
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
