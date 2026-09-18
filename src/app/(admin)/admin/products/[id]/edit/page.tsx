"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Product } from "@/types/product";
import ProductForm from "@/components/admin/product/ProductForm";

const EditProductPage = () => {
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await api.get<Product>(`/product/${id}`);
                setProduct(data);
            } catch (err) {
                showToast.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return <p className="text-neutral-500">Loading...</p>;
    }

    if (!product) {
        return <p className="text-red-600">Product not found</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="mt-1 text-sm text-neutral-500">
                Update product details.
            </p>

            <div className="mt-6">
                <ProductForm product={product} />
            </div>
        </div>
    );
};

export default EditProductPage;
