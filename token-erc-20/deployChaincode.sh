#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0

# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE="javascript"
CC_SRC_PATH="../token-erc-20/chaincode-javascript/"
CC_NAME=${1:-"no"}

if [ "$CC_NAME" != "no" ]; then 
    echo Chanode name is ${CC_NAME}
else 
    echo pls pass Chaincode Name as First arg.
    exit 1
fi

# clean out any old identites in the wallets
# rm -rf api-server/wallet/*

# launch network; create channel and join peer to channel
pushd ../test-network

./network.sh deployTokenCC -ccn ${CC_NAME} -ccv 1 -cci SetOption -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH}
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

************ Chaincode Deploy Success ************
chaincode path : ${CC_SRC_PATH}

Enjoy ${CC_NAME} chaincode :) !!

EOF
