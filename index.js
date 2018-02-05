const express = require('express');
const alexa = require('alexa-app');
const AmazonSpeech = require('ssml-builder/amazon_speech');

const PORT = process.env.port || 8082;
const expressApp = express();

const alexaApp = new alexa.app('test');
const connector = require('./connector');

alexaApp.express({
    expressApp: expressApp,
    checkCert: false,
    debug: true
});

expressApp.set('view engine', 'ejs');

alexaApp.launch(function(request, response) {
    const speech = new AmazonSpeech();

    speech
        .say('You launched the')
        .sayAs({
            word: 'Connectivity Application!',
            interpret: 'interjection',
        });

    const speechOutput = speech.ssml();

    response.say(speechOutput);
});

alexaApp.intent('getDeviceDetails', {
        slots: {
            settingProperty: 'propertyString',
        },
        utterances: [
            `to tell me Wi-Fi {-|settingProperty}`,
            `to tell me my Wi-Fi {-|settingProperty}`,
            `for a Wi-Fi {-|settingProperty}`,
            `what's my Wi-Fi {-|settingProperty}`,
            `what is my Wi-Fi {-|settingProperty}`,
            `what's my network {-|settingProperty}`,
            `what is my network {-|settingProperty}`,
            `tell me network {-|settingProperty}`,
            `tell me my {-|settingProperty}`,
            `for a {-|settingProperty}`,
            `what's my {-|settingProperty}`,
            `what is my {-|settingProperty}`,
        ]
    },
    function(request, response) {
        const requestedIntent = request.slot('settingProperty');

        console.log(`Intent => ${requestedIntent}`);

        const requestedAction = {
            password: 'getPassphrase',
            passport: 'getPassphrase',

            name: 'getSSID',
            title: 'getSSID',
        }[requestedIntent];

        const speech = new AmazonSpeech();

        if (requestedAction) {
            return connector[requestedAction]()
                .then(function(settingProperty) {
                    console.log(`settingProperty => ${settingProperty}`);

                    if (['password', 'passport'].indexOf(requestedIntent) === -1) {
                        speech
                            .say(`Your Wi-Fi ${requestedIntent} is:`)
                            .pause('500ms')
                            .emphasis('moderate', settingProperty);

                    } else {
                        speech
                            .say(`Your Wi-Fi password is:`)
                            .pause('500ms')
                            .sayAs({
                                word: settingProperty,
                                interpret: 'characters',
                            });
                    }

                    const speechOutput = speech.ssml();

                    response.say(speechOutput);
                }, function() {
                    speech.prosody({volume: 'soft'}, 'Oops, something went wrong with PEAL API, please try again later.');

                    const speechOutput = speech.ssml();

                    response.say(speechOutput);
                });
        } else {
            speech.prosody({volume: 'soft'}, `Sorry, I didn't understand the intent, please try again.`);

            const speechOutput = speech.ssml();

            response.say(speechOutput);
        }
    }
);

alexaApp.intent('secret', {
        utterances: [
            'to tell me a secret',
        ]
    },
    function(request, response) {
        const speech = new AmazonSpeech();

        speech
            .emphasis('moderate', 'Okay, I have one!')
            .pause('1s')
            .whisper('Alexa – is not a real Human!')
            .emphasis('moderate', 'can you believe it???');

        const speechOutput = speech.ssml();

        response.say(speechOutput);
    }
);

expressApp.listen(PORT, function() {
    console.log(`Listening on port ${PORT}, try http://localhost:${PORT}/test`);
});