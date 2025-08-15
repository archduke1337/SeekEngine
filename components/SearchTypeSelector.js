import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function SearchTypeSelector({ searchType, onSelect }) {
    const searchTypes = [
        { id: 'all', label: 'All' },
        { id: 'image', label: 'Images' },
        { id: 'video', label: 'Videos' },
        { id: 'news', label: 'News' }
    ];

    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="glass flex items-center px-3 py-2 text-sm font-medium text-[var(--text-primary)]">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                {searchTypes.find(type => type.id === searchType)?.label || 'All'}
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right glass divide-y divide-gray-100 focus:outline-none">
                    <div className="px-1 py-1">
                        {searchTypes.map((type) => (
                            <Menu.Item key={type.id}>
                                {({ active }) => (
                                    <button
                                        onClick={() => onSelect(type.id)}
                                        className={`${
                                            active ? 'bg-[var(--accent)]' : ''
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-[var(--text-primary)]`}
                                    >
                                        {type.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
