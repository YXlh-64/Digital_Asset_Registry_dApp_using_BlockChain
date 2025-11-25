import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { Asset } from '../App';

interface GrantAccessModalProps {
  asset: Asset;
  onClose: () => void;
  onGrant: (assetId: string, userAddress: string) => void;
}

export default function GrantAccessModal({ asset, onClose, onGrant }: GrantAccessModalProps) {
  const [userAddress, setUserAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAddress = (address: string): boolean => {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!validateAddress(userAddress)) {
      setError('Invalid wallet address format');
      return;
    }

    if (asset.permissions.some(p => p.toLowerCase() === userAddress.toLowerCase())) {
      setError('This user already has access');
      return;
    }

    setIsSubmitting(true);
    try {
      await onGrant(asset.id, userAddress);
      onClose();
    } catch (error) {
      setError('Failed to grant access');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-gray-900">Grant Access</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Asset Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Asset Name</p>
          <p className="text-gray-900">{asset.name}</p>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-900">
            Grant access to allow a user to view and log usage for this asset. They will not be able to 
            transfer ownership or manage permissions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="user-address" className="block text-sm text-gray-700 mb-2">
              User Wallet Address <span className="text-red-500">*</span>
            </label>
            <input
              id="user-address"
              type="text"
              value={userAddress}
              onChange={(e) => {
                setUserAddress(e.target.value);
                setError('');
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Grant Access'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
