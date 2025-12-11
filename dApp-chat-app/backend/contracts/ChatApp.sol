// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title ChatApp
/// @notice 1-1 chat smart contract with friend management and message CRUD (soft delete)
contract ChatApp is ReentrancyGuard {
    // ============ Constants ============
    uint256 private constant MAX_USERNAME_LENGTH = 50;
    uint256 private constant MAX_MESSAGE_LENGTH = 1000;

    // ============ Types ============
    struct Friend {
        address pubKey;
        string name;
    }

    struct Message {
        uint256 id; // global unique id
        string msg;
        uint64 timestamp;
        address sender;
        bool isDeleted;
        bool isEdited;
        uint64 editedAt;
    }

    struct User {
        string name;
        Friend[] friendList;
        uint64 createdAt;
    }

    struct AllUserStruct {
        string name;
        address pubKey;
        uint64 createdAt;
    }

    // ============ State ============
    AllUserStruct[] private allUsers;
    mapping(address => User) private userList;

    /// allMessages[chatId] => array of Message
    mapping(bytes32 => Message[]) private allMessages;

    /// quick friendship check: isFriend[a][b] = true if a added b (we set both directions on addFriend)
    mapping(address => mapping(address => bool)) private isFriend;

    uint256 private globalMessageId;

    /// optional: index mapping to update allUsers quickly (address -> index+1)
    mapping(address => uint256) private allUsersIndex;

    // ============ Events ============
    event UserRegistered(
        address indexed user,
        string username,
        uint64 timestamp
    );
    event UserProfileUpdated(
        address indexed user,
        string newUsername,
        uint64 timestamp
    );
    event FriendAdded(
        address indexed user,
        address indexed friend,
        string friendName,
        uint64 timestamp
    );
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        address indexed recipient,
        string message,
        uint64 timestamp
    );
    event MessageEdited(
        uint256 indexed messageId,
        address indexed sender,
        address indexed recipient,
        string newMessage,
        uint64 editedAt
    );
    event MessageDeleted(
        uint256 indexed messageId,
        address indexed sender,
        uint64 deletedAt
    );

    // ============ Modifiers ============
    modifier onlyRegistered(address user) {
        require(bytes(userList[user].name).length > 0, "User not registered");
        _;
    }

    modifier validUsername(string calldata _name) {
        uint256 len = bytes(_name).length;
        require(
            len > 0 && len <= MAX_USERNAME_LENGTH,
            "Invalid username length"
        );
        _;
    }

    modifier validMessage(string calldata _msg) {
        uint256 len = bytes(_msg).length;
        require(len > 0 && len <= MAX_MESSAGE_LENGTH, "Invalid message length");
        _;
    }

    // ============ Utility ============
    function checkUserExists(address pubKey) public view returns (bool) {
        return bytes(userList[pubKey].name).length > 0;
    }

    function _getChatID(address a, address b) private pure returns (bytes32) {
        return
            (a > b)
                ? keccak256(abi.encodePacked(a, b))
                : keccak256(abi.encodePacked(b, a));
    }

    // ============ User management ============
    function createUser(string calldata name) external validUsername(name) {
        require(!checkUserExists(msg.sender), "User already exists");
        userList[msg.sender].name = name;
        userList[msg.sender].createdAt = uint64(block.timestamp);

        allUsers.push(
            AllUserStruct({
                name: name,
                pubKey: msg.sender,
                createdAt: uint64(block.timestamp)
            })
        );
        allUsersIndex[msg.sender] = allUsers.length; // store index+1

        emit UserRegistered(msg.sender, name, uint64(block.timestamp));
    }

    function updateProfile(
        string calldata newName
    ) external onlyRegistered(msg.sender) validUsername(newName) {
        userList[msg.sender].name = newName;

        uint256 idx = allUsersIndex[msg.sender];
        if (idx > 0) {
            allUsers[idx - 1].name = newName;
        }

        emit UserProfileUpdated(msg.sender, newName, uint64(block.timestamp));
    }

    function getUsername(
        address pubKey
    ) external view onlyRegistered(pubKey) returns (string memory) {
        return userList[pubKey].name;
    }

    function getAllAppUsers() external view returns (AllUserStruct[] memory) {
        return allUsers;
    }

    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    // ============ Friend management ============
    /// Add friend (bidirectional)
    function addFriend(
        address friendKey,
        string calldata name
    )
        external
        onlyRegistered(msg.sender)
        onlyRegistered(friendKey)
        validUsername(name)
    {
        require(msg.sender != friendKey, "Cannot add yourself");
        require(!isFriend[msg.sender][friendKey], "Already friends");

        // update mapping for quick checks
        isFriend[msg.sender][friendKey] = true;
        isFriend[friendKey][msg.sender] = true;

        // push to arrays for UI listing
        userList[msg.sender].friendList.push(
            Friend({pubKey: friendKey, name: name})
        );
        userList[friendKey].friendList.push(
            Friend({pubKey: msg.sender, name: userList[msg.sender].name})
        );

        emit FriendAdded(msg.sender, friendKey, name, uint64(block.timestamp));
        emit FriendAdded(
            friendKey,
            msg.sender,
            userList[msg.sender].name,
            uint64(block.timestamp)
        );
    }

    function alreadyFriends(
        address user,
        address friendKey
    ) public view returns (bool) {
        return isFriend[user][friendKey];
    }

    function getFriends()
        external
        view
        onlyRegistered(msg.sender)
        returns (Friend[] memory)
    {
        return userList[msg.sender].friendList;
    }

    function getFriendByIndex(
        uint256 index
    ) external view onlyRegistered(msg.sender) returns (Friend memory) {
        require(
            index < userList[msg.sender].friendList.length,
            "Friend index out of bounds"
        );
        return userList[msg.sender].friendList[index];
    }

    function getFriendCount()
        external
        view
        onlyRegistered(msg.sender)
        returns (uint256)
    {
        return userList[msg.sender].friendList.length;
    }

    // ============ Messaging ============
    function sendMessage(
        address friendKey,
        string calldata messageContent
    )
        external
        nonReentrant
        onlyRegistered(msg.sender)
        onlyRegistered(friendKey)
        validMessage(messageContent)
        returns (uint256)
    {
        require(isFriend[msg.sender][friendKey], "Not friends with recipient");

        bytes32 chatID = _getChatID(msg.sender, friendKey);
        uint256 msgId = ++globalMessageId;

        Message memory newMsg = Message({
            id: msgId,
            msg: messageContent,
            timestamp: uint64(block.timestamp),
            sender: msg.sender,
            isDeleted: false,
            isEdited: false,
            editedAt: 0
        });

        allMessages[chatID].push(newMsg);

        emit MessageSent(
            msgId,
            msg.sender,
            friendKey,
            messageContent,
            uint64(block.timestamp)
        );
        return msgId;
    }

    function editMessage(
        address friendKey,
        uint256 messageIndex,
        string calldata newContent
    )
        external
        validMessage(newContent)
        onlyRegistered(msg.sender)
        onlyRegistered(friendKey)
    {
        bytes32 chatID = _getChatID(msg.sender, friendKey);
        require(
            messageIndex < allMessages[chatID].length,
            "Message index out of bounds"
        );

        Message storage msg_data = allMessages[chatID][messageIndex];
        require(msg_data.sender == msg.sender, "Only sender can edit");
        require(!msg_data.isDeleted, "Cannot edit deleted message");

        msg_data.msg = newContent;
        msg_data.isEdited = true;
        msg_data.editedAt = uint64(block.timestamp);

        emit MessageEdited(
            msg_data.id,
            msg.sender,
            friendKey,
            newContent,
            uint64(block.timestamp)
        );
    }

    function deleteMessage(
        address friendKey,
        uint256 messageIndex
    ) external onlyRegistered(msg.sender) onlyRegistered(friendKey) {
        bytes32 chatID = _getChatID(msg.sender, friendKey);
        require(
            messageIndex < allMessages[chatID].length,
            "Message index out of bounds"
        );

        Message storage msg_data = allMessages[chatID][messageIndex];
        require(msg_data.sender == msg.sender, "Only sender can delete");
        require(!msg_data.isDeleted, "Already deleted");

        msg_data.isDeleted = true;
        msg_data.msg = "[This message was deleted]";

        emit MessageDeleted(msg_data.id, msg.sender, uint64(block.timestamp));
    }

    /// Read messages: only allowed for participants and only if they are friends
    function readMessage(
        address friendKey
    )
        external
        view
        onlyRegistered(msg.sender)
        onlyRegistered(friendKey)
        returns (Message[] memory)
    {
        require(isFriend[msg.sender][friendKey], "Not friends");
        bytes32 id = _getChatID(msg.sender, friendKey);
        return allMessages[id];
    }

    /// get a message by index (only participants)
    function getMessage(
        address friendKey,
        uint256 messageIndex
    )
        external
        view
        onlyRegistered(msg.sender)
        onlyRegistered(friendKey)
        returns (Message memory)
    {
        require(isFriend[msg.sender][friendKey], "Not friends");
        bytes32 chatID = _getChatID(msg.sender, friendKey);
        require(
            messageIndex < allMessages[chatID].length,
            "Message index out of bounds"
        );
        return allMessages[chatID][messageIndex];
    }

    function getMessageCount(
        address friendKey
    )
        external
        view
        onlyRegistered(msg.sender)
        onlyRegistered(friendKey)
        returns (uint256)
    {
        require(isFriend[msg.sender][friendKey], "Not friends");
        bytes32 chatID = _getChatID(msg.sender, friendKey);
        return allMessages[chatID].length;
    }

    function getGlobalMessageId() external view returns (uint256) {
        return globalMessageId;
    }
}
