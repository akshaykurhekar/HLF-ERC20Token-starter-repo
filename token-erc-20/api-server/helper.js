'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const util = require('util')
const crypto = require('crypto');
const jsonFile = require('jsonfile');
const dicomParser = require('dicom-parser');
const gc = require('./bucket-config')

const bucket = gc.bucket('rdl-blockchain-bucket') // should be your bucket name
const { format } = util

const register_enroll_user = async (userID, role, password) => {
    try {
        // load the network configuration
        //for main net
        // const ccpPath = path.resolve(__dirname,'config','connection-org1.json');
        //for local fabric-test net
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(userID, role, password);
        if (userIdentity) {
            console.log(`An identity for the user ${userID} already exists in the wallet`);
            return "exist";
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return "adminNotExist";
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: userID,
            role: 'client',
            attrs: [{ name: 'role', value: role, ecert: true },{ name: 'password', value: password, ecert: true }],
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: userID,
            enrollmentSecret: secret,
            attr_reqs: [{ name: "role", optional: false },{ name: "password", optional: false }]

        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(userID, x509Identity);
        console.log(`Successfully registered and enrolled admin user ${userID} and imported it into the wallet`);

        return "success";
    } catch (error) {
        console.error(`Failed to register user ${userID}: ${error}`);
        // return "error";
        process.exit(1);
    }
}

const login = async (userID, password) => {
    try {
        // load the network configuration
        // for test net
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        // for main net
        // const ccpPath = path.resolve(__dirname, 'config','connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userID);
        if (!identity) {
            console.log(`An identity for the user ${userID} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return "notExist";
        }
            const gateway = new Gateway();
            //for Main net asLocalhost should be false
            // await gateway.connect(ccp, { wallet, identity: userID, discovery: { enabled: true, asLocalhost: false } });
            // for test net asLocalHost should be true
            await gateway.connect(ccp, { wallet, identity: userID, discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');
    
            // Get the contract from the network.
            const contract = network.getContract('fabcarWeb');
    
            //encrpyt password before submitting transaction
    
            const res = await contract.submitTransaction('login', password);
            const result = res.toString();
            console.log("login response:",result);
            await gateway.disconnect();

            if(result == "success"){
                return "success";
            }else{
                return "userNotExist";
            }
        
        // Create a new gateway for connecting to our peer node.
        // Disconnect from the gateway.

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

const createAsset = async (userID, metadata) => {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'config','connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userID);
        if (!identity) {
            console.log(`An identity for the user ${userID} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        // await gateway.connect(ccp, { wallet, identity: userID, discovery: { enabled: true, asLocalhost: false } });
        // for test net asLocalHost should be true
        await gateway.connect(ccp, { wallet, identity: userID, discovery: { enabled: true, asLocalhost: true } });
    
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcarWeb');

        //encrpyt password before submitting transaction

        // fetch attributes that are to be added to ledger from metadata object
        asset_id = metadata.Asset_id
        gcpLocation = metadata.Location
        userId = metadata.User_id
        patientId = metadata.Metadata.Patientid

        const result = await contract.submitTransaction('createAsset', 'asset001', 'akshay', '23', true, '12:30pm');
        console.log('Transaction has been submitted ',JSON.stringify(result.toString()));
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */
const uploadData = (file) => new Promise((resolve, reject) => {
    try{
        const { originalname, buffer } = file
        const blob = bucket.file(originalname)  
        // .replace(/ /g, "_"))
        // console.log("blob", blob);
        const blobStream = blob.createWriteStream({
            resumable: false
        })
        // console.log("blobstream: ", blobStream);
        blobStream.on('finish', () => {
            const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            )
            resolve(publicUrl)
        })
        .on('error', () => {
            reject(`Unable to upload image, something went wrong`)
        })
        .end(buffer)
} 
catch (error) {
    console.error(`Failed to upload dicom file: ${error}`);
    process.exit(1);
}
})

/**
   *  extracts metadata of file passed to it as an argument.
   * @param { File } object file object that will be uploaded.
   * @param fileName - dicom file name 
   * @param Type - file type = "DICOM"
   * @description - This function does the following
    * - It reads the file and extracts metadata  
   * @returns {json} Returns json file including metadata extracted from dicom, type, encrypted bucket location, 
   * role of user and asset ids.
*/

const parseData = (file, fileName, type, bucketLocation)  => {
    // const dicomFileAsBuffer = fs.readFileSync(file);
    try{
        const dataSet = dicomParser.parseDicom(file);
        const metadata = {
            Patientid: dataSet.string('x00100020'),
            StudyInstanceUID: dataSet.string('x0020000d'),
            SeriesInstanceUID: dataSet.string('x0020000e'),
            SeriesDescription: dataSet.string('x0008103e'),
            Modality: dataSet.string('x00080060'),
            SeriesNumber: dataSet.string('x00200011'),
            Laterality: dataSet.string('x00200060'),
            SeriesDate : dataSet.string('x00080021'),
            SeriesTime: dataSet.string('x00080031'),
            ProtocolName: dataSet.string('x00181030'),
            BodyPartExamined: dataSet.string('x00180015'),
            PatientPosition: dataSet.string('x00185100'),
            AnatomicalOrientationType: dataSet.string('x00102210'),
            PerformedProcedureStepID: dataSet.string('x00400253'),
            PerformedProcedureStepStartDate: dataSet.string('x00400244'),
            PerformedProcedureStepStartTime: dataSet.string('x00400245'),
            PerformedProcedureStepEndDate: dataSet.string('x00400250'),
            PerformedProcedureStepEndTime: dataSet.string('x00400251'),
            PerformedProcedureStepDescription: dataSet.string('00400254'),
            PerformedProtocolCodeSequence: dataSet.string('x00400260')
        }
        
        const data = {
            User_id:"abc", //to be retrieved by querying the ledger
            Type:type, 
            Metadata:metadata, 
            Location:encrypt(bucketLocation),
            Role:"Patient",
            Asset_id: ""  // 
        };

        const jsonName = fileName.substr(0, fileName.lastIndexOf(".")) + ".json";

        // jsonFile module easily read/write JSON files in Node.js
        jsonFile.writeFile(jsonName, data, {spaces: 2}, function(err){
            if(err) throw err;
        });
        return data;
}
    catch (error) {
        console.error(`Failed to parse dicom file: ${error}`);
        process.exit(1);
    }
}; 

const encrypt = (bucketLocation)  => {

    const password = 'abc123av'; //to be retrieved need in hashed form => udgauducgiwuefygsi

    const cipher = crypto.createCipheriv('aes256', password);
    let encrypted = cipher.update(bucketLocation, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}


module.exports = {register_enroll_user, login, createAsset, uploadData, parseData};