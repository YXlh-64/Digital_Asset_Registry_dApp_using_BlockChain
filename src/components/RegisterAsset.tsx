import { useState } from 'react';
import { ArrowLeft, Upload, Database, FileCode, FolderOpen, FileText } from 'lucide-react';
import { Asset } from '../App';
import { uploadToPinata } from '../utils/ipfs';
import { registerAsset } from '../utils/contract';
import TransactionFeedback from './TransactionFeedback';

interface RegisterAssetProps {
  onSubmit: () => void; // Changed: just notify completion, no asset data
  onCancel: () => void;
}

export default function RegisterAsset({ onSubmit, onCancel }: RegisterAssetProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'dataset' as Asset['type'],
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  
  // Transaction states
  const [txStatus, setTxStatus] = useState<'idle' | 'uploading' | 'confirming' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter asset name');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setError('');
    
    try {
      // Check if connected to Sepolia testnet
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain ID:', chainId);
        
        // Sepolia chainId is 0xaa36a7 (11155111 in decimal)
        if (chainId !== '0xaa36a7') {
          setError(
            '⚠️ Wrong Network! Please switch MetaMask to "Sepolia Test Network". ' +
            'You are currently on network: ' + chainId + '. ' +
            'Get free Sepolia ETH from: https://sepoliafaucet.com/'
          );
          setTxStatus('error');
          return;
        }
      }
      
      // Step 1: Upload file to IPFS
      setTxStatus('uploading');
      console.log('Uploading file to IPFS...');
      const assetUploadResult = await uploadToPinata(file);
      console.log('File uploaded to IPFS, CID:', assetUploadResult.cid);

      // Step 2: Register on blockchain
      setTxStatus('confirming');
      console.log('Registering asset on blockchain...');
      const result = await registerAsset(
        formData.name,
        formData.type,
        formData.description,
        assetUploadResult.cid  // Use .cid property
      );
      
      console.log('Asset registered! Asset ID:', result.assetId, 'TX:', result.txHash);
      setTxHash(result.txHash);
      setTxStatus('success');

      // Notify parent after delay
      setTimeout(() => {
        onSubmit();
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      setTxStatus('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const assetTypes = [
    { value: 'dataset', label: 'Dataset', icon: Database, color: 'blue' },
    { value: 'model', label: 'Model', icon: FileCode, color: 'purple' },
    { value: 'project', label: 'Project', icon: FolderOpen, color: 'green' },
    { value: 'report', label: 'Report', icon: FileText, color: 'amber' }
  ] as const;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-gray-900 mb-2">Register New Asset</h1>
        <p className="text-gray-600">Add a new digital asset to the blockchain registry</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Asset Name */}
          <div className="mb-6">
            <label htmlFor="asset-name" className="block text-sm text-gray-700 mb-2">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              id="asset-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., COVID-19 Research Dataset"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Asset Type */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-3">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {assetTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                
                const getBorderColor = () => {
                  if (!isSelected) return 'border-gray-200 bg-gray-50 hover:border-gray-300';
                  switch (type.color) {
                    case 'blue': return 'border-blue-500 bg-blue-50';
                    case 'purple': return 'border-purple-500 bg-purple-50';
                    case 'green': return 'border-green-500 bg-green-50';
                    case 'amber': return 'border-amber-500 bg-amber-50';
                  }
                };
                
                const getIconBgColor = () => {
                  if (!isSelected) return 'bg-white';
                  switch (type.color) {
                    case 'blue': return 'bg-blue-100';
                    case 'purple': return 'bg-purple-100';
                    case 'green': return 'bg-green-100';
                    case 'amber': return 'bg-amber-100';
                  }
                };
                
                const getIconColor = () => {
                  if (!isSelected) return 'text-gray-400';
                  switch (type.color) {
                    case 'blue': return 'text-blue-600';
                    case 'purple': return 'text-purple-600';
                    case 'green': return 'text-green-600';
                    case 'amber': return 'text-amber-600';
                  }
                };
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${getBorderColor()}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
                      <Icon className={`w-5 h-5 ${getIconColor()}`} />
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a detailed description of your asset..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm text-gray-700 mb-2">
              Upload File (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-3 w-full px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {fileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Any file type up to 50MB
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Once registered, this asset will be recorded on the blockchain. 
              You will be assigned as the owner and can manage permissions and transfer ownership later.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={txStatus !== 'idle'}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(txStatus === 'uploading' || txStatus === 'confirming') ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {txStatus === 'uploading' ? 'Uploading...' : 'Registering...'}
                </>
              ) : (
                'Register Asset'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={txStatus !== 'idle'}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}