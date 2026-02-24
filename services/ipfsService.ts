// Mock IPFS service for decentralized storage integration

export const uploadToIPFS = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 100) progress = 100;
      if (onProgress) onProgress(progress);
      
      if (progress === 100) {
        clearInterval(interval);
        // Generate a mock IPFS CID
        const mockCid = 'Qm' + Array.from({length: 44}, () => Math.floor(Math.random() * 36).toString(36)).join('');
        resolve(`ipfs://${mockCid}`);
      }
    }, 200);
  });
};

export const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockCid = 'Qm' + Array.from({length: 44}, () => Math.floor(Math.random() * 36).toString(36)).join('');
      resolve(`ipfs://${mockCid}`);
    }, 1000);
  });
};
