import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import ChatboxInput from './Chatinput';
import { handleCrawlerCommand } from "./api";

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
            setMessages([{sender: 'Chatbot', text: "Welcome to the LLM Browser! Type in your request prefixed by '!objective' to get started!", isIncoming: true, timestamp: Date.now()}]);
        }
    }, []);

    const handleUserSend = async (text) => {
        if(text.length === 0){
            setMessages([...messages, {sender: 'Chatbot', text: "**Confirmed!**", isIncoming: true, timestamp: Date.now()}]);
            await handleCrawlerCommand('confirm');
            return;
        }
        const newMessage = {
            sender: 'User',
            text: text,
            isIncoming: false,
            timestamp: Date.now(),
        };
        let updatedMessages = [...messages, newMessage];
        if(text.startsWith('!')){
            const command = text.split(' ')[0].substring(1);
            const objective = text.split(' ').slice(1).join(' ');
            switch (command.toLowerCase()) {
                case 'restart':
                    setMessages([{sender: 'Chatbot', text: "Welcome to the LLM Browser! Type in your request prefixed by '!objective' to get started!", isIncoming: true, timestamp: Date.now()}]);
                    break;
                case 'confirm':
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "**Confirmed!**", isIncoming: true, timestamp: Date.now()}]);
                    await handleCrawlerCommand('confirm');
                    break;
                case 'objective':
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "is typing", isIncoming: true, timestamp: Date.now()}]);
                    let newCommand = await handleCrawlerCommand('objective', objective);
                    if(newCommand){
                        setMessages([...updatedMessages, {sender: 'Chatbot', text: "**Recommend Command:** " + newCommand.text, image: newCommand.image, isIncoming: true, timestamp: Date.now()}]);
                    }
                    break;
                case 'help':
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "**Available commands:** !confirm, !help, !restart.", isIncoming: true, timestamp: Date.now()}]);
                    break;
                default:
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "**Command not recognized!**", isIncoming: true, timestamp: Date.now()}]);
                    break;
            }
        }
    };
      
    const handleMessageKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    };

    return (
        <>
        <div className="flex flex-col">
            <div className="mx-auto w-1/2">
                <div className="h-[calc(75vh-7rem)] overflow-x-hidden relative flex flex-col justify-start bg-orange-800 mt-4 rounded-t-lg p-2 shadow-sm backdrop-blur-md md:h-[75vh] border-2 border-solid border-gray-500">
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
      </>
    );
}
export default Chatwindow;