"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";

import type { Review } from "@/types/review";
import type { Product } from "@/types/product";

import StarRatingDisplay from "./StarRatingDisplay";

interface ReviewFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review: Review | null;
    products: Product[];
    onSuccess: () => void;
}

const ReviewFormDialog = ({
    open,
    onOpenChange,
    review,
    products,
    onSuccess,
}: ReviewFormDialogProps) => {
    const isEditMode = Boolean(review);

    const [productId, setProductId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    // Set form values when dialog opens
    useEffect(() => {
        if (open) {
            setProductId(review?.productId ?? "");
            setCustomerName(review?.customerName ?? "");

            const reviewRating = review?.rating ?? 5;

            // Ensure existing rating is between 0 and 5
            setRating(Math.min(Math.max(Number(reviewRating) || 0, 0), 5));

            setComment(review?.comment ?? "");
        }
    }, [open, review]);

    // Handle rating input
    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input while typing
        if (inputValue === "") {
            setRating(0);
            return;
        }

        const value = Number(inputValue);

        // Invalid number
        if (!Number.isFinite(value)) {
            return;
        }

        // Maximum rating = 5
        if (value > 5) {
            setRating(5);
            return;
        }

        // Minimum rating = 0
        if (value < 0) {
            setRating(0);
            return;
        }

        setRating(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Product validation
        if (!productId) {
            showToast.error("Please select a product");
            return;
        }

        // Customer name validation
        if (!customerName.trim()) {
            showToast.error("Customer name is required");
            return;
        }

        // Rating validation
        if (!Number.isFinite(rating)) {
            showToast.error("Please enter a valid rating");
            return;
        }

        if (rating < 0) {
            showToast.error("Rating cannot be less than 0");
            return;
        }

        if (rating > 5) {
            showToast.error("Rating cannot be greater than 5");
            return;
        }

        // Comment validation
        if (!comment.trim()) {
            showToast.error("Comment is required");
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && review) {
                await api.patch(`/review/${review.id}`, {
                    customerName: customerName.trim(),
                    rating,
                    comment: comment.trim(),
                });

                showToast.success("Review updated successfully");
            } else {
                await api.post("/review", {
                    productId,
                    customerName: customerName.trim(),
                    rating,
                    comment: comment.trim(),
                });

                showToast.success("Review added successfully");
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Review" : "Add Review"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product */}
                    <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>

                        <Select
                            items={products.map((p) => ({
                                label: p.name,
                                value: p.id,
                            }))}
                            value={productId}
                            onValueChange={(value) => setProductId(value ?? "")}
                            disabled={isEditMode}
                        >
                            <SelectTrigger id="product">
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>

                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name</Label>

                        <Input
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating (0 – 5)</Label>

                        <Input
                            id="rating"
                            type="number"
                            min={0}
                            max={5}
                            step={0.1}
                            value={rating}
                            onChange={handleRatingChange}
                            onBlur={() => {
                                // Final safety check
                                if (rating > 5) {
                                    setRating(5);
                                }

                                if (rating < 0) {
                                    setRating(0);
                                }
                            }}
                            required
                        />

                        <div className="flex items-center gap-2 pt-1">
                            <StarRatingDisplay rating={rating} size="md" />

                            <span className="text-sm text-neutral-500">
                                {Math.min(Math.max(rating || 0, 0), 5).toFixed(
                                    1,
                                )}
                            </span>
                        </div>

                        <p className="text-xs text-neutral-500">
                            Rating must be between 0 and 5.
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment</Label>

                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write customer review..."
                            rows={4}
                            required
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                  ? "Update"
                                  : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewFormDialog;
