import axios from 'axios';

export interface PinataUploadResponse {
  ipfsHash: string;
  ipfsUrl: string;
}

/**
 * Uploads a file to IPFS via the server-side Pinata proxy.
 * @param file The file to upload
 * @returns The IPFS hash and gateway URL
 */
export const uploadToIPFS = async (file: File, onProgress?: (progress: number) => void): Promise<PinataUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/api/pinata/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('IPFS Upload Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to upload file to IPFS');
  }
};

/**
 * Uploads JSON metadata to IPFS via Pinata (optional, for NFT metadata)
 * @param metadata The JSON metadata object
 * @returns The IPFS hash and gateway URL
 */
export const uploadJSONToIPFS = async (metadata: any): Promise<PinataUploadResponse> => {
  // For JSON, we can either add a new server route or do it client-side if we have a JWT.
  // Since we are using a server proxy for files, let's stick to that pattern for consistency.
  // We'll just convert the JSON to a File object and use the existing route.
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const file = new File([blob], 'metadata.json', { type: 'application/json' });
  
  return uploadToIPFS(file);
};
