export const chatAppAddress: string = "0xe0dA041676a40b62b408890Fe7AfF1DB6B5aaF74";
export const chatAppAbi: any = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "addFriend",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "createUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "messageIndex",
        "type": "uint256"
      }
    ],
    "name": "deleteMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "messageIndex",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "newContent",
        "type": "string"
      }
    ],
    "name": "editMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "friend",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "friendName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "FriendAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "messageId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "deletedAt",
        "type": "uint64"
      }
    ],
    "name": "MessageDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "messageId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newMessage",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "editedAt",
        "type": "uint64"
      }
    ],
    "name": "MessageEdited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "messageId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "MessageSent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "messageContent",
        "type": "string"
      }
    ],
    "name": "sendMessage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newName",
        "type": "string"
      }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newUsername",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "UserProfileUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "username",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      }
    ],
    "name": "alreadyFriends",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "pubKey",
        "type": "address"
      }
    ],
    "name": "checkUserExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAppUsers",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "pubKey",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChatApp.AllUserStruct[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getFriendByIndex",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pubKey",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "internalType": "struct ChatApp.Friend",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFriendCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFriends",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pubKey",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "internalType": "struct ChatApp.Friend[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalMessageId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "messageIndex",
        "type": "uint256"
      }
    ],
    "name": "getMessage",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "msg",
            "type": "string"
          },
          {
            "internalType": "uint64",
            "name": "timestamp",
            "type": "uint64"
          },
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isDeleted",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isEdited",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "editedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChatApp.Message",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      }
    ],
    "name": "getMessageCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "pubKey",
        "type": "address"
      }
    ],
    "name": "getUsername",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "friendKey",
        "type": "address"
      }
    ],
    "name": "readMessage",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "msg",
            "type": "string"
          },
          {
            "internalType": "uint64",
            "name": "timestamp",
            "type": "uint64"
          },
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isDeleted",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isEdited",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "editedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChatApp.Message[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]