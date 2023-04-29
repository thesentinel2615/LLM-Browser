import React, { useState, useEffect, useRef } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

function ChatboxInput({ onSend }) {
  const [text, setText] = useState("");
  const textAreaRef = useRef(null);
  
  useEffect(() => {
    if (textAreaRef.current) {
      // Auto-scroll to the bottom of the textarea
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, []);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSendClick = () => {
    onSend(text);
    setText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };
  
  return (
    <>
    <div className="input-box relative overflow-x-auto flex flex-col justify-start p-2 bg-orange-800 rounded-b-lg px-1 mt-1 h-18 send-input-container border-2 border-solid border-gray-500">
      <div className="send-input flex justify-between items-center">
        <textarea
          id="input"
          autoComplete="off"
          value={text}
          placeholder="Type your message..."
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          ref={textAreaRef}
          className="min-h-[1rem] bg-transparent backdrop-blur border-none outline-none text-white flex-grow ml-2 h-auto overflow-y-scroll resize-none noto-sans-font "
        />
        <div onClick={handleSendClick} id="FiSend" title={'Send message'}>
          <HiOutlinePaperAirplane />
        </div>
      </div>
    </div>
    </>
  );
}

export default ChatboxInput;
