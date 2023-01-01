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

        if(!currentBalanceBytes || currentBalanceBytes.length === 0 ){
            return(`This user ${userID} has Zero balance Account`);

        }else {
            balance = parseInt(currentBalanceBytes.toString());
        }

        return balance;
    }

    async Transfer(ctx,to, amount){
        // validating amount
        const amountInt = parseInt(amount);
        if(amountInt < 0){
            return('Amount should not be Zero....!');
        }

        let senderBalance;
        let receiverBalance;

        let cid = new ClientIdentity(ctx.stub);
        const userID = await cid.getAttributeValue('userId'); // get userId from cert of registered user.
        
        const balanceKeyForSender = ctx.stub.createCompositeKey(balancePrefix,[userID]);  // this is sender id
        const currentBalanceBytes = await ctx.stub.getState(balanceKeyForSender);

        const balanceKeyForReceiver= ctx.stub.createCompositeKey(balancePrefix,[to]);  // this is receiver id
        receiverBalance = await ctx.stub.getState(balanceKeyForReceiver); // receiver balance

        if(!currentBalanceBytes || currentBalanceBytes.length === 0 ){
            return(`User ${userID} is not allowed to send Token; Zero Balance Error...!`);

        }else {
            
            senderBalance = parseInt(currentBalanceBytes.toString());
        }

        if(senderBalance < amountInt){
                // can perform transfer logic
                return(` User ${userID} has insufficient Balance for this Transaction...!`)
        }
        
                // 1. decrement sender balance by amount
               const sBalance = senderBalance - amountInt;
                await ctx.stub.putState(balanceKeyForSender, sBalance);
                
                // 2. increment receiver balance by amount
                receiverBalance = receiverBalance + amountInt;
                await ctx.stub.putState(balanceKeyForReceiver, receiverBalance);

         
            return "success"

    }

}

module.exports = TokenERC20Contract;
