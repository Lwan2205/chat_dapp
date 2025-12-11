'use client'
import Image from 'next/image';
import Loader from './Loader';
import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';

type Props = {
  functionName: any;
  readMessage: any;
  friendMsg: any;
  account: string;
  userName: string;
  currentUserName: string;
  currentUserAddress: string;
  loading: boolean;
  readUser: any;
  editMessage?: (chatAddress: string, index: number, newMsg: string) => Promise<any>;
  deleteMessage?: (chatAddress: string, index: number) => Promise<any>;
}

const Chat = (props: Props) => {

  const [message, setMessage] = useState("");
  const [chatData, setChatData] = useState({
    name: "",
    address: ""
  })

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [activeActionsIndex, setActiveActionsIndex] = useState<number | null>(null);

  // const searchParams = useSearchParams();

  // const noParams = () => {
  //   return !searchParams.has("name") && !searchParams.has("address");
  // }

  const noParams = (name: string, address: string) => {
    return name.length == 0 && address.length == 0;
  }

  // send handler clears the input after invoking the provided function
  const handleSend = async (text: string, address: string) => {
    try {
      // call provided functionName (may return a Promise)
      const res = props.functionName(text, address);
      if (res && typeof (res as Promise<any>).then === 'function') {
        await (res as Promise<any>);
      }
    } catch (err) {
      // ignore here (provider/context should handle errors)
      console.error('send error', err);
    } finally {
      setMessage('');
    }
  }

  useEffect(() => {

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get("name") || "";
      const address = params.get("address") || "";
      if (noParams(name, address)) return;
      setChatData({ name, address });
      props.readMessage(address);
    }

    // setChatData({name:searchParams.get("name")!, address:searchParams.get("address")!});
    // props.readMessage(searchParams.get("address"));


  }, [typeof window !== 'undefined' && window.location.search])
  // }, [searchParams])


  useEffect(() => {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      const scrollHeight = chatContainer.scrollHeight;
      const currentScrollTop = chatContainer.scrollTop;
      chatContainer.classList.add("opacity-100", "scale-100");
      const targetScrollTop = scrollHeight;
      const duration = 500; // Adjust the duration as needed (in milliseconds)

      const startTime = performance.now();

      const animateScroll = (currentTime: any) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        chatContainer.scrollTop = currentScrollTop + progress * (targetScrollTop - currentScrollTop);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);

    }
  }, [typeof window !== 'undefined' && window.location.search, props.friendMsg])
  // }, [searchParams, props.friendMsg])


  return (
    <div className='bg-slate-800 rounded-md relative' onClick={() => setActiveActionsIndex(null)}>

      {chatData.name.length != 0 && chatData.address.length != 0 ? (
        <div className='flex flex-col h-[70vh] p-3 '>
          {props.currentUserName && props.currentUserAddress ? (
            <div className='p-4 flex items-center space-x-4'>
              <Image src={"/assets/acountName.png"} alt='accountName' width={70} height={70} />
              <div>
                <h4>{props.currentUserName}</h4>
                <p className='truncate w-1/3 md:w-2/4 lg:w-full'>{props.currentUserAddress}</p>
              </div>
            </div>
          ) : ("")
          }

          <div>
            <div>

              {/* Left */}
              <div id='chatContainer' className=' h-[45vh] overflow-y-scroll flex-col  transition-opacity duration-300 ease-in-out opacity-0 scale-95'>
                {props.friendMsg.map((el: any, idx: number) => {
                  const isSender = el.sender != chatData.address; // message from current user
                  return (
                    <div className={`mr-8 ml-8  p-4 flex flex-col ${isSender ? "items-end" : "items-start"}`} key={idx + 1}>

                      <div className='flex space-x-1 items-right'>
                        <Image src={"/assets/acountName.png"} alt='image' width={50} height={50} />
                        <span className='flex items-center justify-center space-x-2 text-sm md:text-base'>
                          <h4 className='text-sm md:text-base text-white'>{el.sender == chatData.address ? chatData.name : props.userName}</h4>
                        </span>
                      </div>


                      {/* Message bubble — clicking your own message toggles actions */}
                      {editingIndex === idx ? (
                        <div className='mt-2'>
                          <input
                            className='w-full p-2 rounded-md bg-white text-black'
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <div className='flex gap-2 mt-2'>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (props.editMessage) {
                                  await props.editMessage(chatData.address, idx, editText);
                                  await props.readMessage(chatData.address);
                                }
                                setEditingIndex(null);
                              }}
                              className='px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded'
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingIndex(null);
                              }}
                              className='px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={`${isSender ? "bg-lime-600 text-white" : "bg-[#b7772db2] text-black"} text-sm md:text-base rounded-md max-w-xl p-3 mt-2 `}
                          onClick={(e) => {
                            if (isSender && !el.isDeleted) {
                              e.stopPropagation();
                              setActiveActionsIndex((prev) => (prev === idx ? null : idx));
                            }
                          }}
                          key={idx + 1}
                        >
                          {el.msg}
                        </p>
                      )}

                      {/* Action buttons shown when user clicks their own message */}
                      {isSender && !el.isDeleted && activeActionsIndex === idx && (
                        <div className='flex gap-2 mt-2 text-xs'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIndex(idx);
                              setEditText(el.msg);
                              setActiveActionsIndex(null);
                            }}
                            className='px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded'
                          >
                            Edit
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Delete this message?')) {
                                if (props.deleteMessage) {
                                  await props.deleteMessage(chatData.address, idx);
                                  await props.readMessage(chatData.address);
                                }
                                setActiveActionsIndex(null);
                              }
                            }}
                            className='px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded'
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>
            {props.currentUserAddress && props.currentUserName ? (
              <div className='absolute bottom-1 w-full'>
                <div className='flex h-10 space-x-2 mb-4 ml-4 mr-12'>
                  <Image className='cursor-pointer' src={"/assets/smile.png"} alt='smile' width={50} height={50} />
                  <input
                    className=' w-full p-2 outline-none bg-orange-500 placeholder-white  rounded-md text-white'
                    type='text'
                    placeholder='Type your message here'
                    value={message}
                    onChange={(e: any) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // prevent newline in input
                        e.preventDefault();
                        if (message.trim().length > 0) handleSend(message, chatData.address);
                      }
                    }}
                  />
                  <Image className='cursor-pointer' src={"/assets/file.png"} alt='file' width={50} height={50} />
                  {
                    props.loading ? <Loader /> : <Image className='cursor-pointer' onClick={() => message.trim().length > 0 && handleSend(message, chatData.address)} src={"/assets/send.png"} alt='send' width={50} height={50} />
                  }
                </div>
              </div>
            ) :
              <div>

              </div>
            }
          </div>

        </div>
      ) : ("")
      }


    </div>
  )
}

export default Chat 