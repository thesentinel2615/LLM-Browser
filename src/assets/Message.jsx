import React, {useRef, useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

function Message({ message, index, editedMessageIndex, handleEditMessage, handleTextEdit, handleMessageKeyDown}) {
  const editedMessageRef = useRef(null);
  const isTyping = message.text.includes("is typing");

  return (
    <div key={index} className={`inline-flex text-left text-white ${message.isIncoming ? "incoming-message" : "outgoing-message"} pop-in`}>
      <div className="message-info flex flex-col border-2 border-emerald-500 box-border w-full rounded-lg p-2">
        <p className="sender-name m-0 inline-flex items-end font-bold">{message.sender}</p>
        {message.image && (
          <>
            <p className='message-text m-0 font-sans text-white h-auto py-1 box-border resize-none overflow-y-auto min-w-full'><i>Current Page:</i></p>
            <img className="sent-image" src={`screenshots/${message.image}`} alt="Current Page"/>
          </>
        )}
        {message.url && (
          <>
            <a href={message.url} target="_blank" className="text-white w-fit bg-indigo-700 hover:bg-rindigoed-800 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800">Visit Current Page</a>
          </>
        )}
        {editedMessageIndex === index ? (
          <div className="flex items-center flex-wrap w-full">
            <TextareaAutosize
              className="m-0 bg-transparent text-white font-sans text-base h-auto py-1 rounded-lg border-2 border-emerald-500 box-border resize-none overflow-y-auto w-[42.5rem] min-w-full"
              style={{ textShadow: '2px 2px 2px rgba(0, 0, 0, 0.411)' }}
              onBlur={(e) => handleTextEdit(index, e.target.value)}
              onKeyDown={(e) => handleMessageKeyDown(e)}
              ref={editedMessageRef}
              defaultValue={message.text}
            />
          </div>
        ) : (
          <div onDoubleClick={(event) => handleEditMessage(event, index)}>
            {isTyping ? (
              <>
                <div className="loading">
                  <div className="loading__letter">  .</div>
                  <div className="loading__letter">.</div>
                  <div className="loading__letter">.</div>
                </div>
              </>
            ) : (
              <ReactMarkdown 
              className='message-text m-0 font-sans text-white h-auto py-1 box-border resize-none overflow-y-auto min-w-full'
              components={{
                em: ({ node, ...props }) => <i style={{ color: "var(--selected-italic-color)" }} {...props} />,
              }}
              >{message.text}</ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
