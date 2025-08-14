function HeaderOption({ Icon, title, selected, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center space-x-2 border-b-4 border-transparent cursor-pointer
                hover:text-[var(--primary)] hover:border-[var(--primary)]
                ${selected ? "text-[var(--primary)] border-[var(--primary)]" : ""}
                transition-all duration-200 ease-in-out pb-3`}
            aria-label={title}
            role="button"
        >
            <Icon className={`h-5 transition-transform duration-200 ${selected ? 'scale-110' : ''}`} />
            <p className="hidden sm:inline-flex font-medium">{title}</p>
        </div>
    );
}

export default HeaderOption;
