'use client';
import { ChangeEvent } from 'react';
import Image from 'next/image';
import Avatar from 'react-avatar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

import { useSearchStore } from '@/store/SearchStore';
import debounce from '@/lib/debounce';

const Header = () => {
  const updateSearchString = useSearchStore(
    (state) => state.updateSearchString
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSearchString(e.target.value);
  };

  return (
    <header>
      <div className="flex flex-col items-center rounded-b-2xl bg-gray-500/10 p-5 md:flex-row">
        <div className="absolute left-0 top-0 -z-50 h-96 w-full rounded-md bg-gradient-to-br from-pink-400 to-[#0055D1] opacity-50 blur-3xl filter" />
        <Image
          src="/trello-logo.webp"
          alt="Trello Logo"
          width={300}
          height={100}
          className="w-44 object-contain pb-10 md:w-56 md:pb-0"
        />
        <div className="flex w-full flex-1 items-center justify-end space-x-5">
          <form
            className="flex flex-1 items-center space-x-5 rounded-md bg-white p-2 shadow-md md:flex-initial"
            onSubmit={(e) => e.preventDefault()}
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 p-2 outline-none"
              onChange={debounce(handleChange, 300)}
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
