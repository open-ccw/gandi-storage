import { vi } from 'vitest';
import { TextEncoder } from 'util';
import knownAssets from './fixtures/known-assets';

const successText = 'successful response';

/**
 * @typedef {Object} MockFetchResponse
 * @property {boolean} ok
 * @property {number} status
 * @property {() => Promise<string>} [text]
 * @property {() => Promise<Uint8Array>} [arrayBuffer]
 */

/**
 * @typedef {RequestInit & {mockFetchTestData?: MockFetchTestData}} MockFetchRequestInit
 */

/**
 * @typedef {Object} MockFetchTestData
 * @property {Headers} [headers]
 * @property {number} [headersCount]
 */

/**
 * Mock the global 'fetch' method.
 * @param {RequestInfo|URL} resource
 * @param {MockFetchRequestInit} [options]
 * @returns {Promise<MockFetchResponse>}
 */
const mockFetch = (resource: RequestInfo | URL, options?: any) => {
    const results: any = {
        ok: false,
        status: 0
    };
    if (options?.mockFetchTestData) {
        options.mockFetchTestData.headers = new Headers(options.headers);
        options.mockFetchTestData.headersCount = Array.from(options.mockFetchTestData.headers).length;
    }

    const assetInfo = knownAssets[resource as string];
    if (assetInfo) {
        results.ok = true;
        results.status = 200;
        results.arrayBuffer = () => Promise.resolve(assetInfo.content);
    } else {
        switch (resource) {
        case '200':
            results.ok = true;
            results.status = 200;
            results.text = () => Promise.resolve(successText);
            results.arrayBuffer = () => Promise.resolve(new TextEncoder().encode(successText));
            break;
        case '404':
            results.ok = false;
            results.status = 404;
            break;
        case '500':
            results.ok = false;
            results.status = 500;
            break;
        default:
            throw new Error(`mockFetch doesn't know how to download: ${resource}`);
        }
    }
    return Promise.resolve(results);
};

// Stub global fetch with our mock
vi.stubGlobal('fetch', vi.fn(mockFetch));

export {successText, mockFetch};
