import React, { useState, useEffect } from 'react';
import createServerPopUp from '../components/CreateGroup';
import bubble1 from '../images/bubbles/1.png';
import bubble2 from '../images/bubbles/2.png';
import bubble3 from '../images/bubbles/3.png';

export default function Sidebar({ servers, openCreateServer }) {
  const [search, setSearch] = useState('');

  // 1) Put bubble images in an array
  const bubbleImages = [bubble1, bubble2, bubble3];

  // 2) Map each server’s ID to a randomly chosen bubble
  const [serverBubbles, setServerBubbles] = useState({});

  useEffect(() => {
    const newBubblesMap = {};
    servers.forEach((server) => {
      // If there's no existing bubble assigned, pick a random one
      if (!newBubblesMap[server.id]) {
        const randomIndex = Math.floor(Math.random() * bubbleImages.length);
        newBubblesMap[server.id] = bubbleImages[randomIndex];
      }
    });
    setServerBubbles((prev) => ({ ...prev, ...newBubblesMap }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servers]);

  // Filter servers by search text
  const filteredServers = servers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-1/5 h-screen bg-gradient-to-tr from-cyan-200 via-purple-100 to-yellow-200 text-blue-900 flex flex-col p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search servers..."
            className="w-full p-2 pl-4 pr-10 bg-white rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Search Icon inside Input */}
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>

        {/* Create Server Icon */}
        <button
            onClick={openCreateServer}
            className='text-violet-800 hover:scale-110'
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>

      </div>

      {/* Server List */}
      <div className="flex-3 overflow-y-auto">
        {filteredServers.length > 0 ? (
          <ul className="flex flex-col items-center space-y-4 mb-4">
            {filteredServers.map((server) => (
              <li key={server.id} className="relative group cursor-pointer">
                {/* Bubble image, grows on hover */}
                <img
                  src={serverBubbles[server.id]}
                  alt="Bubble"
                  className="w-54 h-16 transition-transform duration-200 group-hover:scale-110"
                />
                {/* Server name overlay */}
                <span className="absolute top-1/2 left-1/2 w-full text-center transform -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-violet-800 pointer-events-none">
                  {server.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No servers found</p>
        )}
      </div>
    </div>
  );
}
