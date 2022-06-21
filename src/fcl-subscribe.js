/* global setTimeout */

const debug = require('debug')('fcl-subscribe');

/**
* Subscribe an @onflow/fcl request across a range of block heights, including
* newly created blocks.
* @public
* @param {Object} options
* @param {Function} options.block fcl.block function
* @param {Function} options.getQuery an fcl.send function, called with the current
* block context to query the next range
* @param {Function} options.onResponse response handler, which should call fcl.decode
* to parse the response data
* @param {Function} [options.onError] error handler
* @param {Integer} [options.range = 249] block range to query per iteration
* @param {Integer} [options.fromBlockHeight = <current>] starting block height
* @param {Integer} [options.sleepTime = 1000] time to sleep between iterations
* @param {Boolean} [options.abortOnError = false] abort subscription on error
* @return {Function} unsubscribe
*/
function subscribe(options) {
    debug('initializing subscription for options: %O', options);

    const context = {
        fromBlockHeight: options.fromBlockHeight,
        range: options.range || 249,
        sleepTime: options.sleepTime || 1000,
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
                context.toBlockHeight = context.fromBlockHeight +
                    (context.remaining >= context.range ?
                        context.range : context.remaining);
                if (context.remaining > 0) {
                    debug('querying fromBlockHeight=%d toBlockHeight=%d (remaining=%d)',
                        context.fromBlockHeight,
                        context.toBlockHeight,
                        context.remaining,
                    );
                    return options.getQuery(context)
                        .then((response) => {
                            options.onResponse(response);
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

export default subscribe;
