function HeaderOption({ Icon, title, selected, onClick }) {
    return (
        <div
            onClick={onClick} // Optional: If you want it to be interactive (clickable)
            className={`flex items-center space-x-2 border-b-4 border-transparent cursor-pointer 
                hover:text-blue-500 hover:border-blue-500 
                ${selected ? "text-blue-500 border-blue-500" : ""}
                transition-all duration-200 ease-in-out pb-3`}
            aria-label={title} // Improve accessibility
            role="button" // Make it semantically a button for interaction
        >
            <Icon className="h-5" />
            <p className="hidden sm:inline-flex">{title}</p> {/* Only visible on sm+ screens */}
        </div>
    );
}

export default HeaderOption;
