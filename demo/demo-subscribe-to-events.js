/* global console */

import * as fcl from '@onflow/fcl';
// clients should install fcl-subscribe as a node_module and import
// from 'fcl-subscribe' directly.  This demo imports from the current
// source version instead (ie: './').
import { subscribeToEvents } from './fcl-subscribe';

// use standard fcl methods to initialize
fcl.config({
    'accessNode.api': 'https://mainnet.onflow.org',
});

// will unsubscribe after 3 callbacks
let calls = 0;

// setup subscription
const unsubscribe = subscribeToEvents({
    fcl: fcl,
    fromBlockHeight: 31932851,
    events: [
        'A.921ea449dffec68a.Flovatar.Created',
        'A.921ea449dffec68a.FlovatarMarketplace.FlovatarPurchased',
        'A.921ea449dffec68a.FlovatarMarketplace.FlovatarComponentPurchased',
    ],
    // process the subscription response
    onEvent: function(event) {
        console.log(event);
        calls++;
        if (calls === 3) {
            unsubscribe();
        }
    },
    onError: console.error,
    // optionally abort the subscription on error (vs. continuing to poll)
    abortOnError: true,
    sleepTime: 1000,
});
