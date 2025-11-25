import { Contract } from 'ethers';
import { getContract, getReadOnlyContract } from './web3';

export interface AssetData {
  id: number;
  name: string;
  assetType: string;
  description: string;
  assetURI: string;
  author: string;
  owner: string;
  creationTimestamp: number;
}

export interface UsageEntry {
  actor: string;
  timestamp: number;
  description: string;
}

/**
 * Register a new asset on the blockchain
 */
export const registerAsset = async (
  name: string,
  assetType: string,
  description: string,
  assetURI: string
): Promise<{ assetId: number; txHash: string }> => {
  try {
    const contract = await getContract();
    
    // Call the registerAsset function
    const tx = await contract.registerAsset(name, assetType, description, assetURI);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Extract assetId from the event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'AssetRegistered';
      } catch {
        return false;
      }
    });
    
    let assetId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      assetId = Number(parsed?.args[0]);
    }
    
    return {
      assetId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error registering asset:', error);
    throw new Error(error.reason || error.message || 'Failed to register asset');
  }
};

/**
 * Get asset details from the blockchain
 */
export const viewAsset = async (assetId: number): Promise<AssetData> => {
  try {
    const contract = await getReadOnlyContract();
    
    const result = await contract.viewAsset(assetId);
    
    return {
      id: Number(result[0]),
      name: result[1],
      assetType: result[2],
      description: result[3],
      assetURI: result[4],
      author: result[5],
      owner: result[6],
      creationTimestamp: Number(result[7]),
    };
  } catch (error: any) {
    console.error('Error viewing asset:', error);
    throw new Error(error.reason || error.message || 'Failed to view asset');
  }
};

/**
 * Transfer ownership of an asset
 */
export const transferOwnership = async (
  assetId: number,
  newOwner: string
): Promise<string> => {
  try {
    const contract = await getContract();
    
    const tx = await contract.transferOwnership(assetId, newOwner);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error transferring ownership:', error);
    throw new Error(error.reason || error.message || 'Failed to transfer ownership');
  }
};

/**
 * Grant permission to a user for an asset
 */
export const grantPermission = async (
  assetId: number,
  grantee: string
): Promise<string> => {
  try {
    const contract = await getContract();
    
    const tx = await contract.grantPermission(assetId, grantee);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error granting permission:', error);
    throw new Error(error.reason || error.message || 'Failed to grant permission');
  }
};

/**
 * Revoke permission from a user for an asset
 */
export const revokePermission = async (
  assetId: number,
  grantee: string
): Promise<string> => {
  try {
    const contract = await getContract();
    
    const tx = await contract.revokePermission(assetId, grantee);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error revoking permission:', error);
    throw new Error(error.reason || error.message || 'Failed to revoke permission');
  }
};

/**
 * Log usage of an asset
 */
export const logUsage = async (
  assetId: number,
  usageDescription: string
): Promise<string> => {
  try {
    const contract = await getContract();
    
    const tx = await contract.logUsage(assetId, usageDescription);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error logging usage:', error);
    throw new Error(error.reason || error.message || 'Failed to log usage');
  }
};

/**
 * Check if a user has permission for an asset
 */
export const hasPermission = async (
  assetId: number,
  userAddress: string
): Promise<boolean> => {
  try {
    const contract = await getReadOnlyContract();
    
    return await contract.hasPermission(assetId, userAddress);
  } catch (error: any) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Get usage count for an asset
 */
export const getUsageCount = async (assetId: number): Promise<number> => {
  try {
    const contract = await getReadOnlyContract();
    
    const count = await contract.usageCount(assetId);
    return Number(count);
  } catch (error: any) {
    console.error('Error getting usage count:', error);
    return 0;
  }
};

/**
 * Get a specific usage entry
 */
export const viewUsageEntry = async (
  assetId: number,
  index: number
): Promise<UsageEntry> => {
  try {
    const contract = await getReadOnlyContract();
    
    const result = await contract.viewUsageEntry(assetId, index);
    
    return {
      actor: result[0],
      timestamp: Number(result[1]),
      description: result[2],
    };
  } catch (error: any) {
    console.error('Error viewing usage entry:', error);
    throw new Error(error.reason || error.message || 'Failed to view usage entry');
  }
};

/**
 * Get all usage entries for an asset
 */
export const getAllUsageEntries = async (assetId: number): Promise<UsageEntry[]> => {
  try {
    const count = await getUsageCount(assetId);
    const entries: UsageEntry[] = [];
    
    for (let i = 0; i < count; i++) {
      const entry = await viewUsageEntry(assetId, i);
      entries.push(entry);
    }
    
    return entries;
  } catch (error: any) {
    console.error('Error getting all usage entries:', error);
    return [];
  }
};

/**
 * Listen for contract events
 */
export const listenToEvents = async (
  eventName: string,
  callback: (...args: any[]) => void
): Promise<void> => {
  try {
    const contract = await getReadOnlyContract();
    contract.on(eventName, callback);
  } catch (error) {
    console.error(`Error listening to ${eventName}:`, error);
  }
};

/**
 * Remove event listener
 */
export const removeEventListener = async (
  eventName: string,
  callback: (...args: any[]) => void
): Promise<void> => {
  try {
    const contract = await getReadOnlyContract();
    contract.off(eventName, callback);
  } catch (error) {
    console.error(`Error removing listener for ${eventName}:`, error);
  }
};

/**
 * Get usage logs for an asset from blockchain events
 */
export const getUsageLogs = async (assetId: number): Promise<Array<{
  user: string;
  description: string;
  timestamp: number;
}>> => {
  try {
    const contract = await getReadOnlyContract();
    
    // Query UsageLogged events for this asset
    const filter = contract.filters.UsageLogged(assetId);
    const events = await contract.queryFilter(filter);
    
    // Parse events into usage logs
    const logs = events.map((event: any) => ({
      user: event.args.user,
      description: event.args.description,
      timestamp: Number(event.args.timestamp)
    }));
    
    return logs;
  } catch (error: any) {
    console.error('Error fetching usage logs:', error);
    return [];
  }
};

/**
 * Get permissions for an asset from blockchain events
 */
export const getAssetPermissions = async (assetId: number): Promise<string[]> => {
  try {
    const contract = await getReadOnlyContract();
    
    // Get the asset to get owner
    const asset = await contract.viewAsset(assetId);
    const owner = asset.owner;
    
    // Query PermissionGranted and PermissionRevoked events
    const grantedFilter = contract.filters.PermissionGranted(assetId);
    const revokedFilter = contract.filters.PermissionRevoked(assetId);
    
    const grantedEvents = await contract.queryFilter(grantedFilter);
    const revokedEvents = await contract.queryFilter(revokedFilter);
    
    // Build permission set
    const permissions = new Set<string>([owner.toLowerCase()]); // Owner always has permission
    
    // Add granted permissions
    grantedEvents.forEach((event: any) => {
      permissions.add(event.args.grantee.toLowerCase());
    });
    
    // Remove revoked permissions (but not owner)
    revokedEvents.forEach((event: any) => {
      const revoked = event.args.grantee.toLowerCase();
      if (revoked !== owner.toLowerCase()) {
        permissions.delete(revoked);
      }
    });
    
    return Array.from(permissions);
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return [];
  }
};
