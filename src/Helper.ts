import { AssetType } from './AssetType';
import { DataFormat } from './DataFormat';
import Asset from './Asset';

/**
 * Base class for asset load/save helpers.
 * @abstract
 */
class Helper {
    parent: any;

    constructor (parent: any) {
        this.parent = parent;
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @param {DataFormat} dataFormat - The file format / file extension of the asset to fetch: PNG, JPG, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    load (assetType: AssetType, assetId: string, dataFormat: DataFormat): Promise<Asset | null> | null {
        return Promise.reject(new Error(`No asset of type ${assetType} for ID ${assetId} with format ${dataFormat}`));
    }
}

export default Helper;