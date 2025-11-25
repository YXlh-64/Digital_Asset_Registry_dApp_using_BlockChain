import { useState, useEffect } from 'react';
import { Wallet, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface WalletRegistrationProps {
  onRegister: (address: string) => void;
}

export default function WalletRegistration({ onRegister }: WalletRegistrationProps) {
  const [error, setError] = useState('');
  const { connect, isConnecting, isMetaMaskAvailable, account } = useWallet();

  // Auto-register when account is connected
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
