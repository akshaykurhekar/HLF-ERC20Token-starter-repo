Hi, all very happy to share this new approach to create ERC20 Token using Hyperledger Fabric for private blockchain.

### Now, lets get started.

we will first look into the arc of Hyplerledger Fabric (HLF).
then will see development setup along with creating chaincode for our Dapp.

### 1. up network

    a. it will create 1 channel -> mychannel
    b. it will create Org1 -> peer0 , peer1  it will join channel
    c. it will create Org2 -> peer0 , peer1  it will join channel

    will create container in background with orderer.
    setup network done.

    check fabric binary:
    run from any folder

`   $ docker images`

    if you find fabric images

    cd token-erc-20
`   $ ./networkUp.sh`

    to deploy chaincode we need to run this script
     cd token-erc-20
`    $ ./deployChaincode.sh Chaincode_Name `

    -------------------------------

    Now, lets move towards application part

`    $ cd api_server` 
`    $ npm i`

`    $ node registerAdmin.js`

    output:
    Wallet path: /home/akshay/fabric/HLF-erc20Token-starter/token-erc-20/api-server/wallet
    Successfully enrolled admin user "admin" and imported it into the wallet

`    $ node registerMinter.js`

    we invoke chaincode by this user Rama we have setToken details and fech data from ledger.

`    $ node invokeByMinter.js`
    out put:
    Token details ::  DevToken

    --------------------------------------------------
    day - 2 

    create chain code fun for mint, transfer along with balance and accountId

    Note:
    once you deploy chaincode, if you updated logic of chaincode and you want to use that logic
    need to upgrade chaincode with new_cc_name.

    $ cd token-erc-20

    $ ./upgradeChaincode.sh CC_Name

    To stop container
    $ docker stop 