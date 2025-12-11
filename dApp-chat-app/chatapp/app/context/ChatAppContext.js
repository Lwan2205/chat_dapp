'use client'
import { redirect } from 'next/navigation'
import React, { useState, useEffect } from 'react';
import { checkIfWalletIsConnected, connectWallet, connectingWithContract } from '../Utils/apiFeature';


// const [account, setAccount] = useState('');
// const [userName, setUserName] = useState('');
// const [friendLists, setFriendLists] = useState([]);
// const [friendMsg, setFriendMsg] = useState([]);
// const [loading, setLoading] = useState(false);
// const [userLists, setUserLists] = useState([]);
// const [error, setError] = useState('');


export const ChatAppContext = React.createContext(null);
export const ChatAppProvider = ({ children }) => {

    const [object, setObject] = useState({
        account: '' | null,
        userName: "",
        friendList: [],
        friendAddresses: {},
        friendMsg: [],
        userList: [],
        currentUserName: "",
        currentUserAddress: ""
    })

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // const router = useRouter();


    const fetchData = async () => {
        try {
            const contract = await connectingWithContract();
            const connectAccount = await connectWallet();
            const userName = await contract.getUsername(connectAccount);
            const friendList = await contract.getFriends();
            const userList = await contract.getAllAppUsers();
            const friendAddresses = captureFriendAddresses(friendList);
            setObject({ ...object, account: connectAccount, userName: userName, friendList: friendList, userList: userList, friendAddresses: friendAddresses });
            // setObject({...object, account:connectAccount, friendList:friendList, userList:userList});              
        } catch (error) {
            // setError("Please install and connect your wallet");
            console.log(error.message);
        }
    }

    useEffect(() => {
        if (object.account.length == null || object.account.length == 0) fetchData();
    }, [])

    // Setup contract event listeners for realtime updates
    useEffect(() => {
        let contractInstance = null;
        let mounted = true;

        const setupListeners = async () => {
            try {
                const contract = await connectingWithContract();
                contractInstance = contract;

                const onMessageSent = (messageId, sender, recipient, message, timestamp) => {
                    try {
                        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                        const activeAddress = params ? params.get('address') : null;
                        const acc = object.account ? String(object.account).toLowerCase() : null;
                        if (!acc) return;

                        const s = String(sender).toLowerCase();
                        const r = String(recipient).toLowerCase();

                        if (activeAddress && (s === acc || r === acc)) {
                            const other = (s === acc) ? recipient : sender;
                            if (String(other).toLowerCase() === String(activeAddress).toLowerCase()) {
                                // refresh messages for active chat
                                readMessage(activeAddress);
                            }
                        }
                    } catch (err) {
                        console.log('onMessageSent handler error', err);
                    }
                };

                const onMessageEdited = (messageId, sender, recipient, newMessage, editedAt) => {
                    try {
                        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                        const activeAddress = params ? params.get('address') : null;
                        const acc = object.account ? String(object.account).toLowerCase() : null;
                        if (!acc) return;

                        const s = String(sender).toLowerCase();
                        const r = String(recipient).toLowerCase();

                        if (activeAddress && (s === acc || r === acc)) {
                            const other = (s === acc) ? recipient : sender;
                            if (String(other).toLowerCase() === String(activeAddress).toLowerCase()) {
                                readMessage(activeAddress);
                            }
                        }
                    } catch (err) {
                        console.log('onMessageEdited handler error', err);
                    }
                };

                const onMessageDeleted = (messageId, sender, deletedAt) => {
                    try {
                        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                        const activeAddress = params ? params.get('address') : null;
                        const acc = object.account ? String(object.account).toLowerCase() : null;
                        if (!acc) return;

                        const s = String(sender).toLowerCase();

                        if (activeAddress && s === acc) {
                            // If sender is current account and active chat exists, refresh
                            readMessage(activeAddress);
                        } else if (activeAddress) {
                            // If recipient deleted message in other client, still refresh active conversation
                            readMessage(activeAddress);
                        }
                    } catch (err) {
                        console.log('onMessageDeleted handler error', err);
                    }
                };

                contract.on('MessageSent', onMessageSent);
                contract.on('MessageEdited', onMessageEdited);
                contract.on('MessageDeleted', onMessageDeleted);

            } catch (err) {
                console.log('Failed to setup listeners', err);
            }
        };

        setupListeners();

        return () => {
            if (contractInstance) {
                try {
                    contractInstance.removeAllListeners('MessageSent');
                    contractInstance.removeAllListeners('MessageEdited');
                    contractInstance.removeAllListeners('MessageDeleted');
                } catch (e) {
                    // ignore
                }
            }
            mounted = false;
        };
    }, [object.account]);

    const captureFriendAddresses = (friendList) => {
        let addresses = {};
        for (const friend of friendList) {
            addresses[friend.pubKey] = true;
        }

        return addresses;
    }

    const readMessage = async (friendAddress) => {
        try {
            const contract = await connectingWithContract();
            const messages = await contract.readMessage(friendAddress);
            // setObject({...object, friendMsg:messages});
            setObject((prevObject) => ({
                ...prevObject,
                friendMsg: messages
            }))
        } catch (error) {
            // setError("Currently, you have no messages");
            console.log("Currently, you have no messages")
        }
    }

    const createAccount = async ({ name, accountAddress }) => {
        try {
            // if (name || accountAddress) return setError("Name and account must be there");
            // const accountAddress = object.account;
            const contract = await connectingWithContract();
            console.log(contract);
            const getCreatedUser = await contract.createUser(name);
            setLoading(true);
            await getCreatedUser.wait();
            setLoading(false);
            window.location.reload();
        } catch (error) {
            setError("Error while creating the account");
            console.log(error);
        }
    }

    const addFriends = async (name, accountAddress) => {
        try {
            // if (name || accountAddress) return setError("Name and account must be there");
            const contract = await connectingWithContract();
            const addFriend = await contract.addFriend(accountAddress, name);
            setLoading(true);
            await addFriend.wait();
            setLoading(false);
            // router.push('/');
            window.location.href = "/";

        } catch (error) {
            // setError("Something went wrong while adding friend");
            console.log(error);
        }
    }

    const sendMessage = async (msg, accountAddress) => {
        try {
            // if (msg || accountAddress) return setError("Name and account must be there");
            const contract = await connectingWithContract();
            const sentMessage = await contract.sendMessage(accountAddress, msg);
            setLoading(true);
            await sentMessage.wait();
            setLoading(false);
            // window.location.reload();
            readMessage(accountAddress);
        } catch (error) {
            // setError("Please reload and try again");
            console.log(error);
        }
    }

    const readUser = async (accountAddress) => {
        try {

            const contract = await connectingWithContract();
            const username = await contract.getUsername(accountAddress);
            // setObject({...object, currentUserName:username, currentUserAddress:accountAddress});
            setObject((prevObject) => ({
                ...prevObject,
                currentUserName: username,
                currentUserAddress: accountAddress
            }))
        } catch (error) {
            // setError("Please reload and try again");
            console.log(error);
        }
    }

    const editMessage = async (friendAddress, messageIndex, newContent) => {
        try {
            const contract = await connectingWithContract();
            const editMsg = await contract.editMessage(friendAddress, messageIndex, newContent);
            setLoading(true);
            await editMsg.wait();
            setLoading(false);
            // Refresh messages
            readMessage(friendAddress);
        } catch (error) {
            setError("Failed to edit message");
            console.log(error);
        }
    }

    const deleteMessage = async (friendAddress, messageIndex) => {
        try {
            const contract = await connectingWithContract();
            const delMsg = await contract.deleteMessage(friendAddress, messageIndex);
            setLoading(true);
            await delMsg.wait();
            setLoading(false);
            // Refresh messages
            readMessage(friendAddress);
        } catch (error) {
            setError("Failed to delete message");
            console.log(error);
        }
    }


    return (
        <ChatAppContext.Provider value={{ object, setObject, connectWallet, connectingWithContract, readMessage, createAccount, addFriends, sendMessage, readUser, editMessage, deleteMessage, error, setError, loading }}>
            {children}
        </ChatAppContext.Provider>
    )
}