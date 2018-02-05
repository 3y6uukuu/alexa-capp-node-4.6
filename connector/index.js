const config = require('../config');

const SERVER = config.SERVER;
const PEAL_API = config.PEAL_API;
const PEAL_TIMEOUT = config.PEAL_TIMEOUT;

const PARAMS = {
    DEVICE_DETAILS: {
        customerId: '123456',
        resourceIdentifier: 'AAAP52681885',
        resourceType: 'MAC',
        filter: 'WIFI',
        cty: 'DE',
        chl: 'CLOUDUI',
        deviceType: 'MV1Arris',
        cache: 'NO',
    }
};

const request = require('request');

function getDeviceDetails() {
    console.log(`getDeviceDetails => ${SERVER.URL}:${SERVER.PORT}${PEAL_API.DEVICE_DETAILS}`);

    return new Promise(function(resolve, reject) {
        request({
            method: 'GET',
            uri: `${SERVER.URL}:${SERVER.PORT}${PEAL_API.DEVICE_DETAILS}`,
            qs: PARAMS.DEVICE_DETAILS,
            timeout: PEAL_TIMEOUT,
        }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}

function getPassphrase() {
    return new Promise(function(resolve, reject) {

        getDeviceDetails()
            .then(function(deviceDetails) {
                const accessPoints = deviceDetails.data.deviceData.wifi.accessPoints;
                const passphrase = accessPoints.reduce((prev, curr) => curr.security.keyPassphrase || prev.security.keyPassphrase);

                resolve(passphrase);
            }, function() {
                reject(null);
            });
    });
}

function getSSID() {
    return new Promise(function(resolve, reject) {

        getDeviceDetails()
            .then(function(deviceDetails) {
                const accessPoints = deviceDetails.data.deviceData.wifi.accessPoints;
                const ssidReference = accessPoints.reduce((prev, curr) => curr.ssidReference || prev.ssidReference);

                resolve(ssidReference);
            }, function() {
                reject(null);
            });
    });
}

module.exports = {
    getPassphrase: getPassphrase,
    getSSID: getSSID,
};