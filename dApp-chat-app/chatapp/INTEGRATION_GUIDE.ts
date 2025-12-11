/**
 * INTEGRATION GUIDE - Chat Frontend Hooks & Context
 * 
 * Step-by-step guide to integrate the new Chat system into your app
 */

// ============ STEP 1: Update your app layout =============
/**
 * File: app/layout.tsx (or app/layout.jsx)
 * 
 * Wrap your app with ChatProvider to enable chat functionality globally
 * 
 * BEFORE:
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * 
 * AFTER:
 * import { ChatProvider } from '@/app/context/ChatContext';
 * 
 * export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 *     return (
 *         <html>
 *         <body>
 *         <ChatProvider>
 *         { children }
 *         </ChatProvider>
 *         </body>
 *         </html>
 *     );
 * }
 */

// ============ STEP 2: Use Chat in Your Components =============
/**
 * Example 1: Create User Component
 */

'use client';

import { useChatContext } from '@/app/context/ChatContext';

export function RegisterUser() {
    const { createUser, currentUser, loading, error } = useChatContext();

    const handleRegister = async (username) => {
        try {
            await createUser(username);
            // User created successfully
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    return (
        <div>
        {
            currentUser?(
        <p> Welcome, { currentUser.name }! </p>
    ) : (
        <form onSubmit= {(e) => {
        e.preventDefault();
        const input = e.target.username;
        handleRegister(input.value);
    }
}>
    <input name="username" placeholder = "Username" required />
        <button type="submit" disabled = { loading } > Register </button>
            </form>
      )}
{ error && <p style={ { color: 'red' } }> { error } </p> }
</div>
  );
}

// ============ STEP 3: Example - Friends List =============
/**
 * Example 2: Display Friends List
 */

export function FriendsList() {
    const { friends, selectedFriend, setSelectedFriend, addFriend, loading } = useChatContext();

    const handleAddFriend = async () => {
        const address = prompt('Enter friend wallet address:');
        const name = prompt('Enter friend display name:');
        if (address && name) {
            try {
                await addFriend(address, name);
            } catch (err) {
                console.error('Failed to add friend:', err);
            }
        }
    };

    return (
        <div>
        <h2>Friends({ friends.length }) </h2>
        < button onClick = { handleAddFriend } disabled = { loading } >
            Add Friend
                </button>

                <ul>
    {
        friends.map((friend) => (
            <li
            key= { friend.pubKey }
            onClick = {() => setSelectedFriend(friend.pubKey)}
    style = {{
        cursor: 'pointer',
            backgroundColor: selectedFriend === friend.pubKey ? '#e3f2fd' : 'white',
                padding: '8px',
                    borderRadius: '4px',
                        marginTop: '8px',
            }
}
          >
    <strong>{ friend.name } </strong>
    < br />
    <small>{ friend.pubKey.slice(0, 8) }...</small>
        </li>
        ))}
</ul>
    </div>
  );
}

// ============ STEP 4: Example - Messaging =============
/**
 * Example 3: Chat Messages Component
 */

import { useEffect } from 'react';

export function ChatMessages() {
    const {
        selectedFriend,
        messages,
        currentUser,
        fetchMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        loading,
    } = useChatContext();

    // Load messages when friend is selected
    useEffect(() => {
        if (selectedFriend) {
            fetchMessages(selectedFriend);
        }
    }, [selectedFriend, fetchMessages]);

    if (!selectedFriend) {
        return <p>Select a friend to start messaging </p>;
    }

    const handleSend = async (content) => {
        if (content.trim()) {
            await sendMessage(selectedFriend, content);
        }
    };

    const handleEdit = async (messageIndex, newContent) => {
        await editMessage(selectedFriend, messageIndex, newContent);
    };

    const handleDelete = async (messageIndex) => {
        await deleteMessage(selectedFriend, messageIndex);
    };

    return (
        <div>
        <div style= {{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '16px' }
}>
{
    loading?(
          <p> Loading messages...</p>
        ) : (
    (messages[selectedFriend] || []).map((msg, idx) => (
        <div
              key= { msg.id }
              style = {{
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: msg.sender === currentUser?.pubKey ? '#e3f2fd' : '#f5f5f5',
        borderRadius: '8px',
    }}
            >
        <p style={{ margin: '0 0 4px 0' }}>
    { msg.msg }
                { msg.isEdited && <span style={{ fontSize: '0.8em', color: 'gray' }}> (edited) </span>}
        </p>
        < small style = {{ color: 'gray' }}>
        { new Date(msg.timestamp * 1000).toLocaleTimeString() }
    </small>

              {
            msg.sender === currentUser?.pubKey && !msg.isDeleted && (
                <div style={{ marginTop: '4px', fontSize: '0.85em' }}>
    <button
                    onClick={() => {
        const newContent = prompt('Edit message:', msg.msg);
        if(newContent) handleEdit(idx, newContent);
    }}
        style = {{ marginRight: '8px', cursor: 'pointer' }}
                  >
        Edit
        </button>
        < button
                    onClick = {() => {
        if(confirm('Delete this message?')) {
    handleDelete(idx);
}
                    }}
style = {{ cursor: 'pointer', color: 'red' }}
                  >
    Delete
    </button>
    </div>
              )}
</div>
          ))
        )}
</div>

    < MessageInput onSend = { handleSend } />
        </div>
  );
}

function MessageInput({ onSend }) {
    const [text, setText] = useCallback(() => '', []);

    return (
        <div style= {{ marginTop: '16px', display: 'flex', gap: '8px' }
}>
    <input
        type="text"
placeholder = "Type a message..."
value = { text }
onChange = {(e) => setText(e.target.value)}
onKeyPress = {(e) => {
    if (e.key === 'Enter') {
        onSend(text);
        setText('');
    }
}}
style = {{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    < button
onClick = {() => {
    onSend(text);
    setText('');
}}
style = {{
    padding: '8px 16px',
        backgroundColor: '#1976d2',
            color: 'white',
                border: 'none',
                    borderRadius: '4px',
                        cursor: 'pointer',
        }}
      >
    Send
    </button>
    </div>
  );
}

// ============ STEP 5: Advanced - Listen to Events =============
/**
 * For more advanced use cases, you can listen to contract events directly
 */

export function EventListenerExample() {
    const { onMessageSent, onFriendAdded } = useChatContext();

    useEffect(() => {
        // Listen for new messages from others
        const unsubscribeMessages = onMessageSent(({ sender, recipient, message, timestamp }) => {
            console.log(`New message from ${sender}: ${message}`);
            // Update your UI here
        });

        // Listen for new friends
        const unsubscribeFriends = onFriendAdded(({ user, friend, friendName, timestamp }) => {
            console.log(`${user} added ${friendName} as a friend`);
            // Update your UI here
        });

        return () => {
            unsubscribeMessages?.();
            unsubscribeFriends?.();
        };
    }, [onMessageSent, onFriendAdded]);

    return <div>Listening to events...</div>;
}

// ============ STEP 6: Update Your ABI =============
/**
 * Make sure your constants.ts has the LATEST ABI from your deployed contract
 * 
 * File: app/context/constants.ts
 * 
 * The hook expects these functions in the ABI:
 * - createUser(name)
 * - updateProfile(newName)
 * - getUsername(address)
 * - checkUserExists(address)
 * - getAllAppUsers()
 * - getUserCount()
 * - addFriend(friendKey, name)
 * - alreadyFriends(user, friendKey)
 * - getFriends()
 * - getFriendByIndex(index)
 * - getFriendCount()
 * - sendMessage(friendKey, messageContent) - MUST EMIT MessageSent event with (messageId, sender, recipient, message, timestamp)
 * - editMessage(friendKey, messageIndex, newContent) - MUST EMIT MessageEdited event
 * - deleteMessage(friendKey, messageIndex) - MUST EMIT MessageDeleted event
 * - readMessage(friendKey)
 * - getMessage(friendKey, messageIndex)
 * - getMessageCount(friendKey)
 * - getGlobalMessageId()
 */

// ============ STEP 7: Error Handling =============
/**
 * The context provides an error state that you can use globally
 */

export function ErrorBoundary() {
    const { error, clearError } = useChatContext();

    if (error) {
        return (
            <div style= {{
            position: 'fixed',
                bottom: '20px',
                    right: '20px',
                        backgroundColor: '#f44336',
                            color: 'white',
                                padding: '16px',
                                    borderRadius: '8px',
                                        cursor: 'pointer',
      }
    } onClick = { clearError } >
        { error }
        </div>
    );
}

return null;
}

// ============ STEP 8: Real-time Updates =============
/**
 * The ChatContext automatically sets up event listeners that will:
 *
 * 1. Listen for MessageSent events
 *    - Auto-add new messages to the messages state
 *    - Increment unreadMessages counter if friend not selected
 *
 * 2. Listen for MessageEdited events
 *    - Auto-update message content in state
 *
 * 3. Listen for MessageDeleted events
 *    - Mark messages as deleted in state
 *
 * 4. Listen for FriendAdded events
 *    - Auto-add friends to state
 *
 * 5. Listen for UserRegistered events
 *    - Auto-add new users to state
 *
 * NO POLLING NEEDED - Events update UI in real-time!
 */

// ============ TESTING CHECKLIST =============
/**
 * ✅ Deploy contract to Sepolia testnet
 * ✅ Copy contract ABI to constants.ts
 * ✅ Update chatAppAddress with deployed address
 * ✅ Wrap your app with ChatProvider
 * ✅ Test createUser function
 * ✅ Test addFriend function
 * ✅ Test sendMessage with event listener (should appear instantly)
 * ✅ Test editMessage (should update instantly)
 * ✅ Test deleteMessage (should mark as deleted instantly)
 * ✅ Test in multiple browser windows (both should receive updates)
 * ✅ Check MetaMask wallet for gas costs
 */

// ============ TROUBLESHOOTING =============
/**
 * 
 * Q: "User not registered" error
 * A: Make sure to call createUser() first
 * 
 * Q: Messages not appearing in real-time
 * A: Ensure contract is emitting events, check browser console for errors
 * 
 * Q: "Not friends with recipient" error
 * A: Make sure you added the friend using addFriend() first
 * 
 * Q: Hook not working
 * A: Make sure your component is wrapped with ChatProvider in layout.tsx
 * 
 * Q: MetaMask not connecting
 * A: Check browser console, ensure MetaMask is installed and on Sepolia network
 * 
 */
