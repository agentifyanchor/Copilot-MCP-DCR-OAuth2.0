import { TokenCredential } from "@azure/identity";

type AuthenticatedApiClientOptions = {
    scopes: string[];
    tokenCredential: TokenCredential;
};

export default class AuthenticatedApiClient {
    private baseUrl: string;
    private token: string;
    #options: AuthenticatedApiClientOptions | undefined;
    #requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    constructor(baseUrl: string, options: AuthenticatedApiClientOptions, token: string) {
        this.baseUrl = baseUrl;
        this.token = token;
        if (options) {
            this.#options = options;
        }
    }

    async #obtainAccessToken(): Promise<void> {
        const accessToken = await this.#options?.tokenCredential?.getToken(this.#options.scopes || []);
        if (this.#options?.tokenCredential && !accessToken) {
            throw new Error('No authentication token available');
        }
        this.#requestHeaders['Authorization'] = `Bearer ${accessToken?.token}`;
    }

    async get<T>(endpoint: string): Promise<T> {
        try {
            await this.#obtainAccessToken();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this.#requestHeaders,
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            return response.json();
        } catch (error: any) {
            console.error('Error making GET request:', error);
            throw error;
        }
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        try {
            await this.#obtainAccessToken();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.#requestHeaders,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`API call failed to ${endpoint}: ${response.status} ${response.statusText}`);
            }

            return response.json();
        } catch (error: any) {
            console.error('Error making POST request:', error);
            throw error;
        }
    }

    async patch<T>(endpoint: string, data: any): Promise<T> {
        try {
            await this.#obtainAccessToken();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PATCH',
                headers: this.#requestHeaders,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`API call failed to ${endpoint}: ${response.status} ${response.statusText}`);
            }

            // PATCH requests might return 204 No Content
            if (response.status === 204) {
                return {} as T;
            }

            return response.json();
        } catch (error: any) {
            console.error('Error making PATCH request:', error);
            throw error;
        }
    }

    async getCurrentUser(): Promise<any> {
        const response = await this.get<any>('/v1.0/me');
        return response?.value;
    }
}
