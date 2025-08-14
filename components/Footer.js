import { GlobeAltIcon } from "@heroicons/react/24/solid";

function Footer() {
    return (
        <footer className="grid w-full divide-y divide-gray-300 bg-gray-100 text-sm text-gray-400 dark:bg-gray-800">
            {/* Top section */}
            <div className="px-8 py-3">
                <p>SeekEngine 1.2</p>
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 grid-flow-row-dense px-8 py-3">
                {/* Centered globe info */}
                <div className="flex justify-center items-center md:col-span-2 lg:col-span-1 lg:col-start-2 text-center">
                    <GlobeAltIcon className="h-5 mr-1 text-green-700" />
                    <span>Powered with Next.js & Google Search API by Gaurav Yadav</span>
                </div>

                {/* Report link */}
                <div className="flex justify-center space-x-8 whitespace-nowrap md:justify-self-start">
                    <a 
                        href="https://wa.link/7b3nnk"
                        className="link"
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
