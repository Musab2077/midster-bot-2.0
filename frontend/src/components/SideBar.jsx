import React, { useState } from "react";

export default function SideBar({ children, iconResponse, designing }) {
  const [sideChildren, scChildren] = React.Children.toArray(children);

  const [animation, setAnimation] = useState();

  return (
    <>
      <aside
        className={`${
          iconResponse
            ? `w-64 bg-sidebarBg ${designing}`
            : "w-14 bg-mainBg border border-sidebarBg border-r-black"
        } min-h-screen pt-4 px-3 overflow-y-auto`}
      >
        <nav>
          <div className="flex flex-col">
            {/* top of sideBar */}
            <div className="overflow-y-hidden">{sideChildren}</div>
            {/* Saved Chat */}
            {iconResponse && (
              <div className="my-4">
                <span className="opacity-50 pl-2">Chat</span>
                {scChildren}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

export function SideBarItems({ expanding }) {
  return expanding;
}

export function SideBarSavedChat({ savedChat }) {
  return savedChat;
}
