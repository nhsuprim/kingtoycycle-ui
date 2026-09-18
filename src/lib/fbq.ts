declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

export const fbTrack = (
    eventName: string,
    params?: Record<string, unknown>,
    eventID?: string,
) => {
    if (typeof window === "undefined" || typeof window.fbq !== "function")
        return;

    if (eventID) {
        window.fbq("track", eventName, params, { eventID });
    } else {
        window.fbq("track", eventName, params);
    }
};
