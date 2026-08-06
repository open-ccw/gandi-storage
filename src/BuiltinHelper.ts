import md5 from 'js-md5';

import log from './log';

import Asset from './Asset';
import { AssetType } from './AssetType';
import { DataFormat } from './DataFormat';
import Helper from './Helper';

import defaultBitmap from './builtins/defaultBitmap.png';
import defaultSound from './builtins/defaultSound.wav';
import defaultVector from './builtins/defaultVector.svg';
import defaultPython from './builtins/defaultPython.py';
import defaultJson from './builtins/defaultJson.txt';
import defaultJavascript from './builtins/defaultJavascript.js';
import defaultGlsl from './builtins/defaultGlsl.glsl';

/**
 * @typedef {object} BuiltinAssetRecord
 * @property {AssetType} type - The type of the asset.
 * @property {DataFormat} format - The format of the asset's data.
 * @property {?string} id - The asset's unique ID.
 * @property {Uint8Array} data - The asset's data.
 */

interface BuiltinAssetRecord {
    type: AssetType;
    format: DataFormat;
    id: string | null;
    data: Uint8Array;
}

/**
 * @type {BuiltinAssetRecord[]}
 */
const DefaultAssets: BuiltinAssetRecord[] = [
    {
        type: AssetType.ImageBitmap,
        format: DataFormat.PNG,
        id: null,
        data: defaultBitmap
    },
    {
        type: AssetType.Sound,
        format: DataFormat.WAV,
        id: null,
        data: defaultSound
    },
    {
        type: AssetType.ImageVector,
        format: DataFormat.SVG,
        id: null,
        data: defaultVector
    },
    {
        type: AssetType.Python,
        format: DataFormat.PYTHON,
        id: null,
        data: defaultPython
    },
    {
        type: AssetType.Json,
        format: DataFormat.JSON,
        id: null,
        data: defaultJson
    },
    {
        type: AssetType.Extension,
        format: DataFormat.JAVASCRIPT,
        id: null,
        data: defaultJavascript
    },
    {
        type: AssetType.JavaScript,
        format: DataFormat.JAVASCRIPT,
        id: null,
        data: defaultJavascript
    },
    {
        type: AssetType.GLSL,
        format: DataFormat.GLSL,
        id: null,
        data: defaultGlsl
    }
];

/**
 * @type {BuiltinAssetRecord[]}
 */
const BuiltinAssets: BuiltinAssetRecord[] = DefaultAssets.concat([
]);

class BuiltinHelper extends Helper {
    /** @type {Record<string, BuiltinAssetRecord>} */
    assets: Record<string, BuiltinAssetRecord>;

    constructor (parent: any) {
        super(parent);

        /**
         * In-memory storage for all built-in assets.
         * @type {Object.<AssetType, AssetIdMap>} Maps asset type to a map of asset ID to actual assets.
         * @typedef {Object.<string, BuiltinAssetRecord>} AssetIdMap - Maps asset ID to asset.
         */
        this.assets = {};

        BuiltinAssets.forEach(assetRecord => {
            assetRecord.id = this._store(assetRecord.type, assetRecord.format, assetRecord.data, assetRecord.id);
        });
    }

    /**
     * Call `setDefaultAssetId` on the parent `ScratchStorage` instance to register all built-in default assets.
     */
    registerDefaultAssets () {
        const numAssets = DefaultAssets.length;
        for (let assetIndex = 0; assetIndex < numAssets; ++assetIndex) {
            const assetRecord = DefaultAssets[assetIndex];
            this.parent.setDefaultAssetId(assetRecord.type, assetRecord.id);
        }
    }

    /**
     * Synchronously fetch a cached asset for a given asset id. Returns null if not found.
     * @param {string} assetId - The id for the asset to fetch.
     * @returns {?Asset} The asset for assetId, if it exists.
     */
    get (assetId: string): Asset | null {
        let asset: Asset | null = null;
        if (Object.prototype.hasOwnProperty.call(this.assets, assetId)) {
            /** @type{BuiltinAssetRecord} */
            const assetRecord = this.assets[assetId];
            asset = new Asset(assetRecord.type, assetRecord.id!, assetRecord.format, assetRecord.data);
        }
        return asset;
    }

    /**
     * Alias for store (old name of store)
     * @deprecated Use BuiltinHelper.store
     * @param {AssetType} assetType - The type of the asset to cache.
     * @param {DataFormat} dataFormat - The dataFormat of the data for the cached asset.
     * @param {Uint8Array} data - The data for the cached asset.
     * @param {string} id - The id for the cached asset.
     * @returns {string} The calculated id of the cached asset, or the supplied id if the asset is mutable.
     */
    cache (assetType: AssetType, dataFormat: DataFormat, data: Uint8Array, id: string | null): string {
        log.warn('Deprecation: BuiltinHelper.cache has been replaced with BuiltinHelper.store.');
        return this.store(assetType, dataFormat, data, id);
    }

    /**
     * Deprecated external API for _store
     * @deprecated Not for external use. Create assets and keep track of them outside of the storage instance.
     * @param {AssetType} assetType - The type of the asset to cache.
     * @param {DataFormat} dataFormat - The dataFormat of the data for the cached asset.
     * @param {Uint8Array} data - The data for the cached asset.
     * @param {(string|number)} id - The id for the cached asset.
     * @returns {string} The calculated id of the cached asset, or the supplied id if the asset is mutable.
     */
    store (assetType: AssetType, dataFormat: DataFormat, data: Uint8Array, id: string | number | null): string {
        log.warn('Deprecation: use Storage.createAsset. BuiltinHelper is for internal use only.');
        return this._store(assetType, dataFormat, data, id);
    }

    /**
     * Cache an asset for future lookups by ID.
     * @param {AssetType} assetType - The type of the asset to cache.
     * @param {DataFormat} dataFormat - The dataFormat of the data for the cached asset.
     * @param {Uint8Array} data - The data for the cached asset.
     * @param {(string|number)} id - The id for the cached asset.
     * @returns {string} The calculated id of the cached asset, or the supplied id if the asset is mutable.
     */
    _store (assetType: AssetType, dataFormat: DataFormat, data: Uint8Array, id: string | number | null): string {
        if (!dataFormat) throw new Error('Data cached without specifying its format');
        if (id !== '' && id !== null && typeof id !== 'undefined') {
            if (Object.prototype.hasOwnProperty.call(this.assets, id) && assetType.immutable) return id as string;
        } else if (assetType.immutable) {
            id = md5(data);
        } else {
            throw new Error('Tried to cache data without an id');
        }
        this.assets[id as string] = {
            type: assetType,
            format: dataFormat,
            id: id as string,
            data: data
        };
        return id as string;
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @param {DataFormat} [dataFormat] - Optional: load this format instead of the AssetType's default.
     * @return {?Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType: AssetType, assetId: string, dataFormat?: DataFormat): Promise<Asset | null> | null {
        if (!this.get(assetId)) {
            // Return null immediately so Storage can quickly move to trying the
            // next helper.
            return null;
        }
        return Promise.resolve(this.get(assetId));
    }
}

export default BuiltinHelper;