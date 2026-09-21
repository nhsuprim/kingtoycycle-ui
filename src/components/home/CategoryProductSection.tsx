import Image from "next/image";
import Link from "next/link";
import ProductCardSlider from "@/components/product/ProductCardSlider";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryProductSectionProps {
    category: Category;
    products: Product[];
}

const CategoryProductSection = ({
    category,
    products,
}: CategoryProductSectionProps) => {
    if (products.length === 0) return null;

    return (
        <section className="py-4">
            {category.bannerimage && (
                <Link href={`/category/${category.slug}`} className="block">
                    <div className="relative mx-auto w-full bg-neutral-100 sm:rounded-lg">
                        <Image
                            src={category.bannerimage}
                            alt={category.name}
                            width={2000}
                            height={500}
                            className="h-auto w-full object-contain"
                            sizes="100vw"
                        />
                    </div>
                </Link>
            )}

            <div className="mx-auto mt-4 flex max-w-7xl items-center justify-center gap-3 px-4 text-center">
                <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
                    {category.name}
                </h2>
                <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                >
                    View All →
                </Link>
            </div>

            <ProductCardSlider products={products} />
        </section>
    );
};

export default CategoryProductSection;
