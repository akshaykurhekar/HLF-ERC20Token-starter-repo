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
CC_VERSION="1"

CC_SRC_LANGUAGE="javascript"
CC_NAME=${1:-"no"}

if [ "$CC_NAME" != "no" ]; then 
    echo Chanode is ${CC_NAME}
else 
    echo pls pass Chaincode Name as First arg.
    exit 1
fi

echo The chaincode version : ${CC_VERSION}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
	CC_SRC_PATH="../token-erc-20/chaincode-go/"
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_SRC_PATH="../token-erc-20/chaincode-javascript/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, javascript, and typescript
	exit 1
fi

# clean out any old identites in the wallets
rm -rf javascript/wallet/*

# launch network; create channel and join peer to channel
pushd ../test-network
# ./network.sh down
# ./network.sh up createChannel -ca -s couchdb
./network.sh deployTokenCC -ccn ${CC_NAME} -ccv ${CC_VERSION} -cci SetOption -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH}
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

********UPGRATE SUCCESS*********

chaincode path : ${CC_SRC_PATH}
Enjoy ${CC_NAME} chaincode :) !!

EOF
