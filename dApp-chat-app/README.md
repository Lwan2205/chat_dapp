# 💬 Decentralized Chat DApp

A fully decentralized chat application built on Ethereum blockchain. Connect your MetaMask wallet, create an account, add friends, and chat with them directly on the blockchain!

## 🚀 Features

- ✅ **Wallet Connection**: Connect MetaMask wallet seamlessly
- ✅ **User Registration**: Create unique username and profile
- ✅ **Add Friends**: Build your friend list on-chain
- ✅ **Decentralized Messaging**: Send and receive messages stored on Ethereum
- ✅ **Real-time Display**: View all users and manage conversations
- ✅ **Secure**: Messages stored safely on blockchain

## 📋 Project Structure

```
dApp-chat-app/
├── backend/              # Smart Contract (Solidity + Hardhat)
│   ├── contracts/
│   │   └── ChatApp.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── package.json
│   └── hardhat.config.js
│
└── chatapp/              # Frontend (Next.js + React)
    ├── app/
    │   ├── components/
    │   ├── context/
    │   └── Utils/
    ├── public/
    ├── package.json
    └── next.config.mjs
```

## 🛠️ Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MetaMask** browser extension ([Get it](https://metamask.io/))
- **Ethereum Testnet ETH** (for gas fees)

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Lwan2205/chat_dapp.git
cd dApp-chat-app
```

### 2️⃣ Setup Frontend

```bash
cd chatapp
npm install
npm run dev
```

The frontend will run at: **http://localhost:3000**

### 3️⃣ Setup Backend (Optional - for deploying new contracts)

```bash
cd ../backend
npm install
npx hardhat compile
```

## 🔗 Smart Contract Details

**Contract Address:** `0x383096D8F62b8F461afB85867a6567b71070fc10` (Deployed)

### Main Functions:

- `createUser(string name)` - Register new user
- `addFriend(address friend_key, string name)` - Add friend
- `sendMessage(address friend_key, string _msg)` - Send message
- `readMessage(address friend_key)` - Read conversation messages
- `getFriends()` - Get friend list
- `getAllAppUsers()` - Get all users

## 📖 How to Use

1. **Connect Wallet**: Click "Connect Wallet" button and approve MetaMask
2. **Create Account**: Enter username and create your profile
3. **Add Friends**: Browse all users and add them as friends
4. **Start Chatting**: Click on a friend and start messaging
5. **View Messages**: All messages are stored on-chain and visible to both parties

## 🔐 Security Notes

- All messages are stored on the Ethereum blockchain
- Your private key from MetaMask is never exposed to the app
- Contract has been tested on Sepolia testnet
- Messages cannot be deleted (immutable blockchain property)

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
cd chatapp
npm run build
vercel deploy
```

### Smart Contract Deployment

```bash
cd backend
npx hardhat run scripts/deploy.js --network sepolia
```

## 🐛 Troubleshooting

### Issue: "Please install/connect MetaMask"
**Solution:** Install MetaMask extension and refresh the page

### Issue: Transaction failed
**Solution:** 
- Ensure you have enough testnet ETH
- Make sure you're on the correct network
- Check if the recipient is registered

### Issue: Cannot find contract
**Solution:** Update the contract address in `chatapp/app/context/constants.ts` if you deploy a new contract

## 📚 Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Solidity 0.8.x, Hardhat
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Wallet Integration**: MetaMask, Web3Modal
- **Libraries**: Ethers.js v5

## 📝 License

MIT License - feel free to use this project for learning purposes

## 🤝 Contributing

Contributions are welcome! Feel free to fork and submit pull requests.

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the smart contract code in `backend/contracts/ChatApp.sol`
3. Check browser console for error messages
4. Ensure MetaMask is properly connected

---

**Happy Chatting! 🎉**

