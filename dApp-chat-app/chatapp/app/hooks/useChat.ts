/**
 * useChat Hook
 * Manages all chat operations: user management, friend management, messaging
 * Integrates with ChatApp smart contract and listens to events for realtime updates
 */

import { useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { chatAppAddress, chatAppAbi } from '@/app/context/constants';

interface User {
    name: string;
    pubKey: string;
    createdAt: number;
}

interface Friend {
    pubKey: string;
    name: string;
}

interface Message {
    id: number;
    msg: string;
    timestamp: number;
    sender: string;
    isDeleted: boolean;
    isEdited: boolean;
    editedAt: number;
}

interface ChatEvent {
    type: 'message_sent' | 'message_edited' | 'message_deleted' | 'friend_added' | 'user_registered';
    data: any;
    timestamp: number;
}

export const useChat = () => {
    const contractRef = useRef<ethers.Contract | null>(null);
    const providerRef = useRef<any>(null);
    const listenerRef = useRef<Map<string, Function>>(new Map());

    /**
     * Initialize contract instance
     */
    const getContract = useCallback(async (): Promise<ethers.Contract> => {
        if (contractRef.current) return contractRef.current;

        if (!window.ethereum) {
            throw new Error('MetaMask not installed');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        providerRef.current = provider;

        const contract = new ethers.Contract(
            chatAppAddress,
            chatAppAbi,
            signer
        );

        contractRef.current = contract;
        return contract;
    }, []);

    /**
     * ==================== USER MANAGEMENT ====================
     */

    /**
     * Register a new user
     * @param username - Username to register
     */
    const createUser = useCallback(
        async (username: string): Promise<ethers.providers.TransactionResponse | null> => {
            try {
                if (!username.trim()) throw new Error('Username cannot be empty');
                if (username.length > 50) throw new Error('Username too long (max 50 chars)');

                const contract = await getContract();
                const tx = await contract.createUser(username);
                await tx.wait();

                return tx;
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Update user profile
     * @param newName - New username
     */
    const updateProfile = useCallback(
        async (newName: string): Promise<ethers.providers.TransactionResponse | null> => {
            try {
                const contract = await getContract();
                const tx = await contract.updateProfile(newName);
                await tx.wait();
                return tx;
            } catch (error) {
                console.error('Error updating profile:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Get username for an address
     * @param address - User address
     */
    const getUsername = useCallback(
        async (address: string): Promise<string> => {
            try {
                const contract = await getContract();
                return await contract.getUsername(address);
            } catch (error) {
                console.error('Error getting username:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Check if user exists
     * @param address - User address
     */
    const checkUserExists = useCallback(
        async (address: string): Promise<boolean> => {
            try {
                const contract = await getContract();
                return await contract.checkUserExists(address);
            } catch (error) {
                console.error('Error checking user:', error);
                return false;
            }
        },
        [getContract]
    );

    /**
     * Get all registered users
     */
    const getAllUsers = useCallback(async (): Promise<User[]> => {
        try {
            const contract = await getContract();
            const users = await contract.getAllAppUsers();
            return users.map((u: any) => ({
                name: u.name,
                pubKey: u.pubKey,
                createdAt: parseInt(u.createdAt),
            }));
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }, [getContract]);

    /**
     * Get user count
     */
    const getUserCount = useCallback(async (): Promise<number> => {
        try {
            const contract = await getContract();
            const count = await contract.getUserCount();
            return parseInt(count);
        } catch (error) {
            console.error('Error getting user count:', error);
            throw error;
        }
    }, [getContract]);

    /**
     * ==================== FRIEND MANAGEMENT ====================
     */

    /**
     * Add a friend (bidirectional)
     * @param friendAddress - Friend's wallet address
     * @param friendName - Display name for friend
     */
    const addFriend = useCallback(
        async (friendAddress: string, friendName: string): Promise<ethers.providers.TransactionResponse | null> => {
            try {
                const contract = await getContract();
                const tx = await contract.addFriend(friendAddress, friendName);
                await tx.wait();
                return tx;
            } catch (error) {
                console.error('Error adding friend:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Check if already friends
     * @param userAddress - Your address
     * @param friendAddress - Friend's address
     */
    const alreadyFriends = useCallback(
        async (userAddress: string, friendAddress: string): Promise<boolean> => {
            try {
                const contract = await getContract();
                return await contract.alreadyFriends(userAddress, friendAddress);
            } catch (error) {
                console.error('Error checking friendship:', error);
                return false;
            }
        },
        [getContract]
    );

    /**
     * Get current user's friend list
     */
    const getFriends = useCallback(async (): Promise<Friend[]> => {
        try {
            const contract = await getContract();
            const friends = await contract.getFriends();
            return friends.map((f: any) => ({
                pubKey: f.pubKey,
                name: f.name,
            }));
        } catch (error) {
            console.error('Error getting friends:', error);
            throw error;
        }
    }, [getContract]);

    /**
     * Get friend count
     */
    const getFriendCount = useCallback(async (): Promise<number> => {
        try {
            const contract = await getContract();
            const count = await contract.getFriendCount();
            return parseInt(count);
        } catch (error) {
            console.error('Error getting friend count:', error);
            throw error;
        }
    }, [getContract]);

    /**
     * Get friend by index
     * @param index - Friend list index
     */
    const getFriendByIndex = useCallback(
        async (index: number): Promise<Friend> => {
            try {
                const contract = await getContract();
                const friend = await contract.getFriendByIndex(index);
                return {
                    pubKey: friend.pubKey,
                    name: friend.name,
                };
            } catch (error) {
                console.error('Error getting friend by index:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * ==================== MESSAGING ====================
     */

    /**
     * Send a message to a friend
     * @param friendAddress - Recipient's address
     * @param messageContent - Message text
     */
    const sendMessage = useCallback(
        async (friendAddress: string, messageContent: string): Promise<number | null> => {
            try {
                if (!messageContent.trim()) throw new Error('Message cannot be empty');
                if (messageContent.length > 1000) throw new Error('Message too long (max 1000 chars)');

                const contract = await getContract();
                const tx = await contract.sendMessage(friendAddress, messageContent);
                const receipt = await tx.wait();

                // Extract messageId from event logs
                const event = receipt?.events?.find((e: any) => e.event === 'MessageSent');
                const messageId = event?.args?.messageId?.toNumber() || 0;

                return messageId;
            } catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Edit a message (sender only)
     * @param friendAddress - Friend's address
     * @param messageIndex - Index in conversation
     * @param newContent - New message content
     */
    const editMessage = useCallback(
        async (
            friendAddress: string,
            messageIndex: number,
            newContent: string
        ): Promise<ethers.providers.TransactionResponse | null> => {
            try {
                const contract = await getContract();
                const tx = await contract.editMessage(friendAddress, messageIndex, newContent);
                await tx.wait();
                return tx;
            } catch (error) {
                console.error('Error editing message:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Delete a message (sender only, soft delete)
     * @param friendAddress - Friend's address
     * @param messageIndex - Index in conversation
     */
    const deleteMessage = useCallback(
        async (friendAddress: string, messageIndex: number): Promise<ethers.providers.TransactionResponse | null> => {
            try {
                const contract = await getContract();
                const tx = await contract.deleteMessage(friendAddress, messageIndex);
                await tx.wait();
                return tx;
            } catch (error) {
                console.error('Error deleting message:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Read all messages in a conversation
     * @param friendAddress - Friend's address
     */
    const readMessage = useCallback(
        async (friendAddress: string): Promise<Message[]> => {
            try {
                const contract = await getContract();
                const messages = await contract.readMessage(friendAddress);
                return messages.map((m: any) => ({
                    id: parseInt(m.id),
                    msg: m.msg,
                    timestamp: parseInt(m.timestamp),
                    sender: m.sender,
                    isDeleted: m.isDeleted,
                    isEdited: m.isEdited,
                    editedAt: parseInt(m.editedAt),
                }));
            } catch (error) {
                console.error('Error reading messages:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Get a specific message by index
     * @param friendAddress - Friend's address
     * @param messageIndex - Index in conversation
     */
    const getMessage = useCallback(
        async (friendAddress: string, messageIndex: number): Promise<Message> => {
            try {
                const contract = await getContract();
                const msg = await contract.getMessage(friendAddress, messageIndex);
                return {
                    id: parseInt(msg.id),
                    msg: msg.msg,
                    timestamp: parseInt(msg.timestamp),
                    sender: msg.sender,
                    isDeleted: msg.isDeleted,
                    isEdited: msg.isEdited,
                    editedAt: parseInt(msg.editedAt),
                };
            } catch (error) {
                console.error('Error getting message:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Get message count in a conversation
     * @param friendAddress - Friend's address
     */
    const getMessageCount = useCallback(
        async (friendAddress: string): Promise<number> => {
            try {
                const contract = await getContract();
                const count = await contract.getMessageCount(friendAddress);
                return parseInt(count);
            } catch (error) {
                console.error('Error getting message count:', error);
                throw error;
            }
        },
        [getContract]
    );

    /**
     * Get global message ID counter
     */
    const getGlobalMessageId = useCallback(async (): Promise<number> => {
        try {
            const contract = await getContract();
            const id = await contract.getGlobalMessageId();
            return parseInt(id);
        } catch (error) {
            console.error('Error getting global message ID:', error);
            throw error;
        }
    }, [getContract]);

    /**
     * ==================== EVENT LISTENERS ====================
     */

    /**
     * Listen to MessageSent events
     * @param callback - Function to call when event fires
     * @param fromBlock - Starting block (default: 'latest')
     */
    const onMessageSent = useCallback(
        async (
            callback: (event: { messageId: number; sender: string; recipient: string; message: string; timestamp: number }) => void,
            fromBlock: string | number = 'latest'
        ) => {
            try {
                const contract = await getContract();
                const filter = contract.filters.MessageSent();

                const listener = (messageId: any, sender: string, recipient: string, message: string, timestamp: any, ...args: any[]) => {
                    callback({
                        messageId: messageId.toNumber ? messageId.toNumber() : parseInt(messageId),
                        sender,
                        recipient,
                        message,
                        timestamp: timestamp.toNumber ? timestamp.toNumber() : parseInt(timestamp),
                    });
                };

                contract.on(filter, listener);
                listenerRef.current.set('MessageSent', listener);

                return () => contract.off(filter, listener);
            } catch (error) {
                console.error('Error listening to MessageSent:', error);
            }
        },
        [getContract]
    );

    /**
     * Listen to MessageEdited events
     * @param callback - Function to call when event fires
     */
    const onMessageEdited = useCallback(
        async (
            callback: (event: { messageId: number; sender: string; recipient: string; newMessage: string; editedAt: number }) => void
        ) => {
            try {
                const contract = await getContract();
                const filter = contract.filters.MessageEdited();

                const listener = (messageId: any, sender: string, recipient: string, newMessage: string, editedAt: any, ...args: any[]) => {
                    callback({
                        messageId: messageId.toNumber ? messageId.toNumber() : parseInt(messageId),
                        sender,
                        recipient,
                        newMessage,
                        editedAt: editedAt.toNumber ? editedAt.toNumber() : parseInt(editedAt),
                    });
                };

                contract.on(filter, listener);
                listenerRef.current.set('MessageEdited', listener);

                return () => contract.off(filter, listener);
            } catch (error) {
                console.error('Error listening to MessageEdited:', error);
            }
        },
        [getContract]
    );

    /**
     * Listen to MessageDeleted events
     * @param callback - Function to call when event fires
     */
    const onMessageDeleted = useCallback(
        async (callback: (event: { messageId: number; sender: string; deletedAt: number }) => void) => {
            try {
                const contract = await getContract();
                const filter = contract.filters.MessageDeleted();

                const listener = (messageId: any, sender: string, deletedAt: any, ...args: any[]) => {
                    callback({
                        messageId: messageId.toNumber ? messageId.toNumber() : parseInt(messageId),
                        sender,
                        deletedAt: deletedAt.toNumber ? deletedAt.toNumber() : parseInt(deletedAt),
                    });
                };

                contract.on(filter, listener);
                listenerRef.current.set('MessageDeleted', listener);

                return () => contract.off(filter, listener);
            } catch (error) {
                console.error('Error listening to MessageDeleted:', error);
            }
        },
        [getContract]
    );

    /**
     * Listen to FriendAdded events
     * @param callback - Function to call when event fires
     */
    const onFriendAdded = useCallback(
        async (callback: (event: { user: string; friend: string; friendName: string; timestamp: number }) => void) => {
            try {
                const contract = await getContract();
                const filter = contract.filters.FriendAdded();

                const listener = (user: string, friend: string, friendName: string, timestamp: any, ...args: any[]) => {
                    callback({
                        user,
                        friend,
                        friendName,
                        timestamp: timestamp.toNumber ? timestamp.toNumber() : parseInt(timestamp),
                    });
                };

                contract.on(filter, listener);
                listenerRef.current.set('FriendAdded', listener);

                return () => contract.off(filter, listener);
            } catch (error) {
                console.error('Error listening to FriendAdded:', error);
            }
        },
        [getContract]
    );

    /**
     * Listen to UserRegistered events
     * @param callback - Function to call when event fires
     */
    const onUserRegistered = useCallback(
        async (callback: (event: { user: string; username: string; timestamp: number }) => void) => {
            try {
                const contract = await getContract();
                const filter = contract.filters.UserRegistered();

                const listener = (user: string, username: string, timestamp: any, ...args: any[]) => {
                    callback({
                        user,
                        username,
                        timestamp: timestamp.toNumber ? timestamp.toNumber() : parseInt(timestamp),
                    });
                };

                contract.on(filter, listener);
                listenerRef.current.set('UserRegistered', listener);

                return () => contract.off(filter, listener);
            } catch (error) {
                console.error('Error listening to UserRegistered:', error);
            }
        },
        [getContract]
    );

    /**
     * Remove all event listeners
     */
    const removeAllListeners = useCallback(async () => {
        try {
            const contract = await getContract();
            contract.removeAllListeners();
            listenerRef.current.clear();
        } catch (error) {
            console.error('Error removing listeners:', error);
        }
    }, [getContract]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (contractRef.current) {
                contractRef.current.removeAllListeners();
            }
        };
    }, []);

    return {
        // User management
        createUser,
        updateProfile,
        getUsername,
        checkUserExists,
        getAllUsers,
        getUserCount,

        // Friend management
        addFriend,
        alreadyFriends,
        getFriends,
        getFriendCount,
        getFriendByIndex,

        // Messaging
        sendMessage,
        editMessage,
        deleteMessage,
        readMessage,
        getMessage,
        getMessageCount,
        getGlobalMessageId,

        // Event listeners
        onMessageSent,
        onMessageEdited,
        onMessageDeleted,
        onFriendAdded,
        onUserRegistered,
        removeAllListeners,
    };
};
