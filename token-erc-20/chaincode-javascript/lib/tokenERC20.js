/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;


const balancePrefix = 'balance';

// Define key names for options
const nameKey = 'name';
const symbolKey = 'symbol';
const decimalsKey = 'decimals';
const totalSupplyKey = 'totalSupply';
// let cid;

class TokenERC20Contract extends Contract {

}

module.exports = TokenERC20Contract;
