import { useState } from 'react';
import { X, FileEdit, Clock } from 'lucide-react';
import { Asset } from '../App';

interface LogUsageModalProps {
  asset: Asset;
  onClose: () => void;
  onLog: (assetId: string, description: string) => void;
}

export default function LogUsageModal({ asset, onClose, onLog }: LogUsageModalProps) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const currentTimestamp = new Date().toLocaleString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    onLog(asset.id, description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileEdit className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-gray-900">Log Usage</h2>
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
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">
            Record how you used this asset. This log will be permanently stored on the blockchain 
            and visible to all users with access.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm text-gray-700 mb-2">
              Usage Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              placeholder="Describe how you used this asset..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {error}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {description.length} characters
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Timestamp</p>
              <p className="text-sm text-gray-900">{currentTimestamp}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Submit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
