# fcl-subscribe

Mixin for `@onflow/fcl` to enable subscribing to blockchain events

```js
import * as fcl from '@onflow/fcl';
import * as subscribe from 'fcl-subscribe';

// mixin polling
Object.assign(fcl, subscribe);

// use standard fcl methods
fcl.config(/* options */);

// use mixed-in method to subscribe
fcl.subscribe(/* options */);
```
