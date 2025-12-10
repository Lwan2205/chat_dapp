# DChat dApp - Smart Contract & Frontend Integration

## What's Been Done

### ✅ 1. Smart Contract (Solidity)

Created a **production-ready smart contract** with the following features:

#### File: `contracts/src/DChatMessaging.sol`

**Features:**
- ✅ User registration with profile management
- ✅ 1-1 encrypted messaging
- ✅ Message read receipts
- ✅ Conversation tracking
- ✅ Admin fee management
- ✅ Reentrancy protection
- ✅ Access control

**Key Functions:**
- `registerUser()` - Register new user
- `updateProfile()` - Update profile
- `sendMessage()` - Send encrypted message
- `markAsRead()` - Mark message as read
- `getConversationMessages()` - Get all messages between two users
- `getUserProfile()` - Get user info
- `getAllUsers()` - Get all registered users

**Security Features:**
- Reentrancy Guard protection
- Input validation (username, message length)
- Owner-based access control
- Event emission for all state changes
- Gas-optimized storage

#### Contract Tests: `contracts/test/DChatMessaging.test.js`
- Comprehensive test suite covering all functions
- Tests for user registration, messaging, and admin functions
- Error handling and edge case validation

#### Deployment Script: `contracts/scripts/deploy.js`
- Automated deployment to Sepolia testnet
- Saves deployment info to JSON file

---

### ✅ 2. Frontend Web3 Integration

#### Hook: `src/hooks/useDChatContract.js`

**Purpose:** Manages all contract interactions

**Functions Provided:**
- `initializeContract()` - Initialize contract with MetaMask
- `registerUser()` - Call contract register function
- `updateProfile()` - Update user profile
- `getUserProfile()` - Fetch user data
- `getAllUsers()` - Get all users
- `sendMessage()` - Send encrypted message
- `markAsRead()` - Mark message as read
- `getMessage()` - Get specific message
- `getConversationMessages()` - Get full conversation
- `getUnreadCount()` - Get unread messages count
- `listenToMessageEvents()` - Listen to contract events

**Features:**
- Automatic error handling with toast notifications
- Loading states
- Event listening for real-time updates

---

#### Hook: `src/hooks/useMessageUtils.js`

**Message Management Utilities:**
- `useMessageEncryption()` - AES-256 message encryption/decryption
- `useMessageCache()` - Message caching and pagination
- `useTypingIndicator()` - Typing status management
- `useConversation()` - Conversation state management

---

#### Global State: `src/context/DChatContext.jsx`

**Purpose:** Centralized state management for the entire app

**State Includes:**
- Current user profile
- All registered users
- Messages (organized by conversation)
- Loading/error states
- Blockchain connection status

**Functions Provided:**
- `registerUser()` - Register and update context
- `updateProfile()` - Update profile and sync state
- `sendMessage()` - Send message and reload conversation
- `loadConversation()` - Load messages for two users
- `markMessageAsRead()` - Mark and update state
- `loadUserProfile()` - Fetch and cache user data
- `loadAllUsers()` - Fetch all registered users

---

### ✅ 3. Utility Functions

#### `src/utils/helpers.js`

Helper functions for common operations:
- `formatTime()` - Format timestamps (e.g., "2m ago")
- `formatDateTime()` - Full datetime formatting
- `truncateAddress()` - Shorten Ethereum addresses
- `sortMessagesByTime()` - Sort messages chronologically
- `groupMessagesByDate()` - Group messages by date
- `validateUsername()` - Validate username format
- `validateMessage()` - Validate message content
- `getInitials()` - Get user initials from name
- `generateConversationId()` - Create unique conversation IDs
- `parseContractError()` - Extract readable error messages
- `debounce()` - Debounce function for inputs
- `throttle()` - Throttle function for events

#### `src/utils/ipfs.js`

IPFS/Pinata integration:
- `uploadToIPFS()` - Upload profile images
- `uploadMetadataToIPFS()` - Upload JSON metadata
- `getIPFSUrl()` - Get IPFS gateway URLs
- `getPinataUrl()` - Get Pinata gateway URLs
- `unpinFromIPFS()` - Remove files from IPFS
- `getPinnedFiles()` - List pinned files

---

### ✅ 4. Example Components

#### `src/components/Auth/RegistrationForm.jsx`

Complete registration component with:
- Username input with validation
- Bio text area
- Profile image upload to IPFS
- Form validation
- Error handling with toast notifications
- Beautiful UI with Tailwind CSS

Usage:
```jsx
import RegistrationForm from './components/Auth/RegistrationForm';

function App() {
  return <RegistrationForm />;
}
```

#### `src/components/Chat/ChatWindow.jsx`

Complete chat component with:
- Message display with sender/recipient distinction
- Message encryption/decryption
- Read receipts
- Typing indicators
- Real-time updates
- Responsive design

Usage:
```jsx
import ChatWindow from './components/Chat/ChatWindow';

function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  
  return (
    <ChatWindow 
      recipientAddress={selectedUser.address}
      recipient={selectedUser}
    />
  );
}
```

---

### ✅ 5. Configuration & Documentation

#### `.env` Configuration
```env
VITE_PINATA_JWT=your_pinata_jwt
VITE_CONTRACT_ADDRESS=0x...
VITE_RPC_URL=https://sepolia.lisk.com
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

#### `SETUP_GUIDE.md`
Complete guide including:
- Project overview
- Prerequisites
- Installation steps
- Contract deployment instructions
- Testing guidelines
- Troubleshooting tips
- Security considerations

---

## How to Use These Components

### 1. Setup & Installation

```bash
# Install dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 2. Deploy Smart Contract

```bash
cd contracts

# Create .env with private key and RPC URL
echo "SEPOLIA_RPC_URL=https://sepolia.lisk.com
PRIVATE_KEY=your_key
" > .env

# Deploy contract
npm run deploy:sepolia

# Copy contract address to frontend .env
# VITE_CONTRACT_ADDRESS=0x...
```

### 3. Run Frontend

```bash
npm run dev
# Open http://localhost:5173
```

### 4. Use in Components

```jsx
// In any component:
import { useDChat } from './context/DChatContext';

function MyComponent() {
  const { 
    state,           // Current state
    registerUser,    // Register function
    sendMessage,     // Send message function
    loading,         // Loading state
  } = useDChat();

  // Use in component...
}
```

---

## Contract Functions Summary

### User Management
```solidity
// Register
registerUser(string username, string avatarCID, string bio)

// Update
updateProfile(string username, string avatarCID, string bio)

// Read
getUserProfile(address user) → UserProfile
getAllUsers() → address[]
getUserCount() → uint256
toggleUserStatus()
```

### Messaging
```solidity
// Send
sendMessage(address recipient, string encryptedContent) → messageId

// Read
getMessage(uint256 messageId) → Message
getUserMessages(address user) → uint256[]
getConversationMessages(address otherUser) → uint256[]
getUnreadCount() → uint256

// Update
markAsRead(uint256 messageId)
```

### Admin
```solidity
setPlatformFee(uint256 newFee)
setFeeRecipient(address newRecipient)
withdrawFees()
```

---

## Architecture Diagram

```
Frontend (React + Vite)
├── Components
│   ├── RegistrationForm (handles user signup)
│   └── ChatWindow (handles messaging)
├── Context (DChatContext)
│   └── Global state management
├── Hooks
│   ├── useDChatContract (contract calls)
│   └── useMessageUtils (message logic)
└── Utils
    ├── helpers.js (formatting, validation)
    └── ipfs.js (file uploads)
        ↓
Web3 (Ethers.js)
├── MetaMask Provider
├── Contract Interface
└── Transaction Handling
        ↓
Smart Contract (DChatMessaging.sol)
├── User Registry
├── Message Storage
├── Events Emission
└── Access Control
        ↓
Blockchain (Sepolia Testnet)
├── State Storage
├── Event Logs
└── Gas Calculations
```

---

## Next Steps

1. **Deploy Contract**
   - Configure network in `contracts/.env`
   - Run `npm run deploy:sepolia`
   - Update frontend `.env` with contract address

2. **Test Contract**
   - Run `npm test` in contracts directory
   - All tests should pass
   - Check gas usage

3. **Build UI Components**
   - Use provided components as templates
   - Create user list component
   - Create main chat interface
   - Add profile page

4. **Add Features**
   - Message reactions
   - File sharing
   - User blocking
   - Typing indicators
   - Message search

5. **Deploy Frontend**
   - Run `npm run build`
   - Deploy to Vercel, Netlify, or other host

---

## Key Features Implemented

### ✅ Security
- Reentrancy protection
- Input validation
- Access control
- Safe math (Solidity 0.8.24+)
- Event-based auditing

### ✅ Scalability
- Efficient storage layout
- Gas optimization
- Batch message retrieval
- Pagination support

### ✅ UX
- Real-time updates via events
- Error handling with toast notifications
- Loading states
- Form validation
- Responsive design

### ✅ Web3 Integration
- MetaMask connection
- Message encryption/decryption
- IPFS file uploads
- Event listening
- Transaction confirmation

---

## Testing

```bash
cd contracts

# Run all tests
npm test

# Run with gas report
REPORT_GAS=true npm test

# Run specific test
npx hardhat test test/DChatMessaging.test.js --grep "User Registration"
```

---

## Support & Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org
- **Solidity Docs**: https://docs.soliditylang.org
- **Pinata Docs**: https://docs.pinata.cloud
- **Tailwind CSS**: https://tailwindcss.com

---

## License

MIT

---

**Happy Building! 🚀**
