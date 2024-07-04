"use client";
import React from "react"; // Ensure React is in scope when using JSX
import MenuTitle from "./menu-title";
import MenuItem from "./menu-item";
import Link from "next/link";
import Markets from "./Markets";

export default function MainMenu() {
  return (
    <nav className="bg-sky-950 overflow-auto p-4 flex flex-col">
      <div className="dark:border-b-black border-b-zinc-300 pb-4">
        <MenuTitle />
      </div>
      <header className="py-4 grow">
        {/* Markets */}
        <Markets />

        {/* Balance */}
        <MenuItem href="/dashboard/teams">Balance</MenuItem>

        {/* Order */}
        <MenuItem href="/dashboard/teams">Order</MenuItem>
      </header>
      <footer className="flex gap-2 items-center ">Disconnect Wallet</footer>
    </nav>
  );
}
