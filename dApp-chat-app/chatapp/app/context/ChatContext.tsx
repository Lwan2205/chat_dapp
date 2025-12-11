/**
 * ChatContext
 * Provides chat state and functions to entire application
 * Integrates useChat hook and manages real-time updates via event listeners
 */

'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { useChat } from '@/app/hooks/useChat';

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

interface ChatState {
    currentUser: User | null;
    allUsers: User[];
    friends: Friend[];
    messages: Record<string, Message[]>; // { [friendAddress]: Message[] }
    loading: boolean;
    error: string | null;
    selectedFriend: string | null;
    isConnected: boolean;
    unreadMessages: Record<string, number>; // { [friendAddress]: count }
}

type ChatAction =
    | { type: 'SET_CURRENT_USER'; payload: User }
    | { type: 'SET_ALL_USERS'; payload: User[] }
    | { type: 'SET_FRIENDS'; payload: Friend[] }
    | { type: 'SET_MESSAGES'; payload: { friendAddress: string; messages: Message[] } }
    | { type: 'ADD_MESSAGE'; payload: { friendAddress: string; message: Message } }
    | { type: 'UPDATE_MESSAGE'; payload: { friendAddress: string; messageId: number; message: Message } }
    | { type: 'DELETE_MESSAGE'; payload: { friendAddress: string; messageId: number } }
    | { type: 'ADD_FRIEND'; payload: Friend }
    | { type: 'SET_SELECTED_FRIEND'; payload: string | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CONNECTED'; payload: boolean }
    | { type: 'ADD_USER'; payload: User }
    | { type: 'INCREMENT_UNREAD'; payload: string }
    | { type: 'RESET_UNREAD'; payload: string }
    | { type: 'RESET_ALL' };

const initialState: ChatState = {
    currentUser: null,
    allUsers: [],
    friends: [],
    messages: {},
    loading: false,
    error: null,
    selectedFriend: null,
    isConnected: false,
    unreadMessages: {},
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_CURRENT_USER':
            return { ...state, currentUser: action.payload };

        case 'SET_ALL_USERS':
            return { ...state, allUsers: action.payload };

        case 'SET_FRIENDS':
            return { ...state, friends: action.payload };

        case 'SET_MESSAGES':
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [action.payload.friendAddress]: action.payload.messages,
                },
            };

        case 'ADD_MESSAGE': {
            const { friendAddress, message } = action.payload;
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [friendAddress]: [...(state.messages[friendAddress] || []), message],
                },
            };
        }

        case 'UPDATE_MESSAGE': {
            const { friendAddress, messageId, message } = action.payload;
            const messages = state.messages[friendAddress] || [];
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [friendAddress]: messages.map((m) => (m.id === messageId ? message : m)),
                },
            };
        }

        case 'DELETE_MESSAGE': {
            const { friendAddress, messageId } = action.payload;
            const messages = state.messages[friendAddress] || [];
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [friendAddress]: messages.map((m) =>
                        m.id === messageId ? { ...m, isDeleted: true, msg: '[This message was deleted]' } : m
                    ),
                },
            };
        }

        case 'ADD_FRIEND':
            return {
                ...state,
                friends: [...state.friends, action.payload],
            };

        case 'SET_SELECTED_FRIEND':
            return { ...state, selectedFriend: action.payload };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        case 'SET_CONNECTED':
            return { ...state, isConnected: action.payload };

        case 'ADD_USER':
            return {
                ...state,
                allUsers: [...state.allUsers, action.payload],
            };

        case 'INCREMENT_UNREAD':
            return {
                ...state,
                unreadMessages: {
                    ...state.unreadMessages,
                    [action.payload]: (state.unreadMessages[action.payload] || 0) + 1,
                },
            };

        case 'RESET_UNREAD':
            return {
                ...state,
                unreadMessages: {
                    ...state.unreadMessages,
                    [action.payload]: 0,
                },
            };

        case 'RESET_ALL':
            return initialState;

        default:
            return state;
    }
};

interface ChatContextValue extends ChatState {
    // User management
    createUser: (username: string) => Promise<void>;
    updateProfile: (newName: string) => Promise<void>;
    fetchCurrentUser: () => Promise<void>;
    fetchAllUsers: () => Promise<void>;

    // Friend management
    addFriend: (friendAddress: string, friendName: string) => Promise<void>;
    fetchFriends: () => Promise<void>;
    checkFriendship: (friendAddress: string) => Promise<boolean>;

    // Messaging
    sendMessage: (friendAddress: string, message: string) => Promise<number | null>;
    fetchMessages: (friendAddress: string) => Promise<void>;
    editMessage: (friendAddress: string, messageIndex: number, newContent: string) => Promise<void>;
    deleteMessage: (friendAddress: string, messageIndex: number) => Promise<void>;

    // Utilities
    setSelectedFriend: (address: string | null) => void;
    clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const chat = useChat();

    /**
     * Initialize chat connection and fetch data
     */
    useEffect(() => {
        const initializeChat = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                // Check if user exists
                const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum);
                const signer = provider.getSigner();
                const userAddress = await signer.getAddress();

                const exists = await chat.checkUserExists(userAddress);

                if (exists) {
                    const username = await chat.getUsername(userAddress);
                    dispatch({
                        type: 'SET_CURRENT_USER',
                        payload: {
                            name: username,
                            pubKey: userAddress,
                            createdAt: Math.floor(Date.now() / 1000),
                        },
                    });

                    // Fetch friends and users
                    const friends = await chat.getFriends();
                    dispatch({ type: 'SET_FRIENDS', payload: friends });

                    const allUsers = await chat.getAllUsers();
                    dispatch({ type: 'SET_ALL_USERS', payload: allUsers });

                    dispatch({ type: 'SET_CONNECTED', payload: true });
                }

                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                console.error('Error initializing chat:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize chat' });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initializeChat();

        // Setup event listeners
        const setupListeners = async () => {
            // Listen for new messages
            await chat.onMessageSent(({ sender, recipient, message, timestamp, messageId }) => {
                const currentUserAddress = state.currentUser?.pubKey;
                if (currentUserAddress === sender || currentUserAddress === recipient) {
                    const friendAddress = currentUserAddress === sender ? recipient : sender;
                    dispatch({
                        type: 'ADD_MESSAGE',
                        payload: {
                            friendAddress,
                            message: {
                                id: messageId,
                                msg: message,
                                timestamp,
                                sender,
                                isDeleted: false,
                                isEdited: false,
                                editedAt: 0,
                            },
                        },
                    });

                    // Increment unread if not selected
                    if (state.selectedFriend !== friendAddress) {
                        dispatch({ type: 'INCREMENT_UNREAD', payload: friendAddress });
                    }
                }
            });

            // Listen for message edits
            await chat.onMessageEdited(({ sender, recipient, newMessage, editedAt, messageId }) => {
                const currentUserAddress = state.currentUser?.pubKey;
                if (currentUserAddress === sender || currentUserAddress === recipient) {
                    const friendAddress = currentUserAddress === sender ? recipient : sender;
                    dispatch({
                        type: 'UPDATE_MESSAGE',
                        payload: {
                            friendAddress,
                            messageId,
                            message: {
                                id: messageId,
                                msg: newMessage,
                                timestamp: 0,
                                sender,
                                isDeleted: false,
                                isEdited: true,
                                editedAt,
                            },
                        },
                    });
                }
            });

            // Listen for message deletions
            await chat.onMessageDeleted(({ sender, messageId }) => {
                const currentUserAddress = state.currentUser?.pubKey;
                if (currentUserAddress === sender) {
                    const messages = Object.entries(state.messages);
                    for (const [friendAddress, msgs] of messages) {
                        const msgExists = msgs.some((m) => m.id === messageId);
                        if (msgExists) {
                            dispatch({
                                type: 'DELETE_MESSAGE',
                                payload: { friendAddress, messageId },
                            });
                            break;
                        }
                    }
                }
            });

            // Listen for new friends
            await chat.onFriendAdded(({ user, friend, friendName }) => {
                const currentUserAddress = state.currentUser?.pubKey;
                if (currentUserAddress === user) {
                    dispatch({
                        type: 'ADD_FRIEND',
                        payload: { pubKey: friend, name: friendName },
                    });
                }
            });

            // Listen for new users
            await chat.onUserRegistered(({ user, username }) => {
                dispatch({
                    type: 'ADD_USER',
                    payload: { name: username, pubKey: user, createdAt: Math.floor(Date.now() / 1000) },
                });
            });
        };

        setupListeners();

        return () => {
            chat.removeAllListeners();
        };
    }, [chat, state.currentUser?.pubKey, state.selectedFriend]);

    /**
     * Create new user account
     */
    const createUser = useCallback(
        async (username: string) => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                await chat.createUser(username);

                const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum);
                const signer = provider.getSigner();
                const userAddress = await signer.getAddress();

                dispatch({
                    type: 'SET_CURRENT_USER',
                    payload: {
                        name: username,
                        pubKey: userAddress,
                        createdAt: Math.floor(Date.now() / 1000),
                    },
                });

                dispatch({ type: 'SET_CONNECTED', payload: true });
                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                console.error('Error creating user:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to create user' });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [chat]
    );

    /**
     * Update user profile
     */
    const updateProfile = useCallback(
        async (newName: string) => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                await chat.updateProfile(newName);

                if (state.currentUser) {
                    dispatch({
                        type: 'SET_CURRENT_USER',
                        payload: { ...state.currentUser, name: newName },
                    });
                }

                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                console.error('Error updating profile:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [chat, state.currentUser]
    );

    /**
     * Fetch current user info
     */
    const fetchCurrentUser = useCallback(async () => {
        try {
            const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();

            const exists = await chat.checkUserExists(userAddress);
            if (exists) {
                const username = await chat.getUsername(userAddress);
                dispatch({
                    type: 'SET_CURRENT_USER',
                    payload: {
                        name: username,
                        pubKey: userAddress,
                        createdAt: Math.floor(Date.now() / 1000),
                    },
                });
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch user info' });
        }
    }, [chat]);

    /**
     * Fetch all users
     */
    const fetchAllUsers = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const allUsers = await chat.getAllUsers();
            dispatch({ type: 'SET_ALL_USERS', payload: allUsers });
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
            console.error('Error fetching all users:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch users' });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [chat]);

    /**
     * Add friend
     */
    const addFriend = useCallback(
        async (friendAddress: string, friendName: string) => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                await chat.addFriend(friendAddress, friendName);
                dispatch({
                    type: 'ADD_FRIEND',
                    payload: { pubKey: friendAddress, name: friendName },
                });
                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                console.error('Error adding friend:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to add friend' });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [chat]
    );

    /**
     * Fetch friends list
     */
    const fetchFriends = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const friends = await chat.getFriends();
            dispatch({ type: 'SET_FRIENDS', payload: friends });
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
            console.error('Error fetching friends:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch friends' });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [chat]);

    /**
     * Check if users are friends
     */
    const checkFriendship = useCallback(
        async (friendAddress: string) => {
            try {
                if (!state.currentUser) return false;
                return await chat.alreadyFriends(state.currentUser.pubKey, friendAddress);
            } catch (error) {
                console.error('Error checking friendship:', error);
                return false;
            }
        },
        [chat, state.currentUser]
    );

    /**
     * Send message
     */
    const sendMessage = useCallback(
        async (friendAddress: string, message: string): Promise<number | null> => {
            try {
                const messageId = await chat.sendMessage(friendAddress, message);
                return messageId;
            } catch (error) {
                console.error('Error sending message:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
                return null;
            }
        },
        [chat]
    );

    /**
     * Fetch messages in a conversation
     */
    const fetchMessages = useCallback(
        async (friendAddress: string) => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                const messages = await chat.readMessage(friendAddress);
                dispatch({
                    type: 'SET_MESSAGES',
                    payload: { friendAddress, messages },
                });
                dispatch({ type: 'RESET_UNREAD', payload: friendAddress });
                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                console.error('Error fetching messages:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch messages' });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [chat]
    );

    /**
     * Edit message
     */
    const editMessage = useCallback(
        async (friendAddress: string, messageIndex: number, newContent: string) => {
            try {
                await chat.editMessage(friendAddress, messageIndex, newContent);

                // Update message in state immediately
                const messages = state.messages[friendAddress] || [];
                if (messageIndex < messages.length) {
                    const messageId = messages[messageIndex].id;
                    const updatedMessage = {
                        ...messages[messageIndex],
                        msg: newContent,
                        isEdited: true,
                        editedAt: Math.floor(Date.now() / 1000),
                    };
                    dispatch({
                        type: 'UPDATE_MESSAGE',
                        payload: { friendAddress, messageId, message: updatedMessage },
                    });
                }
            } catch (error) {
                console.error('Error editing message:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to edit message' });
            }
        },
        [chat, state.messages]
    );

    /**
     * Delete message
     */
    const deleteMessage = useCallback(
        async (friendAddress: string, messageIndex: number) => {
            try {
                await chat.deleteMessage(friendAddress, messageIndex);

                // Get the message ID to dispatch correct action
                const messages = state.messages[friendAddress] || [];
                if (messageIndex < messages.length) {
                    const messageId = messages[messageIndex].id;
                    dispatch({
                        type: 'DELETE_MESSAGE',
                        payload: { friendAddress, messageId },
                    });
                }
            } catch (error) {
                console.error('Error deleting message:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to delete message' });
            }
        },
        [chat, state.messages]
    );

    /**
     * Set selected friend
     */
    const setSelectedFriend = useCallback((address: string | null) => {
        dispatch({ type: 'SET_SELECTED_FRIEND', payload: address });
    }, []);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
    }, []);

    const value: ChatContextValue = {
        ...state,
        createUser,
        updateProfile,
        fetchCurrentUser,
        fetchAllUsers,
        addFriend,
        fetchFriends,
        checkFriendship,
        sendMessage,
        fetchMessages,
        editMessage,
        deleteMessage,
        setSelectedFriend,
        clearError,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * Hook to use chat context
 */
export const useChatContext = (): ChatContextValue => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};
