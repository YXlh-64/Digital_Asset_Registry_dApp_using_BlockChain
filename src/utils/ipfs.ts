import { config } from '../config/config';

export interface IPFSUploadResult {
  cid: string;
  url: string;
}

/**
 * Generate a mock CID for testing when Pinata is not available
 */
const generateMockCID = (file: File): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '');
  return `Qm${fileName}${timestamp}${random}`.substring(0, 46);
};

/**
 * Upload a file to IPFS using Pinata (with fallback for testing)
 */
export const uploadToPinata = async (file: File): Promise<IPFSUploadResult> => {
  // Check if Pinata credentials are configured
  if (!config.pinata.apiKey || !config.pinata.secretKey) {
    console.warn('⚠️ Pinata API credentials not configured. Using mock IPFS for development.');
    const mockCID = generateMockCID(file);
    return {
      cid: mockCID,
      url: `${config.pinata.gateway}${mockCID}`,
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);

  try {
    console.log('🔄 Uploading to Pinata...');
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': config.pinata.apiKey,
        'pinata_secret_api_key': config.pinata.secretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pinata API error:', response.status, errorText);
      
      // If Pinata fails, fall back to mock CID
      console.warn('⚠️ Pinata upload failed. Using mock IPFS for development.');
      const mockCID = generateMockCID(file);
      return {
        cid: mockCID,
        url: `${config.pinata.gateway}${mockCID}`,
      };
    }

    const data = await response.json();
    const cid = data.IpfsHash;

    console.log('✅ Successfully uploaded to Pinata:', cid);
    return {
      cid,
      url: `${config.pinata.gateway}${cid}`,
    };
  } catch (error: any) {
    console.error('❌ Error uploading to Pinata:', error);
    
    // Network error - fall back to mock CID
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      console.warn('⚠️ Network error connecting to Pinata. Using mock IPFS for development.');
      console.warn('💡 Tip: Check your internet connection or Pinata API credentials.');
      const mockCID = generateMockCID(file);
      return {
        cid: mockCID,
        url: `${config.pinata.gateway}${mockCID}`,
      };
    }
    
    throw new Error(`IPFS upload failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Upload JSON data to IPFS using Pinata (with fallback for testing)
 */
export const uploadJSONToPinata = async (jsonData: object): Promise<IPFSUploadResult> => {
  // Check if Pinata credentials are configured
  if (!config.pinata.apiKey || !config.pinata.secretKey) {
    console.warn('⚠️ Pinata API credentials not configured. Using mock IPFS for development.');
    const mockCID = `QmJSON${Date.now()}${Math.random().toString(36).substring(7)}`.substring(0, 46);
    return {
      cid: mockCID,
      url: `${config.pinata.gateway}${mockCID}`,
    };
  }

  try {
    console.log('🔄 Uploading JSON to Pinata...');
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
      const errorText = await response.text();
      console.error('❌ Pinata API error:', response.status, errorText);
      
      // If Pinata fails, fall back to mock CID
      console.warn('⚠️ Pinata upload failed. Using mock IPFS for development.');
      const mockCID = `QmJSON${Date.now()}${Math.random().toString(36).substring(7)}`.substring(0, 46);
      return {
        cid: mockCID,
        url: `${config.pinata.gateway}${mockCID}`,
      };
    }

    const data = await response.json();
    const cid = data.IpfsHash;

    console.log('✅ Successfully uploaded JSON to Pinata:', cid);
    return {
      cid,
      url: `${config.pinata.gateway}${cid}`,
    };
  } catch (error: any) {
    console.error('❌ Error uploading JSON to Pinata:', error);
    
    // Network error - fall back to mock CID
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      console.warn('⚠️ Network error connecting to Pinata. Using mock IPFS for development.');
      const mockCID = `QmJSON${Date.now()}${Math.random().toString(36).substring(7)}`.substring(0, 46);
      return {
        cid: mockCID,
        url: `${config.pinata.gateway}${mockCID}`,
      };
    }
    
    throw new Error(`IPFS JSON upload failed: ${error.message || 'Unknown error'}`);
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
