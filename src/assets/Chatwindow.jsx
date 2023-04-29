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
            timestamp: Date.now(),
        };
        let updatedMessages = [...messages, newMessage];
        if(text.startsWith('!')){ // If the user message starts with an exclamation mark, it is a command
            const command = text.split(' ')[0].substring(1);
            switch (command.toLowerCase()) {
                case 'restart':
                    setMessages([{sender: 'Chatbot', text: "Welcome to the LLM Browser! Type in your request to get started!", isIncoming: true, timestamp: Date.now()}]);
                    break;
                case 'confirm':
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "Confirmed!", isIncoming: true, timestamp: Date.now()}]);
                    handleCrawlerCommand('confirm');
                    break;
                case 'help':
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "Available commands: !confirm, !help, !restart.", isIncoming: true, timestamp: Date.now()}]);
                default:
                    setMessages([...updatedMessages, {sender: 'Chatbot', text: "Command not recognized!", isIncoming: true, timestamp: Date.now()}]);
                    break;
        }if(messages.length === 1 || messages[messages.length-2].text === 'Welcome to the LLM Browser! Type in your request to get started!'){
            handleCrawlerCommand('objective', text);
            setMessages([...updatedMessages, {sender: 'Chatbot', text: `Objective: "${text}"`, isIncoming: true, timestamp: Date.now()}]);
        }

        } // Update messages state with the new user message
        saveConversation({conversationName: conversation.conversationName, messages: updatedMessages});
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