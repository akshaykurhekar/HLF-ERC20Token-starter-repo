/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;


const balancePrefix = 'balance';

// table X
// key - value
// ERC20 token name : Aplha
// Define key names for options
const nameKey = 'name';
const symbolKey = 'symbol';
const decimalsKey = 'decimals';
const totalSupplyKey = 'totalSupply';
// let cid;

class TokenERC20Contract extends Contract {
    
    async SetOption(ctx, name, symbol, decimals){
        //buffer example: [ 23 45 57 79 89 90]
        await ctx.stub.putState(nameKey, Buffer.from(name)) // to create a state on ledger
        await ctx.stub.putState(symbolKey, Buffer.from(symbol)) // to create a state on ledger
        await ctx.stub.putState(decimalsKey, Buffer.from(decimals)) // to create a state on ledger
    }

    async TokenName(ctx) {
        const nameBytes = await ctx.stub.getState(nameKey);
        return nameBytes.toString();
    }

    async Symbol(ctx) {
        const symbolBytes = await ctx.stub.getState(symbolKey);
        return symbolBytes.toString();
    }

    async Decimals(ctx) {
        const decimalBytes = await ctx.stub.getState(decimalsKey);
        return decimalBytes.toString();
    }

}

module.exports = TokenERC20Contract;
