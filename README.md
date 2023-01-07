Hi, all very happy to share this new approach to create ERC20 Token using Hyperledger Fabric for private blockchain.

### Now, lets get started.

we will first look into the arc of Hyplerledger Fabric (HLF).
then will see development setup along with creating chaincode for our Dapp.

#### check out detailed Medium article of this project [https://medium.com/@akshay.kurhekar1014662/erc20-token-implementation-in-hyperledger-fabric-103cbfc21379]

### 1. up network

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

    
    day - 2 

    create chain code fun for mint, transfer along with balance and accountId

    Note:
    once you deploy chaincode, if you updated logic of chaincode and you want to use that logic
    need to upgrade chaincode with new_cc_name.

`   $ cd token-erc-20`

`    $ ./upgradeChaincode.sh CC_Name`

    After upgrading chaincode we will test our ERC20 token functions
    
    In node app by invokeByMinter script for minting 9000 Tokens Transfer it to different user and check balance .
`   $node invokeByMinter.js`
    To stop container
`   $ docker stop` 

    To down network or we can say that to close development setup we need to do.
    
`    $ cd token-erc-20`

    check files you will get networkDown.sh script we need to execute it.

`   $ ./networkDown.sh`    