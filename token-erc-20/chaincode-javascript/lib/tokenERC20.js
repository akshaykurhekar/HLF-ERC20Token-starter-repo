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
        return 'success';
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

    async Mint(ctx, amount) {
        
        // validating user role
        let cid = new ClientIdentity(ctx.stub)
        const role = await cid.getAttributeValue('role'); // get role from cert of registered user.
        
        if(role !== 'Minter') {
            return('User is not Authorized to Mint Tokens....!')   
        }
        
        // validating amount
        const amountInt = parseInt(amount);
        if(amountInt < 0){
            return('Amount should not be Zero....!');
        }
        
        // increment balance of minter
        const minter = await cid.getAttributeValue('userId'); // get userId from cert of registered user.
        const balanceKey = ctx.stub.createCompositeKey(balancePrefix,[minter]);
        
        const currentBalanceBytes = await ctx.stub.getState(balanceKey);

        let currentBalance;
        if(!currentBalanceBytes || currentBalanceBytes.length === 0 ){
            currentBalance = 0;
        }else {
            currentBalance = parseInt(currentBalanceBytes.toString());
        }
        const updatedBalance = currentBalance + amountInt;
        await ctx.stub.putState(balanceKey, Buffer.from(updatedBalance.toString()));


        // increment total supply
        let totalSupply;
        const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey); // fetch the tokensupply value from ledger

        if(!totalSupplyBytes || totalSupplyBytes.length === 0 ){
            totalSupply = 0;
            console.log('Initialize the tokenSupply..!');
        }else {
            totalSupply = parseInt(totalSupplyBytes.toString());
        }
        totalSupply = totalSupply + amountInt; // added tokenSupply with new amount

        await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString())); // key- value

        return 'success';
    }

    async getBalance(ctx) {

        let balance;
        let cid = new ClientIdentity(ctx.stub);
        const userID = await cid.getAttributeValue('userId'); // get userId from cert of registered user.
        const balanceKey = ctx.stub.createCompositeKey(balancePrefix,[userID]);
        const currentBalanceBytes = await ctx.stub.getState(balanceKey);

        if(!currentBalanceBytes || currentBalanceBytes.length === 0 || currentBalanceBytes === 0  ){
            return(`This user ${userID} has Zero balance Account`);

        }
            balance = parseInt(currentBalanceBytes.toString());
        

        return balance;
    }

    async Transfer(ctx,to, value){
       
        let cid = new ClientIdentity(ctx.stub);
        const from = await cid.getAttributeValue('userId'); // get sender userId from cert of registered user.
        
         // Convert value from string to int
         const valueInt = parseInt(value);

         if (valueInt < 0) { // transfer of 0 is allowed in ERC20, so just validate against negative amounts
             return('transfer amount cannot be negative');
         }
 
         // Retrieve the current balance of the sender
         const fromBalanceKey = ctx.stub.createCompositeKey(balancePrefix, [from]);
         const fromCurrentBalanceBytes = await ctx.stub.getState(fromBalanceKey);
 
         if (!fromCurrentBalanceBytes || fromCurrentBalanceBytes.length === 0) {
             return(`client account ${from} has no balance`);
         }
 
         const fromCurrentBalance = parseInt(fromCurrentBalanceBytes.toString());
 
         // Check if the sender has enough tokens to spend.
         if (fromCurrentBalance < valueInt) {
             return(`client account ${from} has insufficient funds.`);
         }
 
         // Retrieve the current balance of the recepient
         const toBalanceKey = ctx.stub.createCompositeKey(balancePrefix, [to]);
         const toCurrentBalanceBytes = await ctx.stub.getState(toBalanceKey);
 
         let toCurrentBalance;
         // If recipient current balance doesn't yet exist, we'll create it with a current balance of 0
         if (!toCurrentBalanceBytes || toCurrentBalanceBytes.length === 0) {
             toCurrentBalance = 0;
         } else {
             toCurrentBalance = parseInt(toCurrentBalanceBytes.toString());
         }
 
         // Update the balance
         const fromUpdatedBalance = fromCurrentBalance - valueInt;
         const toUpdatedBalance = toCurrentBalance + valueInt;
 
         await ctx.stub.putState(fromBalanceKey, Buffer.from(fromUpdatedBalance.toString()));
         await ctx.stub.putState(toBalanceKey, Buffer.from(toUpdatedBalance.toString()));
 
         console.log(`client ${from} balance updated from ${fromCurrentBalance} to ${fromUpdatedBalance}`);
         console.log(`recipient ${to} balance updated from ${toCurrentBalance} to ${toUpdatedBalance}`);
 
         return true;

    }

}

module.exports = TokenERC20Contract;
