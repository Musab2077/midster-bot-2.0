import React from "react";

export default function SideBar({ children, iconResponse, designing }) {
  const childArray = React.Children.toArray(children);
  const topControls = childArray[0];
  const chatList = childArray[1];

  return (
    <aside
      className={`
        flex flex-col min-h-screen pt-4 px-3 overflow-y-auto transition-all duration-300
        ${
          iconResponse
            ? "w-60 bg-[#0d0e1a] border-r border-white/[0.07]"
            : "w-14 bg-[#07080f] border-r border-white/[0.05] items-center"
        }
        ${designing || ""}
      `}
    >
      <div className="w-full">{topControls}</div>

      {iconResponse && (
        <div className="mt-5 flex-1 w-full">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 px-2 mb-2">
            Recent Chats
          </span>
          <div className="flex flex-col gap-0.5">{chatList}</div>
        </div>
      )}
    </aside>
  );
}

export function SideBarItems({ expanding }) {
  return (
    <span className="flex items-center justify-center text-white/50">
      {expanding}
    </span>
  );
}

// savedChat : YouTube video ID (used as display label)
// videoId   : same YouTube video ID (passed to onClick)
// onClick   : called with videoId when clicked
export function SideBarSavedChat({ savedChat, videoId, onClick }) {
  return (
    <button
      onClick={() => onClick?.(videoId)}
      className="flex items-center gap-1.5 text-sm text-white/65 truncate max-w-[150px] bg-transparent border-none cursor-pointer hover:text-white/90 transition-colors text-left w-full"
    >
      {savedChat ? (
        <>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="#EF4444"
            className="flex-shrink-0"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="truncate">{savedChat}</span>
        </>
      ) : (
        <span className="truncate text-white/50">New Chat</span>
      )}
    </button>
  );
}
