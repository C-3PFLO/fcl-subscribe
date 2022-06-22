# fcl-subscribe

Subscribe to Flow blockchain events, wrapping [`@onflow/fcl`](https://docs.onflow.org/fcl/).

### Motivation

The `fcl.send()` function ([link](https://docs.onflow.org/fcl/reference/api/#send)) "*sends arbitrary scripts, transactions, and requests to Flow*".  Clients can use `fcl.send()` with the `fcl.getEventsAtBlockHeightRange()` function ([link](https://docs.onflow.org/fcl/reference/api/#geteventsatblockheightrange)) to get "*all instances of a particular event (by name) within a height range*".

However, `fcl.getEventsAtBlockHeightRange()` is limited to a single block range, "*the block range provided must be 250 blocks or lower per request*" and `fcl.send()` only sends the request once.  There is no `@onflow/fcl` method to subscribe to all events of a certain type across a larger block range, including as new blocks are created.

This module implements `subscribe()` which allows clients to make the same `fcl.getEventsAtBlockHeightRange()` call across many block ranges (250 blocks at a time), including previous blocks and as new blocks are created.

*NOTE: while this module was designed for `fcl.getEventsAtBlockHeightRange()`, it can be used for any `fcl` request of a given block range.*

### Usage

Install as an `npm` package

```
npm install --save fcl-subscribe
```

Import `fcl-subscribe` and use it in conjunction with `@onflow/fcl`

```js
import * as fcl from '@onflow/fcl';
import { subscribe } from 'fcl-subscribe';

fcl.config(/* arguments */)

subscribe({
    // inject fcl.block to retrieve latest block height
    block: fcl.block,
    // callback to run query for current block context
    getQuery: function(context) {
        return fcl.send(/* arguments */);
    },
    // handle the response
    onResponse: function(response) {
        fcl.decode(response).then(console.log);
    },
});
```

See [API](API.md) for the full set of supported arguments.

When specifically subscribing to events, `subscribeToEvent` is provided as a convenience wrapper for the query (wrapping `fcl.send` and `fcl.getEventsAtBlockHeightRange`) and initial processing of the response (wrapping `fcl.decode`).  This module also provides `subscribeToEvents` to subscribe to multiple events in a single subscription.

```js
import * as fcl from '@onflow/fcl';
import { subscribeToEvents } from 'fcl-subscribe';

fcl.config(/* arguments */);

subscribeToEvents({
    fcl: fcl, // fcl is injected
    events: [/* list of event types to subscribe to */],
    onEvent: console.log,
});
```

See [`demo-subscribe-to-events.js`](demo/demo-subscribe-to-events.js) for working sample.  The demo can be run using:

```
npm run demo
```

### Debugging

This module uses [`debug`](https://github.com/debug-js/debug) for optional logging.  To enable, set `DEBUG=fcl-subscribe`.
