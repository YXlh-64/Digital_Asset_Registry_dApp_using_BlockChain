import { CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from 'lucide-react';

export type TransactionStatus = 'idle' | 'uploading' | 'confirming' | 'success' | 'error';

interface TransactionFeedbackProps {
  status: TransactionStatus;
  message?: string;
  txHash?: string;
  error?: string;
  onClose?: () => void;
}

export default function TransactionFeedback({ 
  status, 
  message, 
  txHash, 
  error,
  onClose 
}: TransactionFeedbackProps) {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: Loader2,
          iconClass: 'text-blue-600 animate-spin',
          bgClass: 'bg-blue-50 border-blue-200',
          title: 'Uploading to IPFS...',
          description: message || 'Please wait while we upload your file to IPFS.',
        };
      case 'confirming':
        return {
          icon: Loader2,
          iconClass: 'text-purple-600 animate-spin',
          bgClass: 'bg-purple-50 border-purple-200',
          title: 'Confirming Transaction...',
          description: message || 'Please confirm the transaction in MetaMask and wait for blockchain confirmation.',
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconClass: 'text-green-600',
          bgClass: 'bg-green-50 border-green-200',
          title: 'Success!',
          description: message || 'Transaction completed successfully.',
        };
      case 'error':
        return {
          icon: XCircle,
          iconClass: 'text-red-600',
          bgClass: 'bg-red-50 border-red-200',
          title: 'Transaction Failed',
          description: error || 'An error occurred. Please try again.',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;
  const isProcessing = status === 'uploading' || status === 'confirming';

  return (
    <div className={`p-4 rounded-xl border ${config.bgClass} transition-all`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 flex-shrink-0 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {config.title}
          </h3>
          <p className="text-sm text-gray-700 mb-2">
            {config.description}
          </p>
          
          {/* Transaction Hash Link */}
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>View on Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Close Button for final states */}
          {!isProcessing && onClose && (
            <button
              onClick={onClose}
              className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator for processing states */}
      {isProcessing && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      )}
    </div>
  );
}

// Separate component for inline error messages
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
