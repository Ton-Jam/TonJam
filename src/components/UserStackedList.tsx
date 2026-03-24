import React from 'react';
import { getPlaceholderImage } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  role: string;
  imageUrl: string;
  lastSeen: string | null;
  lastSeenDateTime?: string;
}

interface UserStackedListProps {
  users: User[];
}

export const UserStackedList: React.FC<UserStackedListProps> = ({ users }) => {
  return (
    <ul role="list" className="divide-y divide-white/5">
      {users.map((person) => (
        <li key={person.email} className="flex justify-between gap-x-6 py-5">
          <div className="flex min-w-0 gap-x-4">
            <img
              alt=""
              src={person.imageUrl || getPlaceholderImage(`user-${person.email}`)}
              className="size-12 flex-none rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
            />
            <div className="min-w-0 flex-auto">
              <p className="text-sm/6 font-semibold text-white">{person.name}</p>
              <p className="mt-1 truncate text-xs/5 text-gray-400">{person.email}</p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm/6 text-white">{person.role}</p>
            {person.lastSeen ? (
              <p className="mt-1 text-xs/5 text-gray-400">
                Last seen <time dateTime={person.lastSeenDateTime}>{person.lastSeen}</time>
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-x-1.5">
                <div className="flex-none rounded-full bg-emerald-500/30 p-1">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs/5 text-gray-400">Online</p>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
