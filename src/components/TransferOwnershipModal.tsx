import { useState } from 'react';
import { X, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { Asset } from '../App';

interface TransferOwnershipModalProps {
  asset: Asset;
  onClose: () => void;
  onTransfer: (assetId: string, newOwner: string) => void;
}

export default function TransferOwnershipModal({ asset, onClose, onTransfer }: TransferOwnershipModalProps) {
  const [newOwner, setNewOwner] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAddress = (address: string): boolean => {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newOwner.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!validateAddress(newOwner)) {
      setError('Invalid wallet address format');
      return;
    }

    if (newOwner.toLowerCase() === asset.owner.toLowerCase()) {
      setError('This address is already the owner');
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransfer(asset.id, newOwner);
      onClose();
    } catch (error) {
      setError('Failed to transfer ownership');
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
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-gray-900">Transfer Ownership</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-900">
              <strong>Warning:</strong> Transferring ownership will give full control of this asset to the new owner. 
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Asset Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Asset Name</p>
          <p className="text-gray-900">{asset.name}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="new-owner" className="block text-sm text-gray-700 mb-2">
              New Owner Address <span className="text-red-500">*</span>
            </label>
            <input
              id="new-owner"
              type="text"
              value={newOwner}
              onChange={(e) => {
                setNewOwner(e.target.value);
                setError('');
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
