import { config } from '../config/config';

export interface IPFSUploadResult {
  cid: string;
  url: string;
}

/**
 * Upload a file to IPFS using Pinata
 */
export const uploadToPinata = async (file: File): Promise<IPFSUploadResult> => {
  if (!config.pinata.apiKey || !config.pinata.secretKey) {
    throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': config.pinata.apiKey,
        'pinata_secret_api_key': config.pinata.secretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.details || 'Failed to upload to IPFS');
    }

    const data = await response.json();
    const cid = data.IpfsHash;

    return {
      cid,
      url: `${config.pinata.gateway}${cid}`,
    };
  } catch (error: any) {
    console.error('Error uploading to Pinata:', error);
    throw new Error(error.message || 'Failed to upload file to IPFS');
  }
};

/**
 * Upload JSON data to IPFS using Pinata
 */
export const uploadJSONToPinata = async (jsonData: object): Promise<IPFSUploadResult> => {
  if (!config.pinata.apiKey || !config.pinata.secretKey) {
    throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env file.');
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': config.pinata.apiKey,
        'pinata_secret_api_key': config.pinata.secretKey,
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.details || 'Failed to upload JSON to IPFS');
    }

    const data = await response.json();
    const cid = data.IpfsHash;

    return {
      cid,
      url: `${config.pinata.gateway}${cid}`,
    };
  } catch (error: any) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error(error.message || 'Failed to upload JSON to IPFS');
  }
};

/**
 * Fetch data from IPFS using a CID
 */
export const fetchFromIPFS = async (cid: string): Promise<any> => {
  try {
    const response = await fetch(`${config.pinata.gateway}${cid}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.blob();
    }
  } catch (error: any) {
    console.error('Error fetching from IPFS:', error);
    throw new Error(error.message || 'Failed to fetch data from IPFS');
  }
};

/**
 * Upload asset metadata to IPFS
 * This creates a metadata file for the asset with additional details
 */
export const uploadAssetMetadata = async (metadata: {
  name: string;
  type: string;
  description: string;
  file?: File;
  additionalData?: any;
}): Promise<IPFSUploadResult> => {
  let fileCID = '';
  
  // Upload the actual file if provided
  if (metadata.file) {
    const fileResult = await uploadToPinata(metadata.file);
    fileCID = fileResult.cid;
  }

  // Create metadata object
  const metadataObject = {
    name: metadata.name,
    type: metadata.type,
    description: metadata.description,
    fileCID: fileCID,
    uploadedAt: new Date().toISOString(),
    ...metadata.additionalData,
  };

  // Upload metadata as JSON
  return await uploadJSONToPinata(metadataObject);
};

/**
 * Check if a CID is valid
 */
export const isValidCID = (cid: string): boolean => {
  // Basic CID validation (v0 or v1)
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Regex = /^[a-z2-7]{59}$/;
  
  return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};

/**
 * Extract CID from IPFS URL
 */
export const extractCIDFromURL = (url: string): string | null => {
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  
  // Handle gateway URLs
  const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // If already a CID, return it
  if (isValidCID(url)) {
    return url;
  }
  
  return null;
};

/**
 * Get IPFS gateway URL from CID
 */
export const getIPFSGatewayURL = (cid: string): string => {
  return `${config.pinata.gateway}${cid}`;
};
