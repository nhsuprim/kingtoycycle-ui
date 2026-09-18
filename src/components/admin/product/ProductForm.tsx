"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";

import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

interface ProductFormProps {
    product?: Product;
}

interface PreviewImage {
    file: File;
    url: string;
}

const ProductForm = ({ product }: ProductFormProps) => {
    const router = useRouter();

    const isEditMode = Boolean(product);

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [name, setName] = useState(product?.name ?? "");
    const [description, setDescription] = useState(product?.description ?? "");
    const [sku, setSku] = useState(product?.sku ?? "");
    const [color, setColor] = useState(product?.color ?? "");
    const [brand, setBrand] = useState(product?.brand ?? "");

    const [regularPrice, setRegularPrice] = useState(
        product?.regularPrice?.toString() ?? "",
    );

    const [discountPrice, setDiscountPrice] = useState(
        product?.discountPrice?.toString() ?? "",
    );

    const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");

    const [featured, setFeatured] = useState(product?.featured ?? false);

    // Thumbnail
    const [thumbnailPreview, setThumbnailPreview] =
        useState<PreviewImage | null>(null);

    // Gallery
    const [galleryPreviews, setGalleryPreviews] = useState<PreviewImage[]>([]);

    // =========================================================
    // Fetch Categories
    // =========================================================

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<Category[]>("/category");

                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories:", err);

                showToast.error("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);

    // =========================================================
    // Cleanup Object URLs
    // =========================================================

    useEffect(() => {
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview.url);
            }

            galleryPreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [thumbnailPreview, galleryPreviews]);

    // =========================================================
    // Thumbnail Select
    // =========================================================

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Remove previous preview URL
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview.url);
        }

        const previewUrl = URL.createObjectURL(file);

        setThumbnailPreview({
            file,
            url: previewUrl,
        });

        // Same file আবার select করলেও change event fire করবে
        e.target.value = "";
    };

    // =========================================================
    // Remove Thumbnail
    // =========================================================

    const handleRemoveThumbnail = () => {
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview.url);
        }

        setThumbnailPreview(null);
    };

    // =========================================================
    // Gallery Select
    // =========================================================

    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);

        if (files.length === 0) return;

        const newPreviews: PreviewImage[] = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setGalleryPreviews((prev) => [...prev, ...newPreviews]);

        // Same file আবার select করার সুযোগ
        e.target.value = "";
    };

    // =========================================================
    // Remove Gallery Image
    // =========================================================

    const handleRemoveGalleryImage = (index: number) => {
        setGalleryPreviews((prev) => {
            const imageToRemove = prev[index];

            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url);
            }

            return prev.filter((_, i) => i !== index);
        });
    };

    // =========================================================
    // Submit
    // =========================================================

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Category validation
        if (!categoryId) {
            showToast.error("Please select a category");
            return;
        }

        // Thumbnail required only for create
        if (!isEditMode && !thumbnailPreview) {
            showToast.error("Thumbnail image is required");
            return;
        }

        // Price validation
        const regularPriceNumber = Number(regularPrice);

        const discountPriceNumber = discountPrice
            ? Number(discountPrice)
            : undefined;

        if (
            !regularPrice ||
            Number.isNaN(regularPriceNumber) ||
            regularPriceNumber < 0
        ) {
            showToast.error("Please enter a valid regular price");
            return;
        }

        if (
            discountPriceNumber !== undefined &&
            (Number.isNaN(discountPriceNumber) || discountPriceNumber < 0)
        ) {
            showToast.error("Please enter a valid discount price");
            return;
        }

        setLoading(true);

        try {
            const payload: Record<string, unknown> = {
                name,
                description,
                sku,
                color,
                brand: brand || undefined,
                regularPrice: regularPriceNumber,
                discountPrice: discountPriceNumber,
                categoryId,
                featured,
            };

            const formData = new FormData();

            // JSON data
            formData.append("data", JSON.stringify(payload));

            // Thumbnail
            if (thumbnailPreview) {
                formData.append("thumbnail", thumbnailPreview.file);
            }

            // Gallery images
            galleryPreviews.forEach((preview) => {
                formData.append("images", preview.file);
            });

            // =====================================================
            // Update
            // =====================================================

            if (isEditMode && product) {
                await api.patchForm(`/product/${product.id}`, formData);

                showToast.success("Product updated successfully");
            }

            // =====================================================
            // Create
            // =====================================================
            else {
                await api.postForm("/product", formData);

                showToast.success("Product added successfully");
            }

            // Redirect
            router.push("/admin/products");
        } catch (err) {
            console.error("Product submit error:", err);

            showToast.error(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
            {/* =====================================================
                Basic Information
            ====================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Product Name */}
                <div className="col-span-1 space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Product Name</Label>

                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Description */}
                <div className="col-span-1 space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>

                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                    />
                </div>

                {/* SKU */}
                <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>

                    <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        required
                    />
                </div>

                {/* Color */}
                <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>

                    <Input
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        required
                    />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                    <Label htmlFor="brand">Brand (optional)</Label>

                    <Input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    />
                </div>

                {/* =================================================
                    Category
                ================================================== */}

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>

                    <Select
                        items={categories.map((cat) => ({
                            label: cat.name,
                            value: cat.id,
                        }))}
                        value={categoryId}
                        onValueChange={(value) => {
                            // IMPORTANT:
                            // Select can return string | null
                            setCategoryId(value ?? "");
                        }}
                    >
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>

                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* =================================================
                    Regular Price
                ================================================== */}

                <div className="space-y-2">
                    <Label htmlFor="regularPrice">Regular Price (৳)</Label>

                    <Input
                        id="regularPrice"
                        type="number"
                        min={0}
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        required
                    />
                </div>

                {/* =================================================
                    Discount Price
                ================================================== */}

                <div className="space-y-2">
                    <Label htmlFor="discountPrice">
                        Discount Price (৳, optional)
                    </Label>

                    <Input
                        id="discountPrice"
                        type="number"
                        min={0}
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                    />
                </div>

                {/* =================================================
                    Featured
                ================================================== */}

                <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                    <Checkbox
                        id="featured"
                        checked={featured}
                        onCheckedChange={(checked) => {
                            setFeatured(checked === true);
                        }}
                    />

                    <Label
                        htmlFor="featured"
                        className="cursor-pointer font-normal"
                    >
                        Mark as featured product
                    </Label>
                </div>

                {/* =================================================
                    Thumbnail
                ================================================== */}

                <div className="col-span-1 space-y-2 sm:col-span-2">
                    <Label htmlFor="thumbnail">
                        Thumbnail Image{" "}
                        {isEditMode && "(leave empty to keep current)"}
                    </Label>

                    {/* Existing Thumbnail */}
                    {!thumbnailPreview &&
                        isEditMode &&
                        product?.thumbnailImage && (
                            <div className="mb-2">
                                <Image
                                    src={product.thumbnailImage}
                                    alt={product.name}
                                    width={80}
                                    height={80}
                                    className="rounded-md border object-cover"
                                />
                            </div>
                        )}

                    {/* New Thumbnail Preview */}
                    {thumbnailPreview && (
                        <div className="relative inline-block">
                            <img
                                src={thumbnailPreview.url}
                                alt="Thumbnail preview"
                                className="h-20 w-20 rounded-md border object-cover"
                            />

                            <button
                                type="button"
                                onClick={handleRemoveThumbnail}
                                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                                aria-label="Remove thumbnail"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                    />
                </div>

                {/* =================================================
                    Gallery Images
                ================================================== */}

                <div className="col-span-1 space-y-2 sm:col-span-2">
                    <Label htmlFor="gallery">
                        Gallery Images{" "}
                        {isEditMode &&
                            "(uploading new files replaces all existing)"}
                    </Label>

                    {/* Existing Gallery */}
                    {galleryPreviews.length === 0 &&
                        isEditMode &&
                        product?.images &&
                        product.images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.images.map((img, index) => (
                                    <Image
                                        key={`${img}-${index}`}
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        width={60}
                                        height={60}
                                        className="rounded-md border object-cover"
                                    />
                                ))}
                            </div>
                        )}

                    {/* New Gallery Preview */}
                    {galleryPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {galleryPreviews.map((preview, index) => (
                                <div
                                    key={preview.url}
                                    className="relative inline-block"
                                >
                                    <img
                                        src={preview.url}
                                        alt={`New gallery ${index + 1}`}
                                        className="h-16 w-16 rounded-md border object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveGalleryImage(index)
                                        }
                                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                                        aria-label={`Remove gallery image ${
                                            index + 1
                                        }`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Input
                        id="gallery"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGallerySelect}
                    />
                </div>
            </div>

            {/* =====================================================
                Actions
            ====================================================== */}

            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/products")}
                    disabled={loading}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                    {loading
                        ? "Saving..."
                        : isEditMode
                          ? "Update Product"
                          : "Add Product"}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
