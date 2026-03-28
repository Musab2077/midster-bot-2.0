import React from "react";

export default function NavBar({ children }) {
  const childArray = React.Children.toArray(children);
  return (
    <nav className="flex items-center justify-between h-14 px-3 bg-[#07080f]/80 border-b border-white/[0.07] backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">{childArray[0]}</div>
      <div className="flex items-center gap-2">{childArray[1]}</div>
    </nav>
  );
}

export function NavBarItem({ icon, logOutFuction, context }) {
  return (
    <>
      {icon && <div className="flex items-center">{icon}</div>}
      {context && (
        <span className="text-base font-semibold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent tracking-tight px-1 select-none">
          {context}
        </span>
      )}
      {logOutFuction && (
        <button
          onClick={logOutFuction}
          className="text-xs font-medium text-white/40 bg-white/[0.06] border border-white/10 px-3.5 py-1.5 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-200"
        >
          Log out
        </button>
      )}
    </>
  );
}
