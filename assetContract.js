// chaincode/asset-management/lib/assetContract.js
'use strict';

const { Contract } = require('fabric-contract-api');

class AssetContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const assets = [
            {
                ID: 'asset1',
                Color: 'blue',
                Size: 5,
                Owner: 'Tomoko',
                AppraisedValue: 300,
            },
            {
                ID: 'asset2',
                Color: 'red',
                Size: 5,
                Owner: 'Brad',
                AppraisedValue: 400,
            },
            {
                ID: 'asset3',
                Color: 'green',
                Size: 10,
                Owner: 'Jin Soo',
                AppraisedValue: 500,
            },
            {
                ID: 'asset4',
                Color: 'yellow',
                Size: 10,
                Owner: 'Max',
                AppraisedValue: 600,
            },
            {
                ID: 'asset5',
                Color: 'black',
                Size: 15,
                Owner: 'Adriana',
                AppraisedValue: 700,
            },
            {
                ID: 'asset6',
                Color: 'white',
                Size: 15,
                Owner: 'Michel',
                AppraisedValue: 800,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Color: color,
            Size: parseInt(size),
            Owner: owner,
            AppraisedValue: parseInt(appraisedValue),
        };
        asset.docType = 'asset';

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        
        // Emit event
        const eventPayload = Buffer.from(JSON.stringify(asset));
        ctx.stub.setEvent('AssetCreated', eventPayload);
        
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // Get current asset
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        
        // Update fields
        asset.Color = color;
        asset.Size = parseInt(size);
        asset.Owner = owner;
        asset.AppraisedValue = parseInt(appraisedValue);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        
        // Emit event
        const eventPayload = Buffer.from(JSON.stringify(asset));
        ctx.stub.setEvent('AssetUpdated', eventPayload);
        
        return JSON.stringify(asset);
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        await ctx.stub.delState(id);
        
        // Emit event
        const eventPayload = Buffer.from(JSON.stringify({ID: id}));
        ctx.stub.setEvent('AssetDeleted', eventPayload);
        
        return `Asset ${id} deleted successfully`;
    }

    // AssetExists returns true when asset with given ID exists in world state
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in world state, and returns the old owner.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        
        // Emit event
        const eventPayload = Buffer.from(JSON.stringify({
            ID: id,
            oldOwner: oldOwner,
            newOwner: newOwner
        }));
        ctx.stub.setEvent('AssetTransferred', eventPayload);
        
        return oldOwner;
    }

    // GetAllAssets returns all assets found in world state
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // GetAssetsByRange returns assets based on range query
    async GetAssetsByRange(ctx, startKey, endKey) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // GetAssetHistory returns the history of changes for an asset
    async GetAssetHistory(ctx, id) {
        const resultsIterator = await ctx.stub.getHistoryForKey(id);
        const results = [];
        let res = await resultsIterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                results.push({
                    TxId: res.value.txId,
                    Timestamp: res.value.timestamp,
                    IsDelete: res.value.isDelete.toString(),
                    Value: obj
                });
            }
            res = await resultsIterator.next();
        }
        await resultsIterator.close();
        return JSON.stringify(results);
    }

    // QueryAssetsByOwner queries for assets based on owner
    async QueryAssetsByOwner(ctx, owner) {
        const queryString = {
            selector: {
                docType: 'asset',
                Owner: owner
            }
        };
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    // QueryAssets uses a query string to perform a query for assets
    async QueryAssets(ctx, queryString) {
        return await this.GetQueryResultForQueryString(ctx, queryString);
    }

    // GetQueryResultForQueryString executes the passed in query string
    async GetQueryResultForQueryString(ctx, queryString) {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const results = [];
        let res = await resultsIterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                const obj = JSON.parse(res.value.value.toString('utf8'));
                results.push({Key: res.value.key, Record: obj});
            }
            res = await resultsIterator.next();
        }
        await resultsIterator.close();
        return JSON.stringify(results);
    }
}

module.exports = AssetContract;

// chaincode/asset-management/index.js
'use strict';

const AssetContract = require('./lib/assetContract');

module.exports.AssetContract = AssetContract;
module.exports.contracts = [AssetContract];

// chaincode/asset-management/package.json
{
    "name": "asset-management",
    "version": "1.0.0",
    "description": "Asset Management Smart Contract",
    "main": "index.js",
    "engines": {
        "node": ">=14.0.0"
    },
    "scripts": {
        "lint": "eslint .",
        "pretest": "npm run lint",
        "test": "nyc mocha --recursive",
        "start": "fabric-chaincode-node start"
    },
    "engineStrict": true,
    "author": "Hyperledger",
    "license": "Apache-2.0",
    "dependencies": {
        "fabric-contract-api": "^2.4.1",
        "fabric-shim": "^2.4.1"
    },
    "devDependencies": {
        "chai": "^4.3.4",
        "eslint": "^7.32.0",
        "mocha": "^9.1.1",
        "nyc": "^15.1.0",
        "sinon": "^11.1.2",
        "sinon-chai": "^3.7.0"
    },
    "nyc": {
        "exclude": [
            "coverage/**",
            "test/**"
        ],
        "reporter": [
            "text-summary",
            "html"
        ],
        "all": true,
        "check-coverage": true,
        "statements": 80,
        "branches": 80,
        "functions": 80,
        "lines": 80
    }
}
