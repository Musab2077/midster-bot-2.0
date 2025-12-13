import React from "react";

export default function NavBar({ children }) {
  const [iconChild, logoutChild] = React.Children.toArray(children);

  return (
    <>
      <nav className="flex items-center justify-between h-14 border-b border-b-white border-opacity-15 shadow-xl px-1">
        {iconChild}
        {logoutChild}
      </nav>
    </>
  );
}

export function NavBarItem({
  icon,
  logOutFuction,
  context,
}) {
  return (
    <>
      <ul>{icon}</ul>
      <ul className="hover:bg-hoveringIcon p-2 rounded-xl">{context}</ul>
      <ul className="p-4">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={logOutFuction}
        >
          Logout
        </button>
      </ul>
    </>
  );
}
