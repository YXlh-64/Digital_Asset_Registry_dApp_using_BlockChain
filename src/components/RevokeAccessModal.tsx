import { useState } from 'react';
import { X, UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
import { Asset } from '../App';

interface RevokeAccessModalProps {
  asset: Asset;
  currentUser: string;
  onClose: () => void;
  onRevoke: (assetId: string, userAddress: string) => void;
}

export default function RevokeAccessModal({ asset, currentUser, onClose, onRevoke }: RevokeAccessModalProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out the owner from the list
  const otherUsers = asset.permissions.filter(p => p !== asset.owner);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (selectedUser === asset.owner) {
      setError('Cannot revoke access from the owner');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRevoke(asset.id, selectedUser);
      onClose();
    } catch (error) {
      setError('Failed to revoke access');
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
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-gray-900">Revoke Access</h2>
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

        {/* Warning */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-900">
              Revoking access will prevent the selected user from viewing or logging usage for this asset.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {otherUsers.length === 0 ? (
            <div className="mb-6 p-6 text-center">
              <p className="text-gray-600">No other users have access to this asset.</p>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-3">
                Select User to Revoke <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {otherUsers.map((user) => (
                  <label
                    key={user}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedUser === user
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="user"
                      value={user}
                      checked={selectedUser === user}
                      onChange={(e) => {
                        setSelectedUser(e.target.value);
                        setError('');
                      }}
                      className="w-4 h-4 text-red-600"
                    />
                    <div className="flex-1">
                      <code className="text-sm text-gray-900">{truncateAddress(user)}</code>
                      {user === currentUser && (
                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {error}
                </p>
              )}
            </div>
          )}

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
            {otherUsers.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Revoke Access'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
