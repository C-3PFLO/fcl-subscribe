## Functions

<dl>
<dt><a href="#subscribe">subscribe(options)</a> ⇒ <code>function</code></dt>
<dd><p>Subscribe to an <code>@onflow/fcl</code> request across a range of block heights, including newly created blocks.</p>
</dd>
<dt><a href="#subscribeToEvent">subscribeToEvent(options)</a> ⇒ <code>function</code></dt>
<dd><p>Subscribe to an <code>fcl.getEventsAtBlockHeightRange</code> request across a range of block heights, including newly created blocks.</p>
</dd>
<dt><a href="#subscribeToEvents">subscribeToEvents(options)</a> ⇒ <code>function</code></dt>
<dd><p>Subscribe to a list of <code>fcl.getEventsAtBlockHeightRange</code> requests across a range of block heights, including newly created blocks.</p>
</dd>
</dl>

<a name="subscribe"></a>

## subscribe(options) ⇒ <code>function</code>
Subscribe to an `@onflow/fcl` request across a range of block heights, including newly created blocks.

**Kind**: global function  
**Returns**: <code>function</code> - unsubscribe  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.block | <code>function</code> |  | `fcl.block` function, used to determing current block height |
| options.getQuery | <code>function</code> |  | an `fcl.send` function, called with the current block context to query the next range |
| options.onResponse | <code>function</code> |  | response handler, which should call `fcl.decode` to parse the response data.  If the response handler is asynchronous it can return a promise to wait for the handle to complete. |
| [options.onError] | <code>function</code> |  | error handler |
| [options.range] | <code>Integer</code> | <code>249</code> | block range to query per iteration |
| [options.fromBlockHeight] | <code>Integer</code> | <code>&lt;current&gt;</code> | starting block height |
| [options.sleepTime] | <code>Integer</code> | <code>60000</code> | time to sleep between iterations when remaining blocks <= 250 (ie: reading from blocks as they are finalized).  When remaining blocks > 250, sleep time is 1000ms. |
| [options.abortOnError] | <code>Boolean</code> | <code>false</code> | abort subscription on error |

<a name="subscribeToEvent"></a>

## subscribeToEvent(options) ⇒ <code>function</code>
Subscribe to an `fcl.getEventsAtBlockHeightRange` request across a range of block heights, including newly created blocks.

**Kind**: global function  
**Returns**: <code>function</code> - unsubscribe  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.fcl | <code>Object</code> |  | `@onflow/fcl` module |
| options.event | <code>String</code> |  | event type to subscribe to |
| options.onEvent | <code>function</code> |  | called once per event |
| [options.onError] | <code>function</code> |  | error handler |
| [options.range] | <code>Integer</code> | <code>249</code> | block range to query per iteration |
| [options.fromBlockHeight] | <code>Integer</code> | <code>&lt;current&gt;</code> | starting block height |
| [options.sleepTime] | <code>Integer</code> | <code>1000</code> | time to sleep between iterations |
| [options.abortOnError] | <code>Boolean</code> | <code>false</code> | abort subscription on error |

<a name="subscribeToEvents"></a>

## subscribeToEvents(options) ⇒ <code>function</code>
Subscribe to a list of `fcl.getEventsAtBlockHeightRange` requests across a range of block heights, including newly created blocks.

**Kind**: global function  
**Returns**: <code>function</code> - unsubscribe  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.fcl | <code>Object</code> |  | `@onflow/fcl` module |
| options.events | <code>Array</code> |  | array of event types to subscribe to |
| options.onEvent | <code>function</code> |  | called once per event (for any event) |
| [options.onError] | <code>function</code> |  | error handler |
| [options.range] | <code>Integer</code> | <code>249</code> | block range to query per iteration |
| [options.fromBlockHeight] | <code>Integer</code> | <code>&lt;current&gt;</code> | starting block height |
| [options.sleepTime] | <code>Integer</code> | <code>1000</code> | time to sleep between iterations |
| [options.abortOnError] | <code>Boolean</code> | <code>false</code> | abort subscription on error |

