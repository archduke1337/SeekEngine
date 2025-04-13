import HeaderOption from "./HeaderOption";

import {
    DotsVerticalIcon,
    MapIcon,
    NewspaperIcon,
    PhotographIcon,
    PlayIcon,
    SearchIcon,
} from "@heroicons/react/outline";

function HeaderOptions() {
    return (
        <div className="flex w-full flex-col sm:flex-row justify-between items-center text-gray-700 dark:text-gray-300 text-sm lg:text-base border-b px-4 lg:pl-52">
            {/* Left Options */}
            <div className="flex flex-wrap justify-center sm:justify-start space-x-6 lg:space-x-10 py-2">
                <HeaderOption Icon={SearchIcon} title="All" selected />
                <HeaderOption Icon={PhotographIcon} title="Images" />
                <HeaderOption Icon={PlayIcon} title="Videos" />
                <HeaderOption Icon={NewspaperIcon} title="News" />
                <HeaderOption Icon={MapIcon} title="Maps" />
                <HeaderOption Icon={DotsVerticalIcon} title="More" />
            </div>

            {/* Right Options */}
            <div className="flex space-x-4 py-2">
                <p className="link cursor-pointer hover:underline">Settings</p>
                <p className="link cursor-pointer hover:underline">Tools</p>
            </div>
        </div>
    );
}

export default HeaderOptions;
