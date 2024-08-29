'use client';
import React from 'react'; // Ensure React is in scope when using JSX
import MenuTitle from './menu-title';
import MenuItem from './menu-item';
import Link from 'next/link';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';

export default function MainMenu() {
  return (
    <nav className='bg-indigo-600 overflow-auto p-1 flex flex-col scrollbar-hide overflow-y-auto '>
      <div className='dark:border-b-black border-b-zinc-300 pb-4 '>
        <MenuTitle />
      </div>
      <header className='py-4 grow flex flex-col gap-4'>
        <Markets />
        <Balance />
        <Order />
      </header>
      <footer className='flex gap-2 items-center text-xs '>Disconnect</footer>
    </nav>
  );
}
