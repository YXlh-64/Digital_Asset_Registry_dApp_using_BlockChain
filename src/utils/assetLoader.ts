import { viewAsset, getAllUsageEntries, hasPermission, getAssetPermissions } from './contract';
import { fetchFromIPFS } from './ipfs';
import { Asset, UsageLog } from '../App';

/**
 * Load all assets from the blockchain by querying sequential IDs
 */
export async function loadAllAssets(): Promise<Asset[]> {
  const assets: Asset[] = [];
  let assetId = 1;
  
  console.log('Loading assets from blockchain...');
  
  while (true) {
    try {
      console.log(`Querying asset ID ${assetId}...`);
      const assetData = await viewAsset(assetId);
      
      // Check if asset data is valid (has an owner address)
      if (!assetData.owner || assetData.owner === '0x0000000000000000000000000000000000000000') {
        console.log(`Asset ${assetId} does not exist (owner is zero address)`);
        break;
      }
      
      console.log(`Asset ${assetId} found:`, assetData);
      
      // Use contract data directly (no separate metadata file)
      // The assetURI points to the actual file, not metadata JSON
      const metadata = {
        name: assetData.name,
        type: mapAssetType(assetData.assetType),
        description: assetData.description,
        createdAt: new Date(assetData.creationTimestamp * 1000).toISOString().split('T')[0]
      };
      
      console.log(`Using metadata from contract for asset ${assetId}`);
      
      // Fetch usage logs and permissions
      const usageLogs = await loadUsageLogs(assetId);
      const permissions = await getAssetPermissions(assetId);
      
      const asset: Asset = {
        id: assetId.toString(),
        name: metadata.name || assetData.name,
        type: metadata.type || mapAssetType(assetData.assetType),
        description: metadata.description || assetData.description,
        author: assetData.author,
        owner: assetData.owner,
        createdAt: metadata.createdAt || new Date(assetData.creationTimestamp * 1000).toISOString().split('T')[0],
        permissions: permissions, // Load actual permissions from blockchain
        usageLogs
      };
      
      // Store IPFS URI for download functionality
      (asset as any).assetURI = assetData.assetURI;
      
      assets.push(asset);
      assetId++;
      
    } catch (error: any) {
      // No more assets or asset doesn't exist
      const errorMessage = error?.message || String(error);
      console.log(`Asset ${assetId} does not exist. Total assets found: ${assets.length}`);
      
      if (error.code === 'BAD_DATA' || 
          errorMessage.includes('could not decode result data') ||
          errorMessage.includes('Asset does not exist') ||
          errorMessage.includes('execution reverted')) {
        console.log('No more assets exist on blockchain');
      }
      break;
    }
  }
  
  return assets;
}

/**
 * Map blockchain asset type string to UI type
 */
function mapAssetType(assetType: string): 'dataset' | 'model' | 'project' | 'report' {
  const normalized = assetType.toLowerCase();
  if (normalized.includes('dataset')) return 'dataset';
  if (normalized.includes('model')) return 'model';
  if (normalized.includes('project')) return 'project';
  if (normalized.includes('report')) return 'report';
  return 'dataset'; // default
}

/**
 * Load only assets owned by specific wallet
 */
export async function loadMyAssets(walletAddress: string): Promise<Asset[]> {
  const allAssets = await loadAllAssets();
  console.log(`Filtering ${allAssets.length} total assets for wallet: ${walletAddress}`);
  
  const myAssets = allAssets.filter(asset => {
    const isOwner = asset.owner.toLowerCase() === walletAddress.toLowerCase();
    console.log(`Asset ${asset.id} "${asset.name}" - Owner: ${asset.owner}, Match: ${isOwner}`);
    return isOwner;
  });
  
  console.log(`Found ${myAssets.length} assets owned by ${walletAddress}`);
  return myAssets;
}

/**
 * Load assets where user has access (owner or granted permission)
 */
export async function loadAccessibleAssets(walletAddress: string): Promise<Asset[]> {
  const allAssets = await loadAllAssets();
  const accessibleAssets = allAssets.filter(asset => 
    asset.owner.toLowerCase() === walletAddress.toLowerCase() ||
    asset.permissions.some(addr => addr.toLowerCase() === walletAddress.toLowerCase())
  );
  console.log(`Found ${accessibleAssets.length} assets accessible to ${walletAddress}`);
  return accessibleAssets;
}

/**
 * Load a single asset by ID
 */
export async function loadAsset(assetId: number): Promise<Asset | null> {
  try {
    console.log(`Loading single asset ${assetId}...`);
    const assetData = await viewAsset(assetId);
    
    // Use contract data directly
    const metadata = {
      name: assetData.name,
      type: mapAssetType(assetData.assetType),
      description: assetData.description,
      createdAt: new Date(assetData.creationTimestamp * 1000).toISOString().split('T')[0]
    };
    
    const usageLogs = await loadUsageLogs(assetId);
    const permissions = await getAssetPermissions(assetId);
    
    const asset: Asset = {
      id: assetId.toString(),
      name: metadata.name || assetData.name,
      type: metadata.type || mapAssetType(assetData.assetType),
      description: metadata.description || assetData.description,
      author: assetData.author,
      owner: assetData.owner,
      createdAt: metadata.createdAt || new Date(assetData.creationTimestamp * 1000).toISOString().split('T')[0],
      permissions: permissions,
      usageLogs
    };
    
    // Store IPFS URI
    (asset as any).assetURI = assetData.assetURI;
    
    return asset;
  } catch (error) {
    console.error(`Failed to load asset ${assetId}:`, error);
    return null;
  }
}

/**
 * Fetch metadata JSON from IPFS (this is the actual file, not separate metadata)
 */
async function fetchAssetMetadata(assetURI: string): Promise<any> {
  console.log('Fetching asset file from IPFS:', assetURI);
  // For now, return null and use contract data
  // In a full implementation, you'd check if the file is JSON and parse it
  throw new Error('Metadata from IPFS not implemented, using contract data');
}

/**
 * Load usage logs for an asset
 */
async function loadUsageLogs(assetId: number): Promise<UsageLog[]> {
  try {
    const entries = await getAllUsageEntries(assetId);
    return entries.map((entry, index) => ({
      id: `${assetId}-${index}`,
      user: entry.actor, // Note: contract uses 'actor' not 'user'
      timestamp: new Date(Number(entry.timestamp) * 1000).toLocaleString(),
      description: entry.description
    }));
  } catch (error) {
    console.warn(`No usage logs found for asset ${assetId}`);
    return [];
  }
}
