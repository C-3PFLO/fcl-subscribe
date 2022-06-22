/* global setTimeout */

const debug = require('debug')('fcl-subscribe');

const SleepTimes = {
    SLOW: 60000,
    FAST: 1000,
};

/**
* Subscribe to an `@onflow/fcl` request across a range of block heights, including newly created blocks.
* @public
* @param {Object} options
* @param {Function} options.block `fcl.block` function, used to determing current block height
* @param {Function} options.getQuery an `fcl.send` function, called with the current block context to query the next range
* @param {Function} options.onResponse response handler, which should call `fcl.decode` to parse the response data.  If the response handler is asynchronous it can return a promise to wait for the handle to complete.
* @param {Function} [options.onError] error handler
* @param {Integer} [options.range = 249] block range to query per iteration
* @param {Integer} [options.fromBlockHeight = <current>] starting block height
* @param {Integer} [options.sleepTime = 60000] time to sleep between iterations when remaining blocks <= 250 (ie: reading from blocks as they are finalized).  When remaining blocks > 250, sleep time is 1000ms.
* @param {Boolean} [options.abortOnError = false] abort subscription on error
* @return {Function} unsubscribe
*/
function subscribe(options) {
    debug('initializing for options: %O', options);

    const context = {
        event: options.event,
        fromBlockHeight: options.fromBlockHeight,
        range: options.range || 249,
        abortOnError: typeof options.abortOnError === 'undefined' ?
            false : options.abortOnError,
    };

    /**
    * @private
    */
    function _loop() {
        if (context.stop) return;
        options.block({ sealed: true })
            .then((response) => {
                context.height = response.height;
                // if no fromBlockHeight was provided, start from context.height
                // this will result in remaining = 0 which will skip and wait
                // for new blocks to be created
                context.fromBlockHeight = typeof context.fromBlockHeight !== 'undefined' ?
                    context.fromBlockHeight : context.height;
                context.remaining = context.height - context.fromBlockHeight;
                context.toBlockHeight = context.fromBlockHeight;
                if (context.remaining >= context.range) {
                    context.sleepTime = SleepTimes.FAST;
                    context.toBlockHeight += context.range;
                } else {
                    context.sleepTime = options.sleepTime || SleepTimes.SLOW;
                    context.toBlockHeight += context.remaining;
                }
                if (context.remaining > 0) {
                    debug('querying %s fromBlockHeight=%d toBlockHeight=%d (remaining=%d)',
                        context.event || '',
                        context.fromBlockHeight,
                        context.toBlockHeight,
                        context.remaining,
                    );
                    return options.getQuery(context)
                        .then((response) => {
                            return options.onResponse(response);
                        })
                        .then(() => {
                            context.fromBlockHeight = context.toBlockHeight + 1;
                        });
                } else {
                    debug('remaining=%d for block height=%d',
                        context.remaining,
                        context.height,
                    );
                    return Promise.resolve();
                }
            })
            .catch((error) => {
                if (options.onError) {
                    options.onError(error);
                } else {
                    debug('%O', error);
                }
                if (context.abortOnError) {
                    debug('stopping on next loop');
                    context.stop = true;
                }
            })
            .then(() => {
                if (!context.stop) {
                    setTimeout(_loop, context.sleepTime);
                }
            });
    }
    _loop();

    return function() {
        debug('stopping on next loop');
        context.stop = true;
    };
}

/**
* Subscribe to an `fcl.getEventsAtBlockHeightRange` request across a range of block heights, including newly created blocks.
* @public
* @param {Object} options
* @param {Object} options.fcl `@onflow/fcl` module
* @param {String} options.event event type to subscribe to
* @param {Function} options.onEvent called once per event
* @param {Function} [options.onError] error handler
* @param {Integer} [options.range = 249] block range to query per iteration
* @param {Integer} [options.fromBlockHeight = <current>] starting block height
* @param {Integer} [options.sleepTime = 1000] time to sleep between iterations
* @param {Boolean} [options.abortOnError = false] abort subscription on error
* @return {Function} unsubscribe
*/
function subscribeToEvent(options) {
    const _options = {
        block: options.fcl.block,
        event: options.event,
        getQuery: function(context) {
            return options.fcl.send([
                options.fcl.getEventsAtBlockHeightRange(
                    options.event,
                    context.fromBlockHeight,
                    context.toBlockHeight,
                ),
            ]);
        },
        onResponse: function(response) {
            return options.fcl.decode(response)
                .then((events) => {
                    events.forEach((event) => {
                        options.onEvent(event);
                    });
                });
        },
    };
    if (options.onError) _options.onError = options.onError;
    if (options.range) _options.range = options.range;
    if (options.sleepTime) _options.sleepTime = options.sleepTime;
    if (options.abortOnError) _options.abortOnError = options.abortOnError;
    if (options.fromBlockHeight) {
        _options.fromBlockHeight = options.fromBlockHeight;
    }

    return subscribe(_options);
}

/**
* Subscribe to a list of `fcl.getEventsAtBlockHeightRange` requests across a range of block heights, including newly created blocks.
* @public
* @param {Object} options
* @param {Object} options.fcl `@onflow/fcl` module
* @param {Array} options.events array of event types to subscribe to
* @param {Function} options.onEvent called once per event (for any event)
* @param {Function} [options.onError] error handler
* @param {Integer} [options.range = 249] block range to query per iteration
* @param {Integer} [options.fromBlockHeight = <current>] starting block height
* @param {Integer} [options.sleepTime = 1000] time to sleep between iterations
* @param {Boolean} [options.abortOnError = false] abort subscription on error
* @return {Function} unsubscribe
*/
function subscribeToEvents(options) {
    const unsubscribes = [];
    options.events.forEach((next) => {
        const localOptions = Object.assign({}, options);
        localOptions.event = next;
        unsubscribes.push(
            subscribeToEvent(localOptions),
        );
    });
    return function() {
        unsubscribes.forEach((next) => {
            next();
        });
    };
}

export {
    subscribe,
    subscribeToEvent,
    subscribeToEvents,
};
