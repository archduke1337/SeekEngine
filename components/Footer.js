import { GlobeAltIcon } from "@heroicons/react/24/outline";

function Footer() {
    return (
        <footer className="grid w-full divide-y bg-[var(--surface-2)] text-sm text-[var(--text-secondary)] border-t border-[var(--border)]" style={{ borderColor: 'var(--border)' }}>
            {/* Top section */}
            <div className="px-8 py-3">
                <p className="text-[var(--text-primary)] font-medium">SeekEngine</p>
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 grid-flow-row-dense px-8 py-3">
                {/* Centered globe info */}
                <div className="flex justify-center items-center md:col-span-2 lg:col-span-1 lg:col-start-2 text-center">
                    <GlobeAltIcon className="h-5 mr-1 text-[var(--success)]" />
                    <span>Powered with Next.js & Google Search API by Gaurav Yadav</span>
                </div>

                {/* Report link */}
                <div className="flex justify-center space-x-8 whitespace-nowrap md:justify-self-start">
                    <a 
                        href="https://wa.link/7b3nnk"
                        className="text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] rounded px-2 py-1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Report inappropriate teleport site
                    </a>
                </div>


            </div>
        </footer>
    );
}

export default Footer;
