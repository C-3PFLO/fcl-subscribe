/* global setTimeout */

const sleepTime = 1000;
const range = 249;

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
    const context = {
        range: options.range || range,
        fromBlockHeight: options.fromBlockHeight,
        sleepTime: options.sleepTime || sleepTime,
        abortOnError: typeof options.abortOnError === 'undefined' ?
            false : options.abortOnError,
    };

    /**
    * @private
    */
    function _loop() {
        options.block(true)
            .then((response) => {
                context.height = response.height;
                // if no fromBlockHeight was provided, start from context.height
                // this will result in remaining = 0 which will skip and wait
                // for new blocks to be created
                context.fromBlockHeight = typeof context.fromBlockHeight !== 'undefined' ?
                    context.fromBlockHeight : context.height;
                context.remaining = context.height - context.fromBlockHeight;
                context.toBlockHeight = context.fromBlockHeight +
                    (context.remaining >= range ? range : context.remaining);
                if (context.remaining > 0) {
                    return options.getQuery(context)
                        .then((response) => {
                            options.onResponse(response);
                        })
                        .then(() => {
                            context.fromBlockHeight = context.toBlockHeight + 1;
                        });
                } else {
                    return Promise.resolve();
                }
            })
            .catch((error) => {
                if (options.onError) {
                    options.onError(error);
                }
                if (context.abortOnError) {
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
        context.stop = true;
    };
}

export default subscribe;
