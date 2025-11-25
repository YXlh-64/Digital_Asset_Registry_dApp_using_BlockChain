import { useState } from 'react';
import { Wallet, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface WalletRegistrationProps {
  onRegister: (address: string) => void;
}

export default function WalletRegistration({ onRegister }: WalletRegistrationProps) {
  const [error, setError] = useState('');
  const { connect, isConnecting, isMetaMaskAvailable, account } = useWallet();

  const handleConnectWallet = async () => {
    setError('');
    
    if (!isMetaMaskAvailable) {
      setError('MetaMask is not installed. Please install MetaMask extension to continue.');
      return;
    }

    try {
      await connect();
      // The useWallet hook will update the account
      if (account) {
        onRegister(account);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Digital Asset Registry</h1>
          <p className="text-gray-600">Secure blockchain-based asset management</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-gray-900 mb-2">Register Your Wallet</h2>
            <p className="text-gray-600 text-sm">
              Connect your wallet to access the Digital Asset Registry and manage your assets securely on the blockchain.
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

          {/* Connect Button */}
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="wallet-address" className="block text-sm text-gray-700 mb-2">
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
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-all duration-200"
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
          Powered by blockchain technology
        </p>
      </div>
    </div>
  );
}
