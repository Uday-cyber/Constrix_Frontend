import { API_BASE_URL } from "./api";

const getAuthHeaders = (headers = {}) => {
    const token = localStorage.getItem("accessToken");
    return {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.message || "Session expired");
    }

    const nextAccessToken = data?.data?.accessToken || "";
    const nextRefreshToken = data?.data?.refreshToken || refreshToken || "";

    if (nextAccessToken) {
        localStorage.setItem("accessToken", nextAccessToken);
    }
    if (nextRefreshToken) {
        localStorage.setItem("refreshToken", nextRefreshToken);
    }

    return nextAccessToken;
};

export const authFetch = async (url, options = {}) => {
    const { timeoutMs = 15000, ...fetchOptions } = options;

    const makeRequest = async () => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(url, {
                ...fetchOptions,
                credentials: "include",
                signal: controller.signal,
                headers: getAuthHeaders(fetchOptions.headers || {}),
            });
        } finally {
            window.clearTimeout(timer);
        }
    };

    let response = await makeRequest();

    if (response.status !== 401) {
        return response;
    }

    await refreshAccessToken();
    response = await makeRequest();
    return response;
};
