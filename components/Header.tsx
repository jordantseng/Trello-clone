'use client';
import { ChangeEvent } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import Avatar from 'react-avatar';

import { useBoardStore } from '@/store/BoardStore';
import debounce from '@/lib/debounce';

const Header = () => {
  const setSearchString = useBoardStore((state) => state.setSearchString);

  const handleChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
  }, 300);

  return (
    <header>
      <div className="flex flex-col md:flex-row items-center p-5 bg-gray-500/10 rounded-b-2xl">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-pink-400 to-[#0055D1] rounded-md filter blur-3xl opacity-50 -z-50" />
        <Image
          src="https://links.papareact.com/c2cdd5"
          alt="Trello Logo"
          width={300}
          height={100}
          className="w-44 md:w-56 pb-10 md:pb-0 object-contain"
        />
        <div className="flex items-center space-x-5 flex-1 justify-end w-full">
          <form
            className="flex items-center space-x-5 bg-white rounded-md p-2 shadow-md flex-1 md:flex-initial"
            onSubmit={(e) => e.preventDefault()}
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 outline-none p-2"
              // FIXME: render issue
              onChange={handleChange}
            />
            <button type="submit" hidden />
          </form>
          <Avatar name="Jordan Tseng" round color="#0055D1" size="50" />
        </div>
      </div>
    </header>
  );
};

export default Header;
