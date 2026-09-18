import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

const NotFound = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <h1 className="text-6xl font-bold text-neutral-900">404</h1>
            <p className="mt-2 text-lg font-medium text-neutral-700">
                Page Not Found
            </p>
            <p className="mt-1 text-sm text-neutral-500">
                The page you&apos;re looking for doesn&apos;t exist on{" "}
                {SITE_NAME}.
            </p>
            <Link href="/" className="mt-6">
                <Button>Back to Home</Button>
            </Link>
        </div>
    );
};

export default NotFound;
