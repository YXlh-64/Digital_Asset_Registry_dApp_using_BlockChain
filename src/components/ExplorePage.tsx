import { useState } from 'react';
import { Database, FileCode, FolderOpen, FileText, Key, Calendar, Users, Eye, Search, Filter } from 'lucide-react';
import { Asset } from '../App';

interface ExplorePageProps {
  assets: Asset[];
  walletAddress: string;
  onViewAsset: (asset: Asset) => void;
  onLogUsage: (assetId: string, description: string) => void;
}

export default function ExplorePage({ assets, walletAddress, onViewAsset, onLogUsage }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Asset['type'] | 'all'>('all');

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

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const assetTypes = [
    { value: 'all', label: 'All Assets', count: assets.length },
    { value: 'dataset', label: 'Datasets', count: assets.filter(a => a.type === 'dataset').length },
    { value: 'model', label: 'Models', count: assets.filter(a => a.type === 'model').length },
    { value: 'project', label: 'Projects', count: assets.filter(a => a.type === 'project').length },
    { value: 'report', label: 'Reports', count: assets.filter(a => a.type === 'report').length }
  ] as const;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Explore Assets</h1>
        <p className="text-gray-600">Browse and discover digital assets from the community</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by name or description..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as Asset['type'] | 'all')}
              className="pl-12 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[180px]"
            >
              {assetTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredAssets.length} of {assets.length} asset{assets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const TypeIcon = getTypeIcon(asset.type);
            // Use case-insensitive comparison
            const isOwner = asset.owner.toLowerCase() === walletAddress.toLowerCase();
            const hasAccess = isOwner || asset.permissions.some(addr => 
              addr.toLowerCase() === walletAddress.toLowerCase()
            );
            
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
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs border ${getTypeBadgeColor(asset.type)}`}>
                          {asset.type}
                        </span>
                        {isOwner && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs bg-green-50 text-green-700 border border-green-200">
                            Owner
                          </span>
                        )}
                      </div>
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
                    <Key className="w-4 h-4" />
                    <span>Owner: {truncateAddress(asset.owner)}</span>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewAsset(asset)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                {/* Access Status */}
                {!hasAccess && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-xs text-amber-800 text-center">
                      Request access from owner to use this asset
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
