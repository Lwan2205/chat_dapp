/**
 * Example Usage of Chat Hook and Context
 * Shows how to use the new useChat hook and ChatContext for real-time chat
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useChatContext } from '@/app/context/ChatContext';

export const ChatExample: React.FC = () => {
    const {
        currentUser,
        friends,
        messages,
        selectedFriend,
        loading,
        error,
        unreadMessages,
        createUser,
        fetchFriends,
        fetchMessages,
        sendMessage,
        addFriend,
        editMessage,
        deleteMessage,
        setSelectedFriend,
        clearError,
    } = useChatContext();

    const [messageText, setMessageText] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [friendToAdd, setFriendToAdd] = useState('');
    const [friendNameToAdd, setFriendNameToAdd] = useState('');

    /**
     * Initialize chat on component mount
     */
    useEffect(() => {
        if (!currentUser) {
            // User not logged in, show login screen
        }
    }, [currentUser]);

    /**
     * Handle user registration
     */
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) return;

        try {
            await createUser(newUsername);
            setNewUsername('');
        } catch (err) {
            console.error('Failed to create user:', err);
        }
    };

    /**
     * Handle adding friend
     */
    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!friendToAdd.trim() || !friendNameToAdd.trim()) return;

        try {
            await addFriend(friendToAdd, friendNameToAdd);
            setFriendToAdd('');
            setFriendNameToAdd('');
        } catch (err) {
            console.error('Failed to add friend:', err);
        }
    };

    /**
     * Handle sending message
     */
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedFriend) return;

        try {
            await sendMessage(selectedFriend, messageText);
            setMessageText('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    /**
     * Handle loading friend messages
     */
    const handleSelectFriend = async (friendAddress: string) => {
        setSelectedFriend(friendAddress);
        try {
            await fetchMessages(friendAddress);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    /**
     * Handle editing message
     */
    const handleEditMessage = async (messageIndex: number, newContent: string) => {
        if (!selectedFriend) return;

        try {
            await editMessage(selectedFriend, messageIndex, newContent);
            // Refresh messages to show the updated content
            await fetchMessages(selectedFriend);
        } catch (err) {
            console.error('Failed to edit message:', err);
        }
    };

    /**
     * Handle deleting message
     */
    const handleDeleteMessage = async (messageIndex: number) => {
        if (!selectedFriend) return;

        try {
            await deleteMessage(selectedFriend, messageIndex);
            // Refresh messages to show deletion
            await fetchMessages(selectedFriend);
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    // Render login screen if no user
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Chat App</h1>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Username
                            </label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Your username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={50}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={clearError} className="text-sm font-bold">
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main chat interface
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Friends list */}
            <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
                {/* User profile */}
                <div className="p-4 border-b border-gray-300">
                    <h2 className="text-lg font-bold text-gray-800">{currentUser.name}</h2>
                    <p className="text-xs text-gray-500">{currentUser.pubKey.slice(0, 10)}...</p>
                </div>

                {/* Add friend form */}
                <div className="p-4 border-b border-gray-300">
                    <form onSubmit={handleAddFriend} className="space-y-2">
                        <input
                            type="text"
                            placeholder="Friend address"
                            value={friendToAdd}
                            onChange={(e) => setFriendToAdd(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Friend name"
                            value={friendNameToAdd}
                            onChange={(e) => setFriendNameToAdd(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 rounded transition disabled:bg-gray-400"
                        >
                            {loading ? 'Adding...' : 'Add Friend'}
                        </button>
                    </form>
                </div>

                {/* Friends list */}
                <div className="flex-1 overflow-y-auto">
                    {friends.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm">No friends yet. Add one above!</div>
                    ) : (
                        friends.map((friend) => (
                            <button
                                key={friend.pubKey}
                                onClick={() => handleSelectFriend(friend.pubKey)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-100 transition ${selectedFriend === friend.pubKey ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">{friend.name}</p>
                                        <p className="text-xs text-gray-500">{friend.pubKey.slice(0, 8)}...</p>
                                    </div>
                                    {unreadMessages[friend.pubKey] > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                            {unreadMessages[friend.pubKey]}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                {selectedFriend ? (
                    <>
                        {/* Chat header */}
                        <div className="bg-white border-b border-gray-300 p-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {friends.find((f) => f.pubKey === selectedFriend)?.name}
                            </h2>
                            <p className="text-sm text-gray-500">{selectedFriend.slice(0, 12)}...</p>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="text-center text-gray-500">Loading messages...</div>
                            ) : (
                                (messages[selectedFriend] || []).map((msg, idx) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === currentUser.pubKey ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === currentUser.pubKey
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-300 text-gray-800'
                                                }`}
                                        >
                                            <p className={msg.isDeleted ? 'italic opacity-50' : ''}>{msg.msg}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                                                {msg.isEdited && ' (edited)'}
                                            </p>

                                            {/* Edit/Delete buttons for sender's messages */}
                                            {msg.sender === currentUser.pubKey && !msg.isDeleted && (
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const newContent = prompt('Edit message:', msg.msg);
                                                            if (newContent) handleEditMessage(idx, newContent);
                                                        }}
                                                        className="text-xs bg-opacity-30 bg-white px-2 py-1 rounded hover:bg-opacity-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMessage(idx)}
                                                        className="text-xs bg-opacity-30 bg-white px-2 py-1 rounded hover:bg-opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message input area */}
                        <div className="bg-white border-t border-gray-300 p-4">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={1000}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !messageText.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-xl font-semibold mb-2">No chat selected</p>
                            <p>Select a friend to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error notification */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex gap-3">
                    <span>{error}</span>
                    <button onClick={clearError} className="font-bold">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};
