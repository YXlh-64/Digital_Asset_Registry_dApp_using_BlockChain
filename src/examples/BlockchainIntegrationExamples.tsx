/**
 * BLOCKCHAIN INTEGRATION EXAMPLES
 * 
 * This file demonstrates how to integrate blockchain functionality
 * into your React components. Use these examples as a reference.
 */

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import * as contract from '../utils/contract';
import * as ipfs from '../utils/ipfs';
import TransactionFeedback, { TransactionStatus } from '../components/TransactionFeedback';

// ============================================================================
// EXAMPLE 1: Register Asset with IPFS Upload
// ============================================================================

export function RegisterAssetExample() {
  const { account } = useWallet();
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleRegisterAsset = async (
    name: string,
    type: string,
    description: string,
    file?: File
  ) => {
    try {
      setStatus('uploading');
      setError('');

      // Step 1: Upload to IPFS (if file provided)
      let assetURI = '';
      if (file) {
        const result = await ipfs.uploadAssetMetadata({
          name,
          type,
          description,
          file,
        });
        assetURI = result.cid; // Store the CID
      }

      // Step 2: Register on blockchain
      setStatus('confirming');
      const { assetId, txHash: hash } = await contract.registerAsset(
        name,
        type,
        description,
        assetURI
      );

      setTxHash(hash);
      setStatus('success');

      console.log('Asset registered with ID:', assetId);
      return assetId;
      
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      throw err;
    }
  };

  return (
    <div>
      <TransactionFeedback
        status={status}
        txHash={txHash}
        error={error}
        onClose={() => setStatus('idle')}
      />
      {/* Your form UI here */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: View Asset from Blockchain
// ============================================================================

export function ViewAssetExample({ assetId }: { assetId: number }) {
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadAsset = async () => {
    try {
      setLoading(true);
      
      // Fetch from blockchain
      const assetData = await contract.viewAsset(assetId);
      
      // If there's an IPFS CID, fetch metadata
      if (assetData.assetURI) {
        const metadata = await ipfs.fetchFromIPFS(assetData.assetURI);
        setAsset({ ...assetData, metadata });
      } else {
        setAsset(assetData);
      }
      
    } catch (err) {
      console.error('Error loading asset:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadAsset}>Load Asset</button>
      {loading && <p>Loading...</p>}
      {asset && (
        <div>
          <h2>{asset.name}</h2>
          <p>Type: {asset.assetType}</p>
          <p>Owner: {asset.owner}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Transfer Ownership
// ============================================================================

export function TransferOwnershipExample({ assetId }: { assetId: number }) {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  const handleTransfer = async () => {
    try {
      setStatus('confirming');
      
      const hash = await contract.transferOwnership(assetId, newOwnerAddress);
      
      setTxHash(hash);
      setStatus('success');
      
    } catch (err: any) {
      setStatus('error');
    }
  };

  return (
    <div>
      <input
        value={newOwnerAddress}
        onChange={(e) => setNewOwnerAddress(e.target.value)}
        placeholder="0x..."
      />
      <button onClick={handleTransfer}>Transfer</button>
      
      <TransactionFeedback
        status={status}
        txHash={txHash}
        message="Ownership transferred successfully!"
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Grant Permission
// ============================================================================

export function GrantPermissionExample({ assetId }: { assetId: number }) {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [granteeAddress, setGranteeAddress] = useState('');

  const handleGrant = async () => {
    try {
      setStatus('confirming');
      
      await contract.grantPermission(assetId, granteeAddress);
      
      setStatus('success');
      
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div>
      <input
        value={granteeAddress}
        onChange={(e) => setGranteeAddress(e.target.value)}
        placeholder="User address"
      />
      <button onClick={handleGrant}>Grant Access</button>
      
      <TransactionFeedback status={status} />
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Log Usage
// ============================================================================

export function LogUsageExample({ assetId }: { assetId: number }) {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [description, setDescription] = useState('');

  const handleLogUsage = async () => {
    try {
      setStatus('confirming');
      
      await contract.logUsage(assetId, description);
      
      setStatus('success');
      setDescription(''); // Clear form
      
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe how you used this asset..."
      />
      <button onClick={handleLogUsage}>Log Usage</button>
      
      <TransactionFeedback
        status={status}
        message="Usage logged successfully!"
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Load Usage History
// ============================================================================

export function UsageHistoryExample({ assetId }: { assetId: number }) {
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsageHistory = async () => {
    try {
      setLoading(true);
      
      const logs = await contract.getAllUsageEntries(assetId);
      setUsageLogs(logs);
      
    } catch (err) {
      console.error('Error loading usage history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadUsageHistory}>Load Usage History</button>
      
      {loading && <p>Loading...</p>}
      
      {usageLogs.map((log, index) => (
        <div key={index}>
          <p>User: {log.actor}</p>
          <p>Description: {log.description}</p>
          <p>Time: {new Date(log.timestamp * 1000).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Check Permission
// ============================================================================

export function CheckPermissionExample({ assetId, userAddress }: { assetId: number; userAddress: string }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAccess = async () => {
    try {
      setLoading(true);
      
      const permission = await contract.hasPermission(assetId, userAddress);
      setHasAccess(permission);
      
    } catch (err) {
      console.error('Error checking permission:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkAccess}>Check Access</button>
      {loading && <p>Checking...</p>}
      {!loading && (
        <p>{hasAccess ? '✓ Has access' : '✗ No access'}</p>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Complete Form with Error Handling
// ============================================================================

export function CompleteFormExample() {
  const { account, isConnected } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    type: 'dataset',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter an asset name');
      return;
    }

    try {
      setStatus('uploading');
      setError('');

      // Upload to IPFS if file exists
      let assetURI = '';
      if (file) {
        const { cid } = await ipfs.uploadAssetMetadata({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          file,
        });
        assetURI = cid;
      }

      // Register on blockchain
      setStatus('confirming');
      const { assetId, txHash: hash } = await contract.registerAsset(
        formData.name,
        formData.type,
        formData.description,
        assetURI
      );

      setTxHash(hash);
      setStatus('success');

      // Reset form
      setTimeout(() => {
        setFormData({ name: '', type: 'dataset', description: '' });
        setFile(null);
        setStatus('idle');
      }, 3000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register asset');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Asset name"
        required
      />
      
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
      />
      
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      
      <button type="submit" disabled={status !== 'idle'}>
        {status === 'idle' ? 'Register Asset' : 'Processing...'}
      </button>

      <TransactionFeedback
        status={status}
        message={status === 'success' ? 'Asset registered successfully!' : undefined}
        txHash={txHash}
        error={error}
        onClose={() => {
          setStatus('idle');
          setError('');
        }}
      />
    </form>
  );
}
