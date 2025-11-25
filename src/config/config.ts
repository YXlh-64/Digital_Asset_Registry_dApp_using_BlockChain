export const config = {
  // Contract address - will be set after deployment
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  
  // IPFS Configuration
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY || '',
    secretKey: import.meta.env.VITE_PINATA_SECRET_KEY || '',
    gateway: 'https://gateway.pinata.cloud/ipfs/',
  },
  
  // Supported networks
  networks: {
    sepolia: {
      chainId: '0xaa36a7', // 11155111 in hex
      chainName: 'Sepolia Test Network',
      rpcUrls: ['https://sepolia.infura.io/v3/'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
      nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18,
      },
    },
    goerli: {
      chainId: '0x5', // 5 in hex
      chainName: 'Goerli Test Network',
      rpcUrls: ['https://goerli.infura.io/v3/'],
      blockExplorerUrls: ['https://goerli.etherscan.io'],
      nativeCurrency: {
        name: 'GoerliETH',
        symbol: 'ETH',
        decimals: 18,
      },
    },
    polygonMumbai: {
      chainId: '0x13881', // 80001 in hex
      chainName: 'Polygon Mumbai Testnet',
      rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
      blockExplorerUrls: ['https://mumbai.polygonscan.com'],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
    },
    localhost: {
      chainId: '0x7a69', // 31337 in hex (Hardhat default)
      chainName: 'Localhost',
      rpcUrls: ['http://127.0.0.1:8545/'],
      blockExplorerUrls: [],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  },
};
