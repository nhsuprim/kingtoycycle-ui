export type EventType =
    | "PAGE_VIEW"
    | "PRODUCT_VIEW"
    | "ADD_TO_CART"
    | "CHECKOUT_INITIATED"
    | "PURCHASE"
    | string; // ভবিষ্যতে নতুন event type যোগ হতে পারে, তাই string ও রাখা

export interface LogEventInput {
    eventType: EventType;
    sessionId?: string;
    phone?: string;
    productId?: string;
    page?: string;
    metadata?: Record<string, unknown>;
}
