# fcl-subscribe

Subscribe to Flow blockchain events.

## Motivation

The `fcl.send()` function ([link](https://docs.onflow.org/fcl/reference/api/#send)) "*sends arbitrary scripts, transactions, and requests to Flow*".  Clients can use `fcl.send()` with the `fcl.getEventsAtBlockHeightRange()` function ([link](https://docs.onflow.org/fcl/reference/api/#geteventsatblockheightrange)) to get "*all instances of a particular event (by name) within a height range*".

However, `fcl.getEventsAtBlockHeightRange()` is limited to a single block range, "*the block range provided must be 250 blocks or lower per request.*" and `fcl.send()` only sends the request once.  There is no `@onflow/fcl` method to subscribe to all events of a certain type across a larger block range, including as new blocks are created.

This module implements `subscribe()` which allows clients to crawl the blockchain, making the same `fcl.getEventsAtBlockHeightRange()` call across many block ranges (250 blocks at a time).  It also supports live polling as new blocks are created.

*NOTE: while this module was designed for `fcl.getEventsAtBlockHeightRange()`, it can be used for any request that crawls the blocks.*

## Usage

```js
import * as fcl from '@onflow/fcl';
import * as subscribe from 'fcl-subscribe';

// use standard fcl methods
fcl.config( /*arguments*/ );

// subscribe, caching the unsubscribe function
const unsubscribe = subscribe({
    block: fcl.block,
    getQuery: function(context) {
        return fcl.send([
            fcl.getEventsAtBlockHeightRange(
                eventName: 'MyEvent',
                fromBlockHeight: context.fromBlockHeight,
                toBlockHeight: context.toBlockHeight,
            ),
        ]);
    },
    onResponse: function(response) {
        fcl.decode(response).then(console.log);
    },
    onError: console.error
});
```
