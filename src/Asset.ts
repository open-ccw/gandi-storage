import md5 from 'js-md5';
import type {AssetType} from './AssetType';
import type {DataFormat} from './DataFormat';

const memoizedToString = (function () {
    /**
     * The maximum length of a chunk before encoding it into base64.
     *
     * 32766 is a multiple of 3 so btoa does not need to use padding characters
     * except for the final chunk where that is fine. 32766 is also close to
     * 32768 so it is close to a size an memory allocator would prefer.
     * @const {number}
     */
    const BTOA_CHUNK_MAX_LENGTH = 32766;

    /**
     * An array cache of bytes to characters.
     * @const {?Array.<string>}
     */
    let fromCharCode: string[] | null = null;

    const strings: Record<string, string> = {};
    return (assetId: string, data: Uint8Array) => {
        if (!Object.prototype.hasOwnProperty.call(strings, assetId)) {
            // Native btoa is faster than javascript translation. Use js to
            // create a "binary" string and btoa to encode it.
            if (fromCharCode === null) {
                // Cache the first 256 characters for input byte values.
                fromCharCode = new Array(256);
                for (let i = 0; i < 256; i++) {
                    fromCharCode[i] = String.fromCharCode(i);
                }
            }

            const {length} = data;
            let s = '';
            // Iterate over chunks of the binary data.
            for (let i = 0, e = 0; i < length; i = e) {
                // Create small chunks to cause more small allocations and
                // less large allocations.
                e = Math.min(e + BTOA_CHUNK_MAX_LENGTH, length);
                let s_ = '';
                for (let j = i; j < e; j += 1) {
                    s_ += fromCharCode[data[j]];
                }
                // Encode the latest chunk so the we create one big output
                // string instead of creating a big input string and then
                // one big output string.
                s += btoa(s_);
            }
            strings[assetId] = s;
        }
        return strings[assetId];
    };
}());

class Asset {
    /** @type {AssetType} */
    assetType: AssetType;

    /** @type {string} */
    assetId: string;

    /** @type {DataFormat} */
    dataFormat: DataFormat = '' as DataFormat;

    /** @type {Uint8Array} */
    data: Uint8Array = new Uint8Array();

    /** @type {Asset[]} */
    dependencies: Asset[] = [];

    /** @type {boolean} */
    externalSource: boolean = false;

    /** @type {boolean} */
    _clean: boolean = false;

    /**
     * Construct an Asset.
     * @param {AssetType} assetType - The type of this asset (sound, image, etc.)
     * @param {string} assetId - The ID of this asset.
     * @param {DataFormat} [dataFormat] - The format of the data (WAV, PNG, etc.); required iff `data` is present.
     * @param {Uint8Array} [data] - The in-memory data for this asset; optional.
     * @param {boolean} [generateId] - Whether to create id from an md5 hash of data
     */
    constructor (assetType: AssetType, assetId?: string, dataFormat?: DataFormat, data?: Uint8Array, generateId?: boolean) {
        this.assetType = assetType;

        this.assetId = assetId ?? '';

        this.setData(data, dataFormat || assetType.runtimeFormat as DataFormat, generateId);
    }

    get clean (): boolean {
        // return false when externalSource is true to upload file.
        return this._clean && !this.externalSource;
    }

    set clean (clean: boolean) {
        this._clean = clean;
        // if this asset is set clean, it not from external source
        this.externalSource = false;
    }

    setData (data: Uint8Array | undefined, dataFormat: DataFormat, generateId?: boolean) {
        if (data && !dataFormat) {
            throw new Error('Data provided without specifying its format');
        }

        this.dataFormat = dataFormat;

        this.data = data ?? new Uint8Array();

        if (generateId && data) this.assetId = md5(data);

        // Mark as clean only if set is being called without generateId
        // If a new id is being generated, mark this asset as not clean
        this._clean = !generateId;
    }

    /**
     * @returns {string} - This asset's data, decoded as text.
     */
    decodeText (): string {
        const decoder = new TextDecoder();
        return decoder.decode(this.data);
    }

    /**
     * Same as `setData` but encodes text first.
     * @param {string} data - the text data to encode and store.
     * @param {DataFormat} dataFormat - the format of the data (DataFormat.SVG for example).
     * @param {boolean} generateId - after setting data, set the id to an md5 of the data?
     */
    encodeTextData (data: string, dataFormat: DataFormat, generateId: boolean) {
        const encoder = new TextEncoder();
        this.setData(encoder.encode(data), dataFormat, generateId);
    }

    /**
     * @param {string} [contentType] - Optionally override the content type to be included in the data URI.
     * @returns {string} - A data URI representing the asset's data.
     */
    encodeDataURI (contentType?: string): string {
        contentType = contentType || this.assetType.contentType;
        return `data:${contentType};base64,${memoizedToString(this.assetId, this.data)}`;
    }
}

export default Asset;
