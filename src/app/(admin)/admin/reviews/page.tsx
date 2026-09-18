"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Review } from "@/types/review";
import type { Product } from "@/types/product";
import StarRatingDisplay from "@/components/admin/review/StarRatingDisplay";
import ReviewFormDialog from "@/components/admin/review/ReviewFormDialog";
import DeleteReviewDialog from "@/components/admin/review/DeleteReviewDialog";

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Review[]>("/review");
            setReviews(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load reviews",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.get<Product[]>("/product");
                setProducts(data);
            } catch {
                // silently skip
            }
        };
        fetchProducts();
    }, []);

    const handleAddClick = () => {
        setSelectedReview(null);
        setFormOpen(true);
    };

    const handleEditClick = (review: Review) => {
        setSelectedReview(review);
        setFormOpen(true);
    };

    const handleDeleteClick = (review: Review) => {
        setSelectedReview(review);
        setDeleteOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl">Reviews</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage product reviews shown to customers.
                    </p>
                </div>
                <Button
                    onClick={handleAddClick}
                    className="w-full gap-2 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Add Review
                </Button>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
                {loading ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        Loading...
                    </p>
                ) : reviews.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        No reviews yet. Add your first one.
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-lg border bg-white p-4"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    {review.product?.thumbnailImage && (
                                        <Image
                                            src={review.product.thumbnailImage}
                                            alt={review.product.name}
                                            width={40}
                                            height={40}
                                            className="shrink-0 rounded-md border object-cover"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-neutral-500">
                                            {review.product?.name}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <p className="font-medium">
                                                {review.customerName}
                                            </p>
                                            <StarRatingDisplay
                                                rating={review.rating}
                                            />
                                        </div>
                                        <p className="mt-1 text-sm text-neutral-600">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditClick(review)}
                                        aria-label="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleDeleteClick(review)
                                        }
                                        aria-label="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ReviewFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                review={selectedReview}
                products={products}
                onSuccess={fetchReviews}
            />

            <DeleteReviewDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                review={selectedReview}
                onSuccess={fetchReviews}
            />
        </div>
    );
};

export default ReviewsPage;
