import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

function PaginationButtons() {
    const router = useRouter();
    const startIndex = Number(router.query.start) || 0;
    const term = router.query.term || "";

    return (
        <div className="flex justify-between items-center max-w-lg mx-auto text-blue-700 dark:text-blue-400 mt-5 mb-10">
            {startIndex >= 10 ? (
                <Link href={`/search?term=${encodeURIComponent(term)}&start=${startIndex - 10}`} passHref>
                    <div className="flex flex-col items-center cursor-pointer hover:underline transition">
                        <ChevronLeftIcon className="h-5" />
                        <p>Previous</p>
                    </div>
                </Link>
            ) : (
                <div className="flex flex-col items-center opacity-50 cursor-not-allowed">
                    <ChevronLeftIcon className="h-5" />
                    <p>Previous</p>
                </div>
            )}

            <Link href={`/search?term=${encodeURIComponent(term)}&start=${startIndex + 10}`} passHref>
                <div className="flex flex-col items-center cursor-pointer hover:underline transition">
                    <ChevronRightIcon className="h-5" />
                    <p>Next</p>
                </div>
            </Link>
        </div>
    );
}

export default PaginationButtons;
