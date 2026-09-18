export type ShippingArea = "DHAKA" | "OUTSIDE_DHAKA";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED"
    | "REFUNDED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type PaymentMethodType = "COD";

export interface OrderItemInput {
    productId: string;
    quantity: number;
}

export interface CreateOrderInput {
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    area: ShippingArea;
    items: OrderItemInput[];
    couponCode?: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    price: number;
    quantity: number;
    product?: {
        id: string;
        thumbnailImage: string;
    };
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    area: ShippingArea;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    couponDiscount: number;
    totalAmount: number;
    paymentMethod: PaymentMethodType;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    createdAt: string;
    updatedAt: string;
}
