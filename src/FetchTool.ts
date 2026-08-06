import { scratchFetch } from './scratchFetch';

interface RequestConfig {
    url: string;
    withCredentials?: boolean;
    [key: string]: any;
}

/**
 * Get and send assets with the fetch standard web api.
 */
class FetchTool {
    /**
     * Is get supported?
     * Always true for `FetchTool` because `scratchFetch` ponyfills `fetch` if necessary.
     * @returns {boolean} Is get supported?
     */
    get isGetSupported (): boolean {
        return true;
    }

    /**
     * Request data from a server with fetch.
     * @param {RequestConfig} reqConfig - Request configuration for data to get.
     * @returns {Promise.<Uint8Array?>} Resolve to Buffer of data from server.
     */
    get ({url, ...options}: RequestConfig): Promise<Uint8Array | null> {
        return scratchFetch(url, Object.assign({method: 'GET'} as RequestInit, options))
            .then(result => {
                if (result.ok) return result.arrayBuffer().then(b => new Uint8Array(b));
                if (result.status === 404) return null;
                return Promise.reject(result.status); // TODO: we should throw a proper error
            });
    }

    /**
     * Is sending supported?
     * Always true for `FetchTool` because `scratchFetch` ponyfills `fetch` if necessary.
     * @returns {boolean} Is sending supported?
     */
    get isSendSupported (): boolean {
        return true;
    }

    /**
     * Send data to a server with fetch.
     * @param {RequestConfig} reqConfig - Request configuration for data to send.
     * @returns {Promise.<string>} Server returned metadata.
     */
    send ({url, withCredentials = false, ...options}: RequestConfig): Promise<string> {
        return scratchFetch(url, Object.assign({
            credentials: withCredentials ? 'include' as RequestCredentials : 'omit' as RequestCredentials
        } as RequestInit, options))
            .then(response => {
                if (response.ok) return response.text();
                return Promise.reject(response.status);
            });
    }
}

export default FetchTool;