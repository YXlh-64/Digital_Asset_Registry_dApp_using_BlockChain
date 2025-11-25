# 🔗 Digital Asset Registry - Blockchain dApp

A decentralized application (dApp) for registering and managing digital assets on the Ethereum blockchain with IPFS storage.

## 📋 Overview

The Digital Asset Registry is a Web3 application that allows users to:
- Register digital assets (datasets, ML models, projects, reports) on the blockchain
- Store files securely on IPFS (InterPlanetary File System)
- Manage permissions and access control
- Transfer ownership of assets
- Track usage history immutably
- Download assets with automatic usage logging

## ✨ Key Features

### 🔐 Blockchain Registration
- Immutable registration of digital assets on Ethereum
- Each asset gets a unique on-chain ID
- All metadata stored transparently on-chain

### 📦 IPFS Storage
- Decentralized file storage using Pinata
- Files are content-addressed and permanent
- Download assets with blockchain-verified access

### 👥 Access Control
- **Grant Access**: Give users permission to view and download assets
- **Revoke Access**: Remove access from specific users
- **Owner Controls**: Only owners can manage permissions
- **Transfer Ownership**: Transfer full control to another address

### 📊 Usage Tracking
- All downloads are logged on the blockchain
- Usage history is publicly auditable
- Automatic logging when downloading files
- Viewable usage logs with timestamps

### 🔍 Transparency
- All transactions are recorded on-chain
- Public verification of ownership and permissions
- Immutable audit trail

## 🚀 Getting Started

### Prerequisites

1. **MetaMask Wallet**
   - Install from [metamask.io](https://metamask.io/download/)
   - Create or import a wallet
   - Switch to **Sepolia Test Network**

2. **Get Test ETH**
   - Visit [sepoliafaucet.com](https://sepoliafaucet.com/)
   - Enter your wallet address
   - Receive free Sepolia ETH for transactions

3. **Node.js**
   - Version 18 or higher
   - npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Project

# Install dependencies
npm install
```

### Configuration

1. **Create `.env` file** in the project root:

```env
# Your deployed smart contract address on Sepolia
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere

# Pinata IPFS credentials (get from pinata.cloud)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

2. **Deploy Smart Contract** (if not already deployed):
   - Go to [remix.ethereum.org](https://remix.ethereum.org/)
   - Create `DigitalAssetRegistry.sol` with the contract code
   - Compile with Solidity 0.8.20+
   - Deploy to **Sepolia** network via MetaMask
   - Copy the deployed contract address to `.env`

3. **Get Pinata Credentials**:
   - Sign up at [pinata.cloud](https://pinata.cloud/)
   - Go to API Keys section
   - Generate new API key and secret
   - Add to `.env` file

### Running the Application

```bash
# Start development server
npm run dev

# Open browser at http://localhost:5173
```

## 📖 How to Use

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- Ensure you're on **Sepolia Test Network**

### 2. Register an Asset

**Steps:**
1. Click "Register Asset" in the sidebar
2. Fill in asset details:
   - **Name**: Asset title
   - **Type**: Dataset, Model, Project, or Report
   - **Description**: Brief description
   - **File**: Upload the actual asset file
3. Click "Register Asset"
4. Confirm transaction in MetaMask (pay gas fee)
5. Wait for IPFS upload + blockchain confirmation
6. Asset appears in your dashboard

**What Happens:**
- File is uploaded to IPFS (gets a unique CID)
- Smart contract records asset metadata on Ethereum
- You become the owner with full control

### 3. View Your Assets

**Dashboard:**
- See all assets you own
- View asset details, permissions, and usage logs
- Access management controls

**Explore Page:**
- Browse all assets registered on the platform
- Search and filter by type
- View assets you have access to

### 4. Manage Permissions

**Grant Access:**
1. Open an asset you own
2. Click "Grant Access"
3. Enter user's wallet address (0x...)
4. Confirm transaction
5. User can now view and download the asset

**Revoke Access:**
1. Open an asset you own
2. Click "Revoke Access"
3. Select user to revoke
4. Confirm transaction
5. User loses access immediately

**Important Notes:**
- Only the owner can grant/revoke access
- The owner always retains access
- Previous owners retain access after transfer

### 5. Transfer Ownership

**Steps:**
1. Open an asset you own
2. Click "Transfer Ownership"
3. Enter new owner's wallet address
4. Confirm transaction
5. Ownership transferred immediately

**What Happens:**
- New address becomes the owner
- You automatically get granted access (to retain access)
- Only new owner can manage permissions
- Transfer is logged in usage history

### 6. Download Assets

**For Assets You Have Access To:**
1. Open asset detail page
2. Click "Download Asset"
3. Confirm transaction (gas fee for logging)
4. Download starts automatically

**What Happens:**
- Usage is logged on blockchain first
- File is fetched from IPFS
- Download starts in your browser

**Requirements:**
- You must have access (owner or granted permission)
- Must pay gas fee for usage logging
- Must have Sepolia ETH for transaction

### 7. View Usage History

**On Asset Detail Page:**
- Scroll to "Usage History" section
- See all usage logs from blockchain:
  - Who accessed the asset
  - When it was accessed
  - What action was performed
  - Blockchain timestamp

**Usage Logs Include:**
- Downloads
- Ownership transfers
- Access grants/revokes
- Custom usage entries

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Lucide React (icons)

**Blockchain:**
- Ethereum (Sepolia testnet)
- Solidity smart contract
- ethers.js v6 (Web3 interaction)
- MetaMask (wallet connection)

**Storage:**
- IPFS via Pinata
- Content-addressed storage
- Permanent file hosting

### Smart Contract

**Functions:**
- `registerAsset()` - Register new asset
- `transferOwnership()` - Transfer to new owner
- `grantPermission()` - Give user access
- `revokePermission()` - Remove user access
- `logUsage()` - Record usage event
- `viewAsset()` - Get asset details
- `hasPermission()` - Check user access

**Events:**
- `AssetRegistered` - New asset created
- `OwnershipTransferred` - Owner changed
- `PermissionGranted` - Access granted
- `PermissionRevoked` - Access removed
- `UsageLogged` - Usage recorded

### File Structure

```
Project/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── AssetDetail.tsx    # Asset detail view
│   │   ├── RegisterAsset.tsx  # Registration form
│   │   ├── ExplorePage.tsx    # Browse all assets
│   │   └── ...                # Modals and UI components
│   ├── utils/             # Utility functions
│   │   ├── contract.ts        # Smart contract interactions
│   │   ├── web3.ts            # Web3 connection logic
│   │   ├── ipfs.ts            # IPFS upload/download
│   │   └── assetLoader.ts     # Load assets from blockchain
│   ├── config/            # Configuration
│   │   └── config.ts          # Contract address and config
│   ├── contracts/         # Smart contract ABI
│   │   └── DigitalAssetRegistry.json
│   └── App.tsx            # Main app component
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 Troubleshooting

### Common Issues

**"Wrong Network" Error:**
- MetaMask must be on **Sepolia Test Network**
- Click MetaMask → Networks → Add/Switch to Sepolia
- Get test ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)

**"Insufficient Funds" Error:**
- You need Sepolia ETH for gas fees
- Visit a faucet to get free test ETH
- Each transaction costs ~0.001-0.01 ETH

**"Transaction Failed" Error:**
- Check you have enough gas
- Try increasing gas limit in MetaMask
- Ensure contract address is correct in `.env`

**IPFS Upload Fails:**
- Verify Pinata API credentials in `.env`
- Check file size (Pinata free tier has limits)
- Ensure internet connection is stable

**Assets Not Loading:**
- Check console for errors
- Verify contract is deployed to Sepolia
- Ensure contract address matches in config
- Try refreshing the page

**Download Not Working:**
- Ensure you have access to the asset
- Confirm transaction to log usage first
- Check browser console for errors

## 🔒 Security Notes

- **Private Keys**: Never share your private keys or seed phrase
- **Test Network**: This is for Sepolia testnet only (not real money)
- **Gas Fees**: Always verify transaction details in MetaMask
- **Access Control**: Only grant access to trusted addresses
- **IPFS**: Files on IPFS are public by CID (but CID is hard to guess)

## 🚧 Known Limitations

- Sepolia testnet only (not production Ethereum)
- File size limited by Pinata free tier
- No built-in file encryption
- Usage logs require gas fees
- No batch operations

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

This is a student/educational project. Feel free to fork and modify.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review MetaMask setup
3. Verify Sepolia testnet configuration
4. Check browser console for errors

---

**Happy Building! 🚀**
