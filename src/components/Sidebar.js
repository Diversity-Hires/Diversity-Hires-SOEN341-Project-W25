import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/solid';

export default function Sidebar({ servers }) {
    const [search, setSearch] = useState('');

    const filteredServers = servers.filter(server =>
        server.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-1/5 h-screen bg-gradient-to-tr from-cyan-200 via-purple-100 to-yellow-200 text-blue-900 flex flex-col p-4 space-y-4">
            {/* Search Bar */}

            <div className="flex items-center gap-4 w-full">
                
                {/* Search Input Container */}
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>

                {/* Additional Icon */}
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
            </div>


            {/* Server List */}
            <div className="flex-1 overflow-y-auto">
                {filteredServers.length > 0 ? (
                    <ul className="space-y-2">
                        {filteredServers.map(server => (
                            <li key={server.id} className="p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                                {server.name}
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
