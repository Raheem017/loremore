

import React from "react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[rgb(245,250,255)] border-b-2 border-[#d1e4f5]  z-50 flex items-center px-8">
      <img src="/jsonformatLogo.svg" alt="logo" className="h-10 w-auto" />
      <a
        href="https://blog.json-format.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto  mr-[4rem] text-blue-700 text-lg font-bold hover:text-black"
      >
        BLOG
      </a>
    </header>
  );
};

export default Header;
