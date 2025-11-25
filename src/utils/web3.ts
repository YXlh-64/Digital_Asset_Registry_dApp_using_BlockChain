import { BrowserProvider, Contract, Eip1193Provider } from 'ethers';
import contractABI from '../contracts/DigitalAssetRegistry.json';
import { config } from '../config/config';

// Types
export interface EthereumProvider extends Eip1193Provider {
  request: (args: { method: string; params?: Array<any> }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && !!(window.ethereum as any).isMetaMask;
};

/**
 * Get the Web3 provider from MetaMask
 */
export const getProvider = (): BrowserProvider | null => {
  if (!isMetaMaskInstalled()) {
    return null;
  }
  return new BrowserProvider(window.ethereum as any);
};

/**
 * Request account access from MetaMask
 */
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
  }

  try {
    // Prefer the EIP-1193 request method directly on window.ethereum because
    // some provider wrappers may not forward the prompt reliably in all environments.
    if (window.ethereum && typeof (window.ethereum as any).request === 'function') {
      try {
        const accounts: string[] = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please unlock MetaMask.');
        }
        return accounts[0];
      } catch (err: any) {
        // Normalize user-rejection errors
        if (err && (err.code === 4001 || err.code === 'ACTION_REJECTED')) {
          const e: any = new Error('User rejected the connection request.');
          e.code = 4001;
          throw e;
        }
        throw err;
      }
    }

    // Fallback: use ethers BrowserProvider.send if available
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');

    const accounts = await provider.send('eth_requestAccounts', [] as any);
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }
    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request.');
    }
    throw error;
  }
};

/**
 * Get the current connected account
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const provider = getProvider();
    if (!provider) return null;

    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Get the contract instance
 */
export const getContract = async (): Promise<Contract> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  if (!config.contractAddress) {
    throw new Error('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in .env file.');
  }

  const signer = await provider.getSigner();
  return new Contract(config.contractAddress, contractABI, signer);
};

/**
 * Get contract instance with read-only provider (no signer needed)
 */
export const getReadOnlyContract = async (): Promise<Contract> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  if (!config.contractAddress) {
    throw new Error('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in .env file.');
  }

  return new Contract(config.contractAddress, contractABI, provider);
};

/**
 * Get the current network/chain ID
 */
export const getChainId = async (): Promise<string> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  const network = await provider.getNetwork();
  return '0x' + network.chainId.toString(16);
};

/**
 * Switch to a specific network
 */
export const switchNetwork = async (networkKey: keyof typeof config.networks): Promise<void> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const network = config.networks[networkKey];
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        });
      } catch (addError) {
        throw new Error('Failed to add network to MetaMask');
      }
    } else {
      throw error;
    }
  }
};

/**
 * Check if the current network is Sepolia and switch if not
 */
export const ensureSepoliaNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 Current Network Chain ID:', chainId);
    
    if (chainId !== config.networks.sepolia.chainId) {
      console.log(`⚠️ Wrong network detected. Current: ${chainId}, Expected: ${config.networks.sepolia.chainId}`);
      console.log('🔄 Attempting to switch to Sepolia...');
      
      await switchNetwork('sepolia');
      console.log('✅ Successfully switched to Sepolia');
      return true;
    }
    
    console.log('✅ Already on Sepolia network');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to switch network:', error);
    if (error.code === 4001) {
      throw new Error('User rejected the network switch request. Please switch to Sepolia manually in MetaMask.');
    }
    throw new Error(`Failed to switch to Sepolia network: ${error.message}`);
  }
};

/**
 * Listen for account changes
 */
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};

/**
 * Listen for chain changes
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
};

/**
 * Remove account change listener
 */
export const removeAccountsListener = (callback: (accounts: string[]) => void): void => {
  if (window.ethereum) {
    window.ethereum.removeListener('accountsChanged', callback);
  }
};

/**
 * Remove chain change listener
 */
export const removeChainListener = (callback: (chainId: string) => void): void => {
  if (window.ethereum) {
    window.ethereum.removeListener('chainChanged', callback);
  }
};

/**
 * Format address for display (0x1234...5678)
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Get transaction receipt and wait for confirmation
 */
export const waitForTransaction = async (txHash: string, confirmations: number = 1) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  return await provider.waitForTransaction(txHash, confirmations);
};
