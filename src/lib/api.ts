const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface FetchOptions extends RequestInit {
    revalidate?: number | false;
    tags?: string[];
}

// HTTP status সহ error — server page-এ "আসল 404" আর "সাময়িক backend error" আলাদা করার জন্য
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const NO_REFRESH_ENDPOINTS = [
    "/auth/login",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/refresh-token",
    "/auth/logout",
];

// ========================================
// Redirect to Login (loop-safe)
// ========================================

const redirectToLogin = (endpoint: string) => {
    if (typeof window === "undefined") return;

    // Login page-এ থাকলে redirect নয় (reload loop এড়াতে)
    if (window.location.pathname === "/login") return;

    // /auth/me-এর ব্যর্থতা AdminLayout নিজেই handle করে
    if (endpoint === "/auth/me") return;

    window.location.replace("/login");
};

// ========================================
// Refresh Access Token
// ========================================

const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
    })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
};

// ========================================
// Raw Fetch
// ========================================

const rawFetch = async (
    endpoint: string,
    options: FetchOptions = {},
): Promise<Response> => {
    const { revalidate, tags, ...fetchOptions } = options;
    const hasCache = revalidate !== undefined || (tags && tags.length > 0);

    // GET request-এ চিহ্ন: server (ISR) = isr, Admin panel = admin
    let finalEndpoint = endpoint;

    if (fetchOptions.method === "GET") {
        const isAdminPage =
            typeof window !== "undefined" &&
            window.location.pathname.startsWith("/admin");
        const src = hasCache ? "isr" : isAdminPage ? "admin" : null;

        if (src) {
            finalEndpoint += `${endpoint.includes("?") ? "&" : "?"}src=${src}`;
        }
    }

    return fetch(`${API_URL}${finalEndpoint}`, {
        ...fetchOptions,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
        },
        next: hasCache
            ? {
                  ...(revalidate !== undefined ? { revalidate } : {}),
                  ...(tags ? { tags } : {}),
              }
            : undefined,
        cache: hasCache ? undefined : "no-store",
    });
};
// ========================================
// API Fetch
// ========================================

const apiFetch = async <T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> => {
    let res = await rawFetch(endpoint, options);

    const isAuthEndpoint = NO_REFRESH_ENDPOINTS.some((path) =>
        endpoint.startsWith(path),
    );

    // 401 → Refresh Token
    if (res.status === 401 && !isAuthEndpoint) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            res = await rawFetch(endpoint, options);
        } else {
            redirectToLogin(endpoint);
            throw new ApiError("Session expired. Please log in again.", 401);
        }
    }

    // Error Handling
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({
            message: "Something went wrong",
        }));

        throw new ApiError(
            errorBody.message || `API error: ${res.status}`,
            res.status,
        );
    }

    // Success
    const json: ApiResponse<T> = await res.json();

    return json.data;
};

// ========================================
// FormData Fetch
// ========================================

const apiFetchForm = async <T>(
    endpoint: string,
    method: "POST" | "PATCH",
    formData: FormData,
): Promise<T> => {
    const doRequest = () =>
        fetch(`${API_URL}${endpoint}`, {
            method,
            credentials: "include",
            body: formData,
            cache: "no-store",
        });

    let res = await doRequest();

    // 401 → Refresh
    if (res.status === 401) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            res = await doRequest();
        } else {
            redirectToLogin(endpoint);
            throw new ApiError("Session expired. Please log in again.", 401);
        }
    }

    // Error
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({
            message: "Something went wrong",
        }));

        throw new ApiError(
            errorBody.message || `API error: ${res.status}`,
            res.status,
        );
    }

    // Success
    const json: ApiResponse<T> = await res.json();

    return json.data;
};

// ========================================
// API
// ========================================

export const api = {
    get: <T>(
        endpoint: string,
        opts?: number | { revalidate?: number | false; tags?: string[] },
    ) => {
        const o = typeof opts === "number" ? { revalidate: opts } : opts;
        return apiFetch<T>(endpoint, { method: "GET", ...o });
    },

    post: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    patch: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, {
            method: "PATCH",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string) =>
        apiFetch<T>(endpoint, {
            method: "DELETE",
        }),

    postForm: <T>(endpoint: string, formData: FormData) =>
        apiFetchForm<T>(endpoint, "POST", formData),

    patchForm: <T>(endpoint: string, formData: FormData) =>
        apiFetchForm<T>(endpoint, "PATCH", formData),
};
