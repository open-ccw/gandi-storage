import FetchWorkerTool from './FetchWorkerTool';
import FetchTool from './FetchTool';

interface RequestConfig {
    url: string;
    body?: any;
    method?: string;
    withCredentials?: boolean;
    [key: string]: any;
}

interface Tool {
    isGetSupported: boolean;
    get: (reqConfig: RequestConfig) => Promise<Uint8Array | null>;
    isSendSupported: boolean;
    send: (reqConfig: RequestConfig) => Promise<any>;
}

/**
 * Get and send assets with other tools in sequence.
 */
class ProxyTool {
    /** @type {Tool[]} */
    tools: Tool[];

    constructor (filter: string = ProxyTool.TOOL_FILTER.ALL) {
        let tools: Tool[];
        if (filter === ProxyTool.TOOL_FILTER.READY) {
            tools = [new FetchTool()];
        } else {
            tools = [new FetchWorkerTool() as unknown as Tool, new FetchTool()];
        }

        /**
         * Sequence of tools to proxy.
         * @type {Array.<Tool>}
         */
        this.tools = tools;
    }

    /**
     * Is get supported? false if all proxied tool return false.
     * @returns {boolean} Is get supported?
     */
    get isGetSupported (): boolean {
        return this.tools.some(tool => tool.isGetSupported);
    }

    /**
     * Request data from with one of the proxied tools.
     * @param {RequestConfig} reqConfig - Request configuration for data to get.
     * @returns {Promise.<Uint8Array>} Resolve to Buffer of data from server.
     */
    get (reqConfig: RequestConfig): Promise<Uint8Array | null> {
        let toolIndex = 0;
        const nextTool = (err?: any): Promise<Uint8Array | null> => {
            const tool = this.tools[toolIndex++];
            if (!tool) {
                throw err;
            }
            if (!tool.isGetSupported) {
                return nextTool(err);
            }
            return tool.get(reqConfig).catch(nextTool);
        };
        return nextTool();
    }

    /**
     * Is sending supported? false if all proxied tool return false.
     * @returns {boolean} Is sending supported?
     */
    get isSendSupported (): boolean {
        return this.tools.some(tool => tool.isSendSupported);
    }

    /**
     * Send data to a server with one of the proxied tools.
     * @param {RequestConfig} reqConfig - Request configuration for data to send.
     * @returns {Promise.<Uint8Array|string|object>} Server returned metadata.
     */
    send (reqConfig: RequestConfig): Promise<any> {
        let toolIndex = 0;
        const nextTool = (err?: any): Promise<any> => {
            const tool = this.tools[toolIndex++];
            if (!tool) {
                throw err;
            }
            if (!tool.isSendSupported) {
                return nextTool(err);
            }
            return tool.send(reqConfig).catch(nextTool);
        };
        return nextTool();
    }

    /**
     * Constant values that filter the set of tools in a ProxyTool instance.
     * @enum {string}
     */
    static TOOL_FILTER = {
        /**
         * Use all tools.
         */
        ALL: 'all',

        /**
         * Use tools that are ready right now.
         */
        READY: 'ready'
    };
}

export default ProxyTool;