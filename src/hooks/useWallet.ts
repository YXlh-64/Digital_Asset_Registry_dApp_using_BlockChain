import { useState, useEffect, useCallback } from 'react';
import {
  connectWallet,
  getCurrentAccount,
  onAccountsChanged,
  onChainChanged,
  removeAccountsListener,
  removeChainListener,
  isMetaMaskInstalled,
  getChainId,
} from '../utils/web3';

export const useWallet = () => {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    setIsMetaMaskAvailable(isMetaMaskInstalled());
  }, []);

  // Load existing connection on mount
  useEffect(() => {
    const loadAccount = async () => {
      try {
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          localStorage.setItem('walletAddress', currentAccount);
          
          // Get chain ID
          const currentChainId = await getChainId();
          setChainId(currentChainId);
        }
      } catch (err) {
        console.error('Error loading account:', err);
      }
    };

    if (isMetaMaskAvailable) {
      loadAccount();
    }
  }, [isMetaMaskAvailable]);

  // Handle account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setAccount('');
        localStorage.removeItem('walletAddress');
      } else if (accounts[0] !== account) {
        // User switched account
        setAccount(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
      // Reload page on network change (recommended by MetaMask)
      window.location.reload();
    };

    if (isMetaMaskAvailable) {
      onAccountsChanged(handleAccountsChanged);
      onChainChanged(handleChainChanged);

      return () => {
        removeAccountsListener(handleAccountsChanged);
        removeChainListener(handleChainChanged);
      };
    }
  }, [account, isMetaMaskAvailable]);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (!isMetaMaskAvailable) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      localStorage.setItem('walletAddress', connectedAccount);

      // Get chain ID
      const currentChainId = await getChainId();
      setChainId(currentChainId);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskAvailable]);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setAccount('');
    localStorage.removeItem('walletAddress');
  }, []);

  return {
    account,
    chainId,
    isConnecting,
    isConnected: !!account,
    error,
    isMetaMaskAvailable,
    connect,
    disconnect,
  };
};
