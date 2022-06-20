# fcl-subscribe

Subscribe to Flow blockchain events.

### Motivation

The `fcl.send()` function ([link](https://docs.onflow.org/fcl/reference/api/#send)) "*sends arbitrary scripts, transactions, and requests to Flow*".  Clients can use `fcl.send()` with the `fcl.getEventsAtBlockHeightRange()` function ([link](https://docs.onflow.org/fcl/reference/api/#geteventsatblockheightrange)) to get "*all instances of a particular event (by name) within a height range*".

However, `fcl.getEventsAtBlockHeightRange()` is limited to a single block range, "*the block range provided must be 250 blocks or lower per request*" and `fcl.send()` only sends the request once.  There is no `@onflow/fcl` method to subscribe to all events of a certain type across a larger block range, including as new blocks are created.

This module implements `subscribe()` which allows clients to make the same `fcl.getEventsAtBlockHeightRange()` call across many block ranges (250 blocks at a time), including previous blocks and live polling as new blocks are created.

*NOTE: while this module was designed for `fcl.getEventsAtBlockHeightRange()`, it can be used for any `fcl` request of a given block range.*

### Usage

```js
import * as fcl from '@onflow/fcl';
import subscribe from './fcl-subscribe';

fcl.config(/* arguments */)

subscribe({
    block: fcl.block,
    getQuery: function(context) {
        return fcl.send(/* arguments */);
    },
    onResponse: function(response) {
        fcl.decode(response).then(console.log);
    },
});
```

See [`demo.js`](demo/demo.js) for working sample and [`fcl-subscribe`](src/fcl-subscribe.js) for the full set of available options.
