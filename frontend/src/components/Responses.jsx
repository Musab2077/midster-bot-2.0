import React, { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import ReactMarkdown from "react-markdown";
import { IoIosArrowRoundUp } from "react-icons/io";

const Responses = ({
  isNewChat,
  inputResponse,
  isLoading,
  onSendMessage,
  handleTextArea,
  children,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "60px";
      }
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (handleTextArea) {
      handleTextArea(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  return (
    <div className="h-screen flex flex-col">
      {/* Bot and Human messages */}
      <div key={2} className="overflow-auto flex-1 px-10">
        <div key={3} className="mb-14 p-4">
          {children}
        </div>
      </div>

      {/* Input area */}
      <div
        className={`${
          inputResponse ? "md:bottom-1/3 bottom-0" : "bottom-0"
        } sticky left-0 right-0 bg-background pt-2 mx-10 pb-4`}
      >
        {inputResponse && (
          <div className="bottom-0 text-center mb-6">
            <h1 className="text-2xl">From symptoms to solutions</h1>
            <h4 className="text-lg">faster, smarter, safer with AI.</h4>
          </div>
        )}
        <div className="w-full max-w-3xl mx-auto">
          {isLoading && isNewChat && (
            <div className="text-center text-gray-400 mb-3 animate-pulse">
              Processing YouTube video… Please wait ⏳
            </div>
          )}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                disabled={isLoading}
                placeholder={
                  isLoading && isNewChat
                    ? "Processing YouTube video..."
                    : isNewChat
                    ? "Place your youtube url"
                    : "Message Midster-Bot"
                }
                className={`w-full p-4 pt-5 pr-12 rounded-2xl bg-inputBg text-white focus:outline-none resize-none ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ minHeight: "60px" }}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="absolute right-2 bottom-2 pb-2 pr-4 text-black hover:opacity-55 transition-opacity disabled:opacity-40"
              >
                <IoIosArrowRoundUp className="bg-white rounded-full size-8" />
              </button>
            </div>
          </form>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Responses;

export function ResponseItems({ humanMsg, botMsg, item }) {
  return (
    <>
      <div key={item} className="place-items-end overflow-hidden">
        <div key={item} className="lg:max-w-md my-5 sm:max-w-sm max-w-52">
          <div
            key={item}
            className={`${
              humanMsg && "bg-hoveringIcon"
            } rounded-xl px-5 py-2.5`}
          >
            <p key={item}>{humanMsg}</p>
          </div>
        </div>
      </div>
      <div>
        <ReactMarkdown>{botMsg}</ReactMarkdown>
      </div>
    </>
  );
}
