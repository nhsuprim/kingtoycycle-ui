import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE_NAME, SITE_PHONE } from "@/lib/constants";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ImageGallery from "@/components/product/ImageGallery";
import AddToCartSection from "@/components/product/AddToCartSection";
import ProductReviews from "@/components/product/ProductReviews";
import TrackProductView from "@/components/product/TrackProductView";
import StarRatingDisplay from "@/components/admin/review/StarRatingDisplay";
import { Separator } from "@/components/ui/separator";
import { Phone, MessageCircle } from "lucide-react";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

const getProduct = async (id: string): Promise<Product | null> => {
    try {
        return await api.get<Product>(`/product/${id}`, 60); // ISR — ১ মিনিট revalidate
    } catch {
        return null;
    }
};

const getReviews = async (productId: string): Promise<Review[]> => {
    try {
        return await api.get<Review[]>(`/review/product/${productId}`, 60);
    } catch {
        return [];
    }
};

export const generateMetadata = async ({
    params,
}: ProductPageProps): Promise<Metadata> => {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return { title: "Product Not Found" };
    }

    const price = product.discountPrice ?? product.regularPrice;

    return {
        title: product.name,
        description: product.description.slice(0, 160),
        alternates: { canonical: `/products/${id}` },
        openGraph: {
            title: product.name,
            description: product.description.slice(0, 160),
            images: [product.thumbnailImage],
        },
        other: {
            "product:price:amount": String(price),
            "product:price:currency": "BDT",
        },
    };
};

const ProductPage = async ({ params }: ProductPageProps) => {
    const { id } = await params;
    const [product, reviews] = await Promise.all([
        getProduct(id),
        getReviews(id),
    ]);

    if (!product) {
        notFound();
    }

    const allImages = [product.thumbnailImage, ...product.images];
    const hasDiscount = Boolean(product.discountPrice);
    const discountPercent = hasDiscount
        ? Math.round(
              ((product.regularPrice - product.discountPrice!) /
                  product.regularPrice) *
                  100,
          )
        : 0;

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        ...(product.category
            ? [
                  {
                      label: product.category.name,
                      href: `/category/${product.category.slug}`,
                  },
              ]
            : []),
        { label: product.name },
    ];

    // JSON-LD structured data — Google rich snippet (price, rating, availability)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: allImages,
        sku: product.sku,
        brand: product.brand
            ? { "@type": "Brand", name: product.brand }
            : undefined,
        offers: {
            "@type": "Offer",
            priceCurrency: "BDT",
            price: product.discountPrice ?? product.regularPrice,
            availability:
                product.stockStatus === "IN_STOCK"
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
        },
        ...(product.reviewCount > 0
            ? {
                  aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: product.averageRating,
                      reviewCount: product.reviewCount,
                  },
              }
            : {}),
    };

    const productUrl = `${process.env.NEXT_PUBLIC_UI_URL}/products/${product.id}`;
    const message = `আমি এই product টি অর্ডার করতে চাই:\n🛍️ ${product.name}\n🔗 Link: ${productUrl}`;
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUM}?text=${encodeURIComponent(message)}`;
    const messengerUrl = `https://m.me/${process.env.NEXT_PUBLIC_FB_PAGE_USERNAME}?text=${encodeURIComponent(message)}`;

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TrackProductView
                productId={product.id}
                productName={product.name}
                value={product.discountPrice ?? product.regularPrice}
            />

            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ImageGallery images={allImages} productName={product.name} />

                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                        {product.name}
                    </h1>

                    <div className="mt-3 rounded-lg border bg-neutral-50 p-3 text-sm text-neutral-600">
                        <p>
                            <span className="text-neutral-400">Category:</span>{" "}
                            {product.category?.name ?? "—"}
                        </p>
                        <p>
                            <span className="text-neutral-400">SKU:</span>{" "}
                            {product.sku}
                        </p>
                        {product.brand && (
                            <p>
                                <span className="text-neutral-400">Brand:</span>{" "}
                                {product.brand}
                            </p>
                        )}
                        <p>
                            <span className="text-neutral-400">Sold by:</span>{" "}
                            {SITE_NAME}
                        </p>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-neutral-900">
                            Tk{" "}
                            {(
                                product.discountPrice ?? product.regularPrice
                            ).toLocaleString()}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="text-base text-neutral-400 line-through">
                                    Tk {product.regularPrice.toLocaleString()}
                                </span>
                                <span className="text-sm font-medium text-blue-600">
                                    {discountPercent}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {product.reviewCount > 0 && (
                        <Link
                            href="#reviews"
                            className="mt-2 flex items-center gap-2"
                        >
                            <StarRatingDisplay
                                rating={product.averageRating}
                                size="md"
                            />
                            <span className="text-sm text-neutral-500">
                                {product.reviewCount} Review
                                {product.reviewCount > 1 ? "s" : ""}
                            </span>
                        </Link>
                    )}

                    <Separator className="my-4" />

                    <AddToCartSection product={product} />

                    {/* ekhane ekta buy now button dew jetay click korle sorasori check oi product er order page e niye jabe. check out page e product er id, name, price, quantity pass hobe. */}

                    <Separator className="my-4" />

                    <Link
                        href={`tel:${SITE_PHONE}`}
                        className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
                    >
                        <Phone className="h-4 w-4" />
                        Call For Order: {SITE_PHONE}
                    </Link>
                    <div className="w-full text-white text-center text-lg rounded-lg font-semibold mt-16">
                        <Link
                            href={messengerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="bg-blue-600 py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors mb-4">
                                <MessageCircle className="h-6 w-6" />
                                Messenger এ অর্ডার করুন
                            </div>
                        </Link>

                        <Link
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="bg-green-600 py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-green-700 transition-colors">
                                <MessageCircle className="h-6 w-6" />
                                WhatsApp এ অর্ডার করুন
                            </div>
                        </Link>
                    </div>
                    <div className="p-2 my-2 text-center text-sm md:text-lg bg-orange-400 text-white font-semibold italic rounded-lg animate__animated animate__backInRight animate__slow">
                        <h1>
                            অর্ডার করার ২-৩ দিনের মধ্যে পণ্য ডেলিভারি সম্পন্ন
                            করা হয়।
                        </h1>
                    </div>
                </div>
            </div>

            <Separator className="my-8" />

            <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                    Description
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                    {product.description}
                </p>
            </div>

            <Separator className="my-6" />

            <ProductReviews reviews={reviews} />
        </div>
    );
};

export default ProductPage;
