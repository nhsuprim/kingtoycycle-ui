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
    revalidate?: number;
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
    const { revalidate, ...fetchOptions } = options;

    return fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,

        credentials: "include",

        headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
        },

        next: revalidate !== undefined ? { revalidate } : undefined,

        cache: revalidate !== undefined ? undefined : "no-store",
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

    // ========================================
    // 401 → Refresh Token
    // ========================================

    if (res.status === 401 && !isAuthEndpoint) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            res = await rawFetch(endpoint, options);
        } else {
            if (typeof window !== "undefined") {
                window.location.replace("/login");
            }

            throw new Error("Session expired. Please log in again.");
        }
    }

    // ========================================
    // Error Handling
    // ========================================

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({
            message: "Something went wrong",
        }));

        throw new Error(errorBody.message || `API error: ${res.status}`);
    }

    // ========================================
    // Success
    // ========================================

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

    // ========================================
    // 401 → Refresh
    // ========================================

    if (res.status === 401) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            res = await doRequest();
        } else {
            if (typeof window !== "undefined") {
                window.location.replace("/login");
            }

            throw new Error("Session expired. Please log in again.");
        }
    }

    // ========================================
    // Error
    // ========================================

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({
            message: "Something went wrong",
        }));

        throw new Error(errorBody.message || `API error: ${res.status}`);
    }

    // ========================================
    // Success
    // ========================================

    const json: ApiResponse<T> = await res.json();

    return json.data;
};

// ========================================
// API
// ========================================

export const api = {
    get: <T>(endpoint: string, revalidate?: number) =>
        apiFetch<T>(endpoint, {
            method: "GET",
            revalidate,
        }),

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
