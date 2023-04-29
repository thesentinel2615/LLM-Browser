import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import ChatboxInput from './Chatinput';
import { defaultPrompt } from './Constants';

const Chatwindow = () => {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [editedMessageIndex, setEditedMessageIndex] = useState(-1);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const savedConversation = localStorage.getItem('conversation');
        if (savedConversation) {
            setMessages(JSON.parse(savedConversation).messages);
        }
        if(messages.length === 0){
            setMessages([{sender: 'Chatbot', text: "Welcome to the LLM Browser! Type in your request to get started!", isIncoming: true, timestamp: Date.now()}]);
        }
    }, []);

    const handleUserSend = async (text) => {
        const newMessage = {
            sender: 'User',
            text: text,
            isIncoming: false,
            timestamp: now.getTime(),
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages); // Update messages state with the new user message
        saveConversation({conversationName: conversation.conversationName, messages: updatedMessages});
        handleChatbotResponse(updatedMessages); // Pass updatedMessages instead of messages
    };
      
    const handleMessageKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    };

    return (
        <>
        <div className="min-h-screen flex justify-center">
            <div className="flex flex-col">
                <div className="mx-auto max-w-full sm:min-w-full">
                    <div className="h-[calc(75vh-7rem)] overflow-x-hidden relative flex flex-col justify-start bg-orange-800 mt-4 rounded-t-lg p-2 shadow-sm backdrop-blur-md md:max-w-[750px] md:min-w-[750px] md:h-[75vh] border-1 border-solid border-gray-500">
                        {messages.map((message, index) => (
                            <Message
                            key={index}
                            message={message}
                            index={index}
                            editedMessageIndex={editedMessageIndex}
                            handleMessageKeyDown={handleMessageKeyDown}
                            messages={messages}
                            />
                        ))}
                        <div ref={messagesEndRef}></div>
                    </div>
                    <ChatboxInput onSend={handleUserSend}/>
                </div>
            </div>
        </div>
      </>
    );
}
export default Chatwindow;