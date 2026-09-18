import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
                {items.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-neutral-900"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-neutral-900">
                                {item.label}
                            </span>
                        )}
                    </span>
                ))}
            </nav>
        </>
    );
};

export default Breadcrumb;
