import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

function PaginationButtons() {
    const router = useRouter();
    const startIndex = Number(router.query.start) || 0;
    const term = router.query.term || "";

    const previousStart = startIndex - 10;
    const nextStart = startIndex + 10;

    return (
        <div className="flex justify-between items-center max-w-lg mx-auto text-blue-700 dark:text-blue-400 mt-8 mb-10">
            {/* Previous Button */}
            {startIndex >= 10 ? (
                <Link
                    href={`/search?term=${encodeURIComponent(term)}&start=${previousStart}`}
                    passHref
                >
                    <div
                        className="flex flex-col items-center cursor-pointer hover:underline transition-transform hover:scale-105"
                        aria-label="Go to previous page"
                        tabIndex={0}
                    >
                        <ChevronLeftIcon className="h-5" />
                        <p className="text-sm">Previous</p>
                    </div>
                </Link>
            ) : (
                <div
                    className="flex flex-col items-center opacity-40 cursor-not-allowed"
                    aria-disabled="true"
                >
                    <ChevronLeftIcon className="h-5" />
                    <p className="text-sm">Previous</p>
                </div>
            )}

            {/* Next Button */}
            <Link
                href={`/search?term=${encodeURIComponent(term)}&start=${nextStart}`}
                passHref
            >
                <div
                    className="flex flex-col items-center cursor-pointer hover:underline transition-transform hover:scale-105"
                    aria-label="Go to next page"
                    tabIndex={0}
                >
                    <ChevronRightIcon className="h-5" />
                    <p className="text-sm">Next</p>
                </div>
            </Link>
        </div>
    );
}

export default PaginationButtons;
