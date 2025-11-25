import { useState } from 'react';
import { Database, FileCode, FolderOpen, FileText, Users, Calendar, Eye, Send, Key, UserPlus, UserMinus } from 'lucide-react';
import { Asset } from '../App';
import TransferOwnershipModal from './TransferOwnershipModal';
import GrantAccessModal from './GrantAccessModal';
import RevokeAccessModal from './RevokeAccessModal';

interface DashboardProps {
  assets: Asset[];
  walletAddress: string;
  onViewAsset: (asset: Asset) => void;
  onTransferOwnership: (assetId: string, newOwner: string) => void;
  onGrantAccess: (assetId: string, userAddress: string) => void;
  onRevokeAccess: (assetId: string, userAddress: string) => void;
}

export default function Dashboard({ 
  assets, 
  walletAddress, 
  onViewAsset,
  onTransferOwnership,
  onGrantAccess,
  onRevokeAccess
}: DashboardProps) {
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState<Asset | null>(null);
  const [selectedAssetForGrant, setSelectedAssetForGrant] = useState<Asset | null>(null);
  const [selectedAssetForRevoke, setSelectedAssetForRevoke] = useState<Asset | null>(null);

  // Use case-insensitive comparison for wallet addresses
  const myAssets = assets.filter(asset => 
    asset.owner.toLowerCase() === walletAddress.toLowerCase()
  );

  console.log('Dashboard: Filtering assets', {
    totalAssets: assets.length,
    myAssets: myAssets.length,
    walletAddress,
    assets: assets.map(a => ({ id: a.id, name: a.name, owner: a.owner }))
  });

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">My Assets</h1>
        <p className="text-gray-600">Manage and monitor your digital assets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Assets</p>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-900">{myAssets.length}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Datasets</p>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-900">{myAssets.filter(a => a.type === 'dataset').length}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Models</p>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileCode className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-900">{myAssets.filter(a => a.type === 'model').length}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Shared With</p>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-gray-900">
            {myAssets.reduce((acc, asset) => acc + (asset.permissions.length - 1), 0)} users
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      {myAssets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No assets yet</h3>
          <p className="text-gray-600 mb-6">Register your first digital asset to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {myAssets.map((asset) => {
            const TypeIcon = getTypeIcon(asset.type);
            
            return (
              <div key={asset.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 mb-1 truncate">{asset.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs border ${getTypeBadgeColor(asset.type)}`}>
                        {asset.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{asset.description}</p>

                {/* Metadata */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Key className="w-4 h-4" />
                    <span>Author: {truncateAddress(asset.author)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{asset.permissions.length} user{asset.permissions.length !== 1 ? 's' : ''} with access</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onViewAsset(asset)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => setSelectedAssetForTransfer(asset)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Transfer
                  </button>
                  <button
                    onClick={() => setSelectedAssetForGrant(asset)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Grant
                  </button>
                  {asset.permissions.length > 1 && (
                    <button
                      onClick={() => setSelectedAssetForRevoke(asset)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedAssetForTransfer && (
        <TransferOwnershipModal
          asset={selectedAssetForTransfer}
          onClose={() => setSelectedAssetForTransfer(null)}
          onTransfer={onTransferOwnership}
        />
      )}
      
      {selectedAssetForGrant && (
        <GrantAccessModal
          asset={selectedAssetForGrant}
          onClose={() => setSelectedAssetForGrant(null)}
          onGrant={onGrantAccess}
        />
      )}
      
      {selectedAssetForRevoke && (
        <RevokeAccessModal
          asset={selectedAssetForRevoke}
          currentUser={walletAddress}
          onClose={() => setSelectedAssetForRevoke(null)}
          onRevoke={onRevokeAccess}
        />
      )}
    </div>
  );
}
