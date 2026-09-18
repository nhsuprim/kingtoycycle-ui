export interface Review {
    id: string;
    productId: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    product?: {
        id: string;
        name: string;
        thumbnailImage: string;
    };
}

export interface CreateReviewInput {
    productId: string;
    customerName: string;
    rating: number;
    comment: string;
}
