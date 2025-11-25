import { useState, useEffect } from 'react';
import { ArrowLeft, Database, FileCode, FolderOpen, FileText, Key, Calendar, Users, Send, UserPlus, UserMinus, Download } from 'lucide-react';
import { Asset } from '../App';
import TransferOwnershipModal from './TransferOwnershipModal';
import GrantAccessModal from './GrantAccessModal';
import RevokeAccessModal from './RevokeAccessModal';
import { fetchFromIPFS } from '../utils/ipfs';
import { logUsage, getUsageLogs } from '../utils/contract';

interface AssetDetailProps {
  asset: Asset;
  walletAddress: string;
  onTransferOwnership: (assetId: string, newOwner: string) => void;
  onGrantAccess: (assetId: string, userAddress: string) => void;
  onRevokeAccess: (assetId: string, userAddress: string) => void;
  onLogUsage: (assetId: string, description: string) => void;
  onBack: () => void;
}

export default function AssetDetail({
  asset,
  walletAddress,
  onTransferOwnership,
  onGrantAccess,
  onRevokeAccess,
  onLogUsage,
  onBack
}: AssetDetailProps) {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [blockchainLogs, setBlockchainLogs] = useState<Array<{
    user: string;
    description: string;
    timestamp: number;
  }>>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Use case-insensitive comparison for wallet addresses
  const isOwner = asset.owner.toLowerCase() === walletAddress.toLowerCase();
  const hasAccess = isOwner || asset.permissions.some(addr => 
    addr.toLowerCase() === walletAddress.toLowerCase()
  );

  // Load usage logs from blockchain
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const assetIdNum = parseInt(asset.id);
        if (!isNaN(assetIdNum)) {
          console.log('Loading usage logs from blockchain for asset:', assetIdNum);
          const logs = await getUsageLogs(assetIdNum);
          console.log('Loaded blockchain logs:', logs);
          setBlockchainLogs(logs);
        }
      } catch (error) {
        console.error('Failed to load blockchain logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    };
    
    loadLogs();
  }, [asset.id]);

  // Debug logging
  console.log('AssetDetail - Permission Check:', {
    assetName: asset.name,
    walletAddress,
    owner: asset.owner,
    permissions: asset.permissions,
    isOwner,
    hasAccess,
    downloadButtonWillShow: hasAccess
  });

  const handleDownload = async () => {
    if (!hasAccess) {
      setDownloadError("You don't have access to download this asset");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Check if asset has assetURI field (from blockchain)
      // Otherwise use asset.id as fallback
      let ipfsHash = (asset as any).assetURI || asset.id;
      
      console.log('Attempting download with hash:', ipfsHash);
      
      // If using mock data (numeric IDs), show helpful error
      if (/^\d+$/.test(ipfsHash)) {
        setDownloadError(
          'This is mock data without a real IPFS file. ' +
          'Register a real asset with a file to test downloads, ' +
          'or integrate with blockchain to load real assets.'
        );
        return;
      }
      
      // STEP 1: Log usage to blockchain FIRST (requires gas payment)
      // This ensures the user pays before downloading
      const assetIdNum = parseInt(asset.id);
      if (!isNaN(assetIdNum)) {
        const usageMsg = `User ${walletAddress} downloaded the asset file "${asset.name}"`;
        console.log('Logging usage to blockchain (user must confirm and pay gas)...');
        
        try {
          await logUsage(assetIdNum, usageMsg);
          console.log('✅ Transaction confirmed - Usage logged to blockchain');
        } catch (logError: any) {
          console.error('Failed to log usage to blockchain:', logError);
          // If user rejects transaction or it fails, don't proceed with download
          setDownloadError(
            logError.code === 4001 || logError.code === 'ACTION_REJECTED'
              ? 'Transaction cancelled. You must confirm the transaction to download the asset.'
              : 'Failed to record download on blockchain. Please try again.'
          );
          return; // Stop here - no download without payment
        }
      }
      
      // STEP 2: Only after blockchain confirmation, fetch and download the file
      console.log('Fetching file from IPFS...');
      const fileData = await fetchFromIPFS(ipfsHash);
      
      // Create a blob URL and trigger download
      let blob: Blob;
      
      if (fileData instanceof Blob) {
        blob = fileData;
      } else {
        // If it's JSON data, convert to blob
        blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.name || `asset-${ipfsHash.slice(0, 8)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Download started successfully');
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(
        error instanceof Error 
          ? error.message 
          : 'Failed to download asset. Make sure the asset has a valid IPFS CID.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const getTypeIcon = (type: Asset['type']) => {
    switch (type) {
      case 'dataset': return Database;
      case 'model': return FileCode;
      case 'project': return FolderOpen;
      case 'report': return FileText;
    }
  };

  const getTypeBadgeColor = (type: Asset['type']) => {
    switch (type) {
      case 'dataset': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'model': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'project': return 'bg-green-100 text-green-700 border-green-200';
      case 'report': return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const TypeIcon = getTypeIcon(asset.type);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-gray-900 mb-2">{asset.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm border ${getTypeBadgeColor(asset.type)}`}>
                {asset.type}
              </span>
              {isOwner && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                  Owner
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Asset Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Description</label>
                <p className="text-gray-900">{asset.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Author</label>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <code className="text-sm text-gray-900">{truncateAddress(asset.author)}</code>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Current Owner</label>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <code className="text-sm text-gray-900">{truncateAddress(asset.owner)}</code>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Creation Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{new Date(asset.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Permissions</h2>
              <span className="text-sm text-gray-600">{asset.permissions.length} user{asset.permissions.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-2">
              {asset.permissions.map((permission, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <code className="text-sm text-gray-900">{truncateAddress(permission)}</code>
                    {permission === asset.owner && (
                      <span className="text-xs text-green-600">(Owner)</span>
                    )}
                    {permission === walletAddress && permission !== asset.owner && (
                      <span className="text-xs text-blue-600">(You)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Logs - Only visible to owner and authorized users */}
          {hasAccess && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900">Usage Logs (Blockchain)</h2>
                <span className="text-sm text-gray-600">
                  {loadingLogs ? 'Loading...' : `${blockchainLogs.length} log${blockchainLogs.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              {loadingLogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading logs from blockchain...</p>
                </div>
              ) : blockchainLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Database className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">No usage logs yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {blockchainLogs.map((log, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-900 mb-2">{log.description || 'No description'}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          <span className="font-mono">
                            {log.user ? `${log.user.slice(0, 6)}...${log.user.slice(-4)}` : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {log.timestamp ? new Date(log.timestamp * 1000).toLocaleString() : 'Unknown time'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-2">
              {/* Download Button - Available to anyone with access */}
              {hasAccess && (
                <>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Asset
                      </>
                    )}
                  </button>
                  
                  {downloadError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{downloadError}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Request Access Button - For non-owners without access */}
              {!isOwner && !hasAccess && (
                <button
                  onClick={() => {
                    alert(`To request access to this asset:\n\n1. Copy this asset owner's address: ${asset.owner}\n2. Contact the owner directly\n3. Share your wallet address: ${walletAddress}\n4. Ask them to grant you access using the "Grant Access" button\n\nThe owner will receive your request and can approve it from their dashboard.`);
                  }}
                  style={{ backgroundColor: '#9333ea', color: 'white' }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-md"
                >
                  <Key className="w-5 h-5" />
                  Request Access
                </button>
              )}
              
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Transfer Ownership
                  </button>
                  
                  <button
                    onClick={() => setShowGrantModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    Grant Access
                  </button>
                  
                  {asset.permissions.length > 1 && (
                    <button
                      onClick={() => setShowRevokeModal(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <UserMinus className="w-5 h-5" />
                      Revoke Access
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Asset ID */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
            <label className="text-sm text-gray-700 mb-2 block">Asset ID</label>
            <code className="text-xs text-gray-900 break-all">{asset.id}</code>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTransferModal && (
        <TransferOwnershipModal
          asset={asset}
          onClose={() => setShowTransferModal(false)}
          onTransfer={onTransferOwnership}
        />
      )}
      
      {showGrantModal && (
        <GrantAccessModal
          asset={asset}
          onClose={() => setShowGrantModal(false)}
          onGrant={onGrantAccess}
        />
      )}
      
      {showRevokeModal && (
        <RevokeAccessModal
          asset={asset}
          currentUser={walletAddress}
          onClose={() => setShowRevokeModal(false)}
          onRevoke={onRevokeAccess}
        />
      )}
    </div>
  );
}
