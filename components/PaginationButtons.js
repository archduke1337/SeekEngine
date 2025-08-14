import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function PaginationButtons() {
    const router = useRouter();
    const startIndex = Number(router.query.start) || 0;
    const term = router.query.term || "";

    const previousStart = startIndex - 10;
    const nextStart = startIndex + 10;

    return (
        <div className="flex justify-between items-center max-w-lg mx-auto mt-8 mb-10">
            {/* Previous Button */}
            {startIndex >= 10 ? (
                <Link
                    href={`/search?term=${encodeURIComponent(term)}&start=${previousStart}`}
                    passHref
                >
                    <div
                        className="glass flex items-center px-6 py-3 cursor-pointer hover:bg-[var(--accent)] transition-all duration-200"
                        aria-label="Go to previous page"
                        tabIndex={0}
                    >
                        <ChevronLeftIcon className="h-5 w-5 text-[var(--primary)] mr-2" />
                        <p className="text-sm text-[var(--text-primary)]">Previous</p>
                    </div>
                </Link>
            ) : (
                <div
                    className="glass flex items-center px-6 py-3 opacity-40 cursor-not-allowed"
                    aria-disabled="true"
                >
                    <ChevronLeftIcon className="h-5 w-5 text-[var(--text-secondary)] mr-2" />
                    <p className="text-sm text-[var(--text-secondary)]">Previous</p>
                </div>
            )}

            {/* Next Button */}
            <Link
                href={`/search?term=${encodeURIComponent(term)}&start=${nextStart}`}
                passHref
            >
                <div
                    className="glass flex items-center px-6 py-3 cursor-pointer hover:bg-[var(--accent)] transition-all duration-200"
                    aria-label="Go to next page"
                    tabIndex={0}
                >
                    <p className="text-sm text-[var(--text-primary)] mr-2">Next</p>
                    <ChevronRightIcon className="h-5 w-5 text-[var(--primary)]" />
                </div>
            </Link>
        </div>
    );
}

export default PaginationButtons;
