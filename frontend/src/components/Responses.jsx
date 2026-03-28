import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { IoIosArrowRoundUp } from "react-icons/io";

// Animated typing indicator shown while bot is generating
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start mb-6">
      {/* Avatar */}
      <div className="w-7 h-7 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" stroke="url(#av-t)" strokeWidth="2" />
          <path d="M11 18 Q18 9 25 18 Q18 27 11 18Z" fill="url(#av-t)" />
          <defs>
            <linearGradient
              id="av-t"
              x1="0"
              y1="0"
              x2="36"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

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
  const bottomRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "52px";
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTextArea?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [message]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [children, isLoading]);

  const placeholder =
    isLoading && isNewChat
      ? "Processing YouTube video…"
      : isNewChat
        ? "Paste a YouTube URL to get started…"
        : "Message MidsterBot…";

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
          {children}
          {/* Show typing indicator when waiting for bot response */}
          {isLoading && !isNewChat && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input zone */}
      <div
        className={`
          px-4 pb-5 pt-2
          bg-gradient-to-t from-[#07080f] via-[#07080f]/95 to-transparent
          ${inputResponse ? "absolute inset-x-0 bottom-0" : "relative"}
        `}
      >
        {inputResponse && (
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white via-white to-indigo-300 bg-clip-text text-transparent">
              From symptoms to solutions
            </h1>
            <p className="mt-1.5 text-sm text-white/35 font-light">
              Faster, smarter, safer — powered by AI
            </p>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* YouTube processing banner */}
          {isLoading && isNewChat && (
            <div className="flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-400/20 rounded-xl px-4 py-2.5 mb-3 text-sm text-white/60">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
              Processing YouTube video — this may take a moment…
            </div>
          )}

          {/* Textarea card */}
          <div
            className={`relative bg-white/[0.06] border rounded-2xl transition-all duration-200 focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/10 ${
              isLoading ? "border-white/5 opacity-60" : "border-white/10"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={placeholder}
              rows={1}
              className="w-full bg-transparent border-none outline-none resize-none text-white text-sm font-light placeholder-white/25 px-4 pt-3.5 pb-3 pr-14 leading-relaxed min-h-[52px] max-h-[200px] disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white flex items-center justify-center hover:opacity-85 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-20 disabled:bg-none disabled:bg-white/15 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              <IoIosArrowRoundUp size={20} />
            </button>
          </div>

          <p className="text-center text-[11px] text-white/20 mt-2">
            AI-generated for reference only — not medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default Responses;

export function ResponseItems({ humanMsg, botMsg, item }) {
  const isGenerating = botMsg === "...";

  return (
    <div key={item} className="mb-6 animate-fade-in">
      {/* Human bubble */}
      {humanMsg && (
        <div className="flex justify-end mb-4">
          <div className="bg-indigo-500/15 border border-indigo-400/20 rounded-[18px] rounded-tr-sm px-4 py-2.5 max-w-[75%] text-sm text-white/90 font-light leading-relaxed animate-slide-up">
            {humanMsg}
          </div>
        </div>
      )}

      {/* Bot response */}
      {botMsg && !isGenerating && (
        <div className="flex gap-3 items-start animate-slide-up">
          {/* Avatar */}
          <div className="w-7 h-7 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="18"
                cy="18"
                r="17"
                stroke="url(#av1)"
                strokeWidth="2"
              />
              <path d="M11 18 Q18 9 25 18 Q18 27 11 18Z" fill="url(#av1)" />
              <defs>
                <linearGradient
                  id="av1"
                  x1="0"
                  y1="0"
                  x2="36"
                  y2="36"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#818CF8" />
                  <stop offset="1" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Markdown content */}
          <div
            className="flex-1 text-sm text-white/80 font-light leading-relaxed prose prose-invert prose-sm max-w-none
            prose-p:my-2 prose-p:leading-relaxed
            prose-headings:text-white prose-headings:font-semibold
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-indigo-300 prose-code:bg-indigo-500/15 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:border prose-code:border-indigo-400/20 prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-white/[0.05] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
            prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
            prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline
          "
          >
            <ReactMarkdown>{botMsg}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
