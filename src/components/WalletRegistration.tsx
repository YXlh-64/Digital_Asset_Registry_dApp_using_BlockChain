import { useState, useEffect } from 'react';
import { Wallet, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface WalletRegistrationProps {
  onRegister: (address: string) => void;
}

export default function WalletRegistration({ onRegister }: WalletRegistrationProps) {
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const { connect, isConnecting, isMetaMaskAvailable, account } = useWallet();

  // Auto-register when account is connected via MetaMask
  useEffect(() => {
    if (account) {
      onRegister(account);
    }
  }, [account, onRegister]);

  const handleConnectWallet = async () => {
    setError('');
    
    if (!isMetaMaskAvailable) {
      setError('MetaMask is not installed. Please install MetaMask extension to continue.');
      return;
    }

    try {
      await connect();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet. Please try again.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    // Basic validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Invalid wallet address format. Must start with 0x and be 42 characters long.');
      return;
    }

    // Register with manually entered address
    onRegister(walletAddress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Digital Asset Registry</h1>
          <p className="text-gray-600">Secure blockchain-based asset management</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 text-sm">
              Connect your MetaMask wallet to access the Digital Asset Registry and manage your assets securely on the blockchain.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">Register AI datasets, models, and research outputs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">Manage permissions and transfer ownership securely</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">Track usage and maintain transparent audit logs</p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* MetaMask Not Installed Warning */}
          {!isMetaMaskAvailable && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-2 font-semibold">
                MetaMask Not Detected
              </p>
              <p className="text-xs text-amber-700 mb-2">
                Please install MetaMask to connect your wallet.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Download MetaMask →
              </a>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting || !isMetaMaskAvailable}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect with MetaMask</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or enter manually</span>
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                id="wallet-address"
                type="text"
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  setError('');
                }}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Register & Continue
            </button>
          </form>

          {/* Info Note */}
          <div className="mt-6 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Your wallet address is used to authenticate ownership and manage permissions. Make sure you have access to this wallet.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by Ethereum blockchain
        </p>
      </div>
    </div>
  );
}