import ProductForm from "@/components/admin/product/ProductForm";

const NewProductPage = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold">Add Product</h1>
            <p className="mt-1 text-sm text-neutral-500">
                Create a new product listing.
            </p>

            <div className="mt-6">
                <ProductForm />
            </div>
        </div>
    );
};

export default NewProductPage;
