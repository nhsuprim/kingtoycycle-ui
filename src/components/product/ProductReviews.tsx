import StarRatingDisplay from "@/components/admin/review/StarRatingDisplay";
import type { Review } from "@/types/review";

interface ProductReviewsProps {
    reviews: Review[];
}

const ProductReviews = ({ reviews }: ProductReviewsProps) => {
    if (reviews.length === 0) {
        return (
            <div id="reviews" className="py-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                    Reviews
                </h2>
                <p className="mt-2 text-sm text-neutral-500">
                    No reviews yet for this product.
                </p>
            </div>
        );
    }

    return (
        <div id="reviews" className="py-6">
            <h2 className="text-lg font-semibold text-neutral-900">
                Reviews ({reviews.length})
            </h2>
            <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="border-b pb-4 last:border-0"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900">
                                {review.customerName}
                            </span>
                            <StarRatingDisplay rating={review.rating} />
                        </div>
                        <p className="mt-1 text-sm text-neutral-600">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductReviews;
