import React, { useState } from "react";
import HeaderOption from "./HeaderOption";
import {
    EllipsisVerticalIcon as DotsVerticalIcon,
    MapIcon,
    NewspaperIcon,
    PhotoIcon as PhotographIcon,
    PlayIcon,
    MagnifyingGlassIcon as SearchIcon,
} from "@heroicons/react/24/outline";

function HeaderOptions() {
    const [selectedOption, setSelectedOption] = useState("All");

    const handleOptionClick = (option) => {
        setSelectedOption(option);  // Update the selected state
    };

    return (
        <div className="flex w-full flex-col sm:flex-row justify-between items-center text-[var(--text-secondary)] text-sm lg:text-base border-b border-[var(--border)] px-4 lg:pl-52">
            {/* Left Options */}
            {/* Temporarily commented out for debugging
            <div className="flex flex-wrap justify-center sm:justify-start space-x-6 lg:space-x-10 py-2">
                <HeaderOption
                    Icon={SearchIcon}
                    title="All"
                    selected={selectedOption === "All"}
                    onClick={() => handleOptionClick("All")}
                />
                <HeaderOption
                    Icon={PhotographIcon}
                    title="Images"
                    selected={selectedOption === "Images"}
                    onClick={() => handleOptionClick("Images")}
                />
                <HeaderOption
                    Icon={PlayIcon}
                    title="Videos"
                    selected={selectedOption === "Videos"}
                    onClick={() => handleOptionClick("Videos")}
                />
                <HeaderOption
                    Icon={NewspaperIcon}
                    title="News"
                    selected={selectedOption === "News"}
                    onClick={() => handleOptionClick("News")}
                />
                <HeaderOption
                    Icon={MapIcon}
                    title="Maps"
                    selected={selectedOption === "Maps"}
                    onClick={() => handleOptionClick("Maps")}
                />
                <HeaderOption
                    Icon={DotsVerticalIcon}
                    title="More"
                    selected={selectedOption === "More"}
                    onClick={() => handleOptionClick("More")}
                /> 
            </div>
            */}

            {/* Right Options */}
            
                      {/* Temporarily commented out for debugging

            <div className="flex space-x-4 py-2">
                
                <button
                    className="glass px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--accent)] transition-all duration-200"
                    aria-label="Settings"
                    onClick={() => alert('What Settings!!!?')}
                >
                    Settings
                </button>
                <button
                    className="glass px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--accent)] transition-all duration-200"
                    aria-label="Tools"
                    onClick={() => alert('lol no Tools! for you')}
                >
                    Tools
                </button>
                
            </div>
            
            */}

        </div>
    );
}

export default HeaderOptions;
