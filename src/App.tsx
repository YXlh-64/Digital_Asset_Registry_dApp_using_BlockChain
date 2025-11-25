import { useState, useEffect } from 'react';
import WalletRegistration from './components/WalletRegistration';
import Dashboard from './components/Dashboard';
import RegisterAsset from './components/RegisterAsset';
import AssetDetail from './components/AssetDetail';
import ExplorePage from './components/ExplorePage';
import Sidebar from './components/Sidebar';
import { loadMyAssets, loadAllAssets, loadAsset } from './utils/assetLoader';
import { logUsage, transferOwnership, grantPermission, revokePermission } from './utils/contract';

export interface Asset {
  id: string;
  name: string;
  type: 'dataset' | 'model' | 'project' | 'report';
  description: string;
  author: string;
  owner: string;
  createdAt: string;
  permissions: string[];
  usageLogs: UsageLog[];
}

export interface UsageLog {
  id: string;
  description: string;
  user: string;
  timestamp: string;
}

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isWalletRegistered, setIsWalletRegistered] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'register' | 'detail' | 'explore'>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]); // My assets (for dashboard)
  const [allAssets, setAllAssets] = useState<Asset[]>([]); // All assets (for explore)
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Clear wallet on mount to force fresh connection
  useEffect(() => {
    // Clear any saved wallet to force user to connect
    localStorage.removeItem('walletAddress');
    setWalletAddress('');
    setIsWalletRegistered(false);
  }, []);

  // Load assets from BLOCKCHAIN when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadAssetsFromBlockchain();
    }
  }, [walletAddress]);

  const loadAssetsFromBlockchain = async () => {
    setIsLoadingAssets(true);
    setLoadError(null);
    
    try {
      console.log('Loading assets from blockchain for:', walletAddress);
      
      // Load my assets for dashboard
      const myAssets = await loadMyAssets(walletAddress);
      console.log('Loaded my assets from blockchain:', myAssets);
      setAssets(myAssets);
      
      // Load ALL assets for explore page
      const allAssetsData = await loadAllAssets();
      console.log('Loaded all assets from blockchain:', allAssetsData);
      setAllAssets(allAssetsData);
      
      if (myAssets.length === 0) {
        console.log('No assets found on blockchain for this wallet. This is normal for a new wallet.');
      }
      
      // Also save to localStorage as backup
      if (myAssets.length > 0) {
        localStorage.setItem(`assets_${walletAddress}`, JSON.stringify(myAssets));
      }
    } catch (error) {
      console.error('Failed to load assets from blockchain:', error);
      
      // Check if it's just a "no assets" error vs actual connection error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('could not decode result data') || errorMessage.includes('BAD_DATA')) {
        console.log('No assets registered yet on this contract. This is normal for a new deployment.');
        setAssets([]);
        setAllAssets([]);
        setLoadError(null); // Not really an error, just no assets yet
      } else {
        setLoadError('Failed to load assets from blockchain. Make sure contract is deployed and you\'re on the correct network (Sepolia).');
        
        // Fallback to localStorage
        const savedAssets = localStorage.getItem(`assets_${walletAddress}`);
        if (savedAssets) {
          try {
            setAssets(JSON.parse(savedAssets));
            console.log('Loaded assets from localStorage as fallback');
          } catch (e) {
            setAssets([]);
          }
        } else {
          setAssets([]);
        }
      }
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleWalletRegistration = (address: string) => {
    setWalletAddress(address);
    setIsWalletRegistered(true);
    // Do NOT save to localStorage - wallet should not persist
    // localStorage.setItem('walletAddress', address);
  };

  const handleDisconnectWallet = () => {
    console.log('🔴 DISCONNECT CLICKED - Starting disconnect process...');
    
    // Clear all state
    setWalletAddress('');
    setIsWalletRegistered(false);
    setAssets([]);
    setAllAssets([]);
    setSelectedAsset(null);
    setCurrentView('dashboard');
    
    console.log('🔴 State cleared, clearing localStorage...');
    
    // Clear localStorage
    localStorage.removeItem('walletAddress');
    localStorage.clear();
    
    console.log('🔴 localStorage cleared, reloading page...');
    
    // Force page reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleAddAsset = (asset: Omit<Asset, 'id' | 'author' | 'owner' | 'createdAt' | 'permissions' | 'usageLogs'>) => {
    // This is now just a placeholder - actual registration happens in RegisterAsset component
    // After blockchain registration, we reload all assets
    loadAssetsFromBlockchain();
    setCurrentView('dashboard');
  };

  const handleAssetRegistered = () => {
    // Reload assets from blockchain after successful registration
    loadAssetsFromBlockchain();
    setCurrentView('dashboard');
  };

  const handleTransferOwnership = async (assetId: string, newOwner: string) => {
    try {
      const assetIdNum = parseInt(assetId);
      if (isNaN(assetIdNum)) {
        console.error('Invalid asset ID');
        return;
      }

      // Step 1: Grant permission to yourself BEFORE transferring (so you retain access)
      console.log('Granting access to old owner (yourself) before transfer...');
      await grantPermission(assetIdNum, walletAddress);
      console.log('✅ Access granted to old owner');

      // Step 2: Log the transfer (while we still have permission)
      const usageMsg = `User ${walletAddress} transferred ownership to ${newOwner}`;
      console.log('Logging ownership transfer...');
      await logUsage(assetIdNum, usageMsg);
      console.log('✅ Transfer logged to blockchain');

      // Step 3: Transfer ownership to new owner
      console.log('Transferring ownership on blockchain...');
      await transferOwnership(assetIdNum, newOwner);
      console.log('✅ Ownership transferred on blockchain');

      console.log('✅ You retained access as the previous owner');

      // Reload assets from blockchain to get updated data
      console.log('Reloading assets from blockchain...');
      await loadAssetsFromBlockchain();
      
      // Update selectedAsset if we're currently viewing it
      if (selectedAsset && selectedAsset.id === assetId) {
        const updatedAsset = await loadAsset(assetIdNum);
        if (updatedAsset) {
          setSelectedAsset(updatedAsset);
          console.log('✅ Selected asset refreshed after ownership transfer');
        }
      }
      
      // Navigate back to dashboard since user is no longer the owner
      setCurrentView('dashboard');
      setSelectedAsset(null);
      
      alert('Ownership transferred successfully! You retained access to this asset.');
      
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      alert('Failed to transfer ownership. Please try again.');
    }
  };

  const handleGrantAccess = async (assetId: string, userAddress: string) => {
    try {
      const assetIdNum = parseInt(assetId);
      if (isNaN(assetIdNum)) {
        console.error('Invalid asset ID');
        return;
      }

      // Call blockchain function to grant permission
      console.log('Granting access on blockchain...');
      await grantPermission(assetIdNum, userAddress);
      console.log('✅ Access granted on blockchain');

      // Log the action
      const usageMsg = `User ${walletAddress} granted access to ${userAddress}`;
      console.log('Logging access grant...');
      await logUsage(assetIdNum, usageMsg);
      console.log('✅ Access grant logged to blockchain');

      // Reload assets from blockchain to get updated data
      await loadAssetsFromBlockchain();
      
      // Update selectedAsset if we're currently viewing it
      if (selectedAsset && selectedAsset.id === assetId) {
        const updatedAsset = await loadAsset(assetIdNum);
        if (updatedAsset) {
          setSelectedAsset(updatedAsset);
          console.log('✅ Selected asset refreshed with new permissions');
        }
      }
      
    } catch (error) {
      console.error('Failed to grant access:', error);
      alert('Failed to grant access. Please try again.');
    }
  };

  const handleRevokeAccess = async (assetId: string, userAddress: string) => {
    try {
      const assetIdNum = parseInt(assetId);
      if (isNaN(assetIdNum)) {
        console.error('Invalid asset ID');
        return;
      }

      // Call blockchain function to revoke permission
      console.log('Revoking access on blockchain...');
      await revokePermission(assetIdNum, userAddress);
      console.log('✅ Access revoked on blockchain');

      // Log the action
      const usageMsg = `User ${walletAddress} revoked access from ${userAddress}`;
      console.log('Logging access revocation...');
      await logUsage(assetIdNum, usageMsg);
      console.log('✅ Access revocation logged to blockchain');

      // Reload assets from blockchain to get updated data
      await loadAssetsFromBlockchain();
      
      // Update selectedAsset if we're currently viewing it
      if (selectedAsset && selectedAsset.id === assetId) {
        const updatedAsset = await loadAsset(assetIdNum);
        if (updatedAsset) {
          setSelectedAsset(updatedAsset);
          console.log('✅ Selected asset refreshed with updated permissions');
        }
      }
      
    } catch (error) {
      console.error('Failed to revoke access:', error);
      alert('Failed to revoke access. Please try again.');
    }
  };

  const handleLogUsage = async (assetId: string, description: string) => {
    const newLog: UsageLog = {
      id: Date.now().toString(),
      description,
      user: walletAddress,
      timestamp: new Date().toLocaleString()
    };
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, usageLogs: [newLog, ...asset.usageLogs] } : asset
    ));
    if (selectedAsset?.id === assetId) {
      setSelectedAsset({ ...selectedAsset, usageLogs: [newLog, ...selectedAsset.usageLogs] });
    }
    
    // Log to blockchain
    try {
      const assetIdNum = parseInt(assetId);
      if (!isNaN(assetIdNum)) {
        const usageMsg = `User ${walletAddress} - ${description}`;
        console.log('Logging custom usage to blockchain:', usageMsg);
        await logUsage(assetIdNum, usageMsg);
        console.log('Custom usage logged to blockchain');
      }
    } catch (error) {
      console.error('Failed to log custom usage to blockchain:', error);
    }
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setCurrentView('detail');
  };

  if (!isWalletRegistered) {
    return <WalletRegistration onRegister={handleWalletRegistration} />;
  }

  // Show loading state while loading assets from blockchain
  if (isLoadingAssets) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 mb-2">Loading your assets from blockchain...</p>
          <p className="text-sm text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Show error banner if blockchain loading failed
  const errorBanner = loadError && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {loadError}
            <button
              onClick={loadAssetsFromBlockchain}
              className="ml-4 font-medium underline text-yellow-700 hover:text-yellow-600"
            >
              Retry
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">{errorBanner && <div className="fixed top-0 left-0 right-0 z-50">{errorBanner}</div>}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView}
        walletAddress={walletAddress}
        onDisconnect={handleDisconnectWallet}
      />
      <main className="flex-1 ml-64">
        {currentView === 'dashboard' && (
          <Dashboard 
            assets={assets}
            walletAddress={walletAddress}
            onViewAsset={handleViewAsset}
            onTransferOwnership={handleTransferOwnership}
            onGrantAccess={handleGrantAccess}
            onRevokeAccess={handleRevokeAccess}
          />
        )}
        {currentView === 'register' && (
          <RegisterAsset onSubmit={handleAssetRegistered} onCancel={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'detail' && selectedAsset && (
          <AssetDetail 
            asset={selectedAsset}
            walletAddress={walletAddress}
            onTransferOwnership={handleTransferOwnership}
            onGrantAccess={handleGrantAccess}
            onRevokeAccess={handleRevokeAccess}
            onLogUsage={handleLogUsage}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'explore' && (
          <ExplorePage 
            assets={allAssets}
            walletAddress={walletAddress}
            onViewAsset={handleViewAsset}
            onLogUsage={handleLogUsage}
          />
        )}
      </main>
    </div>
  );
}
