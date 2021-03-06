/* global console */

import * as fcl from '@onflow/fcl';
// clients should install fcl-subscribe as a node_module and import
// from 'fcl-subscribe' directly.  This demo imports from the current
// source version instead (ie: './').
import { subscribe } from './fcl-subscribe';

// use standard fcl methods to initialize
fcl.config({
    'accessNode.api': 'https://testnet.onflow.org',
});

// setup subscription, optionally caching the unsubscribe method
const unsubscribe = subscribe({
    // inject method to get current block height
    block: fcl.block,
    // build fcl query to subscribe to, typically fcl.send with an
    // fcl.getEventsAtBlockHeightRange builder
    getQuery: function(context) {
        return fcl.send([
            fcl.getEventsAtBlockHeightRange(
                'A.3c7e227e52ac6c0d.Flovatar.Created',
                context.fromBlockHeight,
                context.toBlockHeight,
            ),
        ]);
    },
    // process the subscription response
    onResponse: function(response) {
        // when subscribing to fcl.send, the response must be decoded with fcl.decode
        fcl.decode(response).then((events) => {
            if (events && events.length > 0) {
                console.log(events);
                // can unsubscribe when needed
                unsubscribe();
            }
        });
    },
    onError: console.error,
});
