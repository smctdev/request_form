import React from 'react';
import { MoonIcon } from "@heroicons/react/24/solid";
import Avatar from "./assets/avatar.png";

type Props = {}

function Navbar({}: Props) {
  return (
    <nav>
      <div className='fixed top-0 left-0 right-0 flex items-center bg-gray-200 p-2' style={{ marginLeft: '250px', marginRight: '20px' }}>
        <div className='flex items-center flex-1'>
            <h1 className='text-[32px] font-bold text-primary'>Dashboard</h1>
        </div>
        <div className='flex items-center space-x-4'>
          <MoonIcon className="h-6 w-6 text-black" />
          {/* Add other icons or components here */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
