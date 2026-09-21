export interface Category {
    id: string;
    name: string;
    image?: string;
    bannerimage?: string;
    slug: string;
    description?: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updatedAt: string;
}
