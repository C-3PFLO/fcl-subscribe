/* global console */

import * as fcl from '@onflow/fcl';
import subscribe from './fcl-subscribe';

fcl.config({
    'accessNode.api': 'https://testnet.onflow.org',
});

subscribe({
    block: fcl.block,
    getQuery: function(context) {
        console.debug('fcl.send for context =', context);
        return fcl.send([
            fcl.getEventsAtBlockHeightRange(
                'A.3c7e227e52ac6c0d.Flovatar.Created',
                context.fromBlockHeight,
                context.toBlockHeight,
            ),
        ]);
    },
    abortOnError: true,
    onResponse: function(response) {
        console.debug('checking response for events');
        fcl.decode(response).then((events) => {
            if (events && events.length > 0) {
                console.log(events);
            }
        });
    },
    onError: console.error,
});
