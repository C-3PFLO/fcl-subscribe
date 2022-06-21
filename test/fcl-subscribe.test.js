import { subscribe } from '../src/fcl-subscribe';

describe('fcl-subscribe', () => {
    let height;
    let mockFcl;

    beforeEach(() => {
        height = 1000;
        // TODO: replace with proper mock
        mockFcl = {
            block: function() {
                return Promise.resolve({ height: height });
            },
            send: function() {
                return Promise.resolve({ some: 'data' });
            },
        };
    });
    it('nominal', (done) => {
        let calls = 0;
        const unsubscribe = subscribe({
            fromBlockHeight: 0,
            block: mockFcl.block,
            getQuery: function(context) {
                if (calls === 0) {
                    expect(context).toEqual({
                        range: 249,
                        fromBlockHeight: 0,
                        sleepTime: 1000,
                        abortOnError: false,
                        height: 1000,
                        remaining: 1000,
                        toBlockHeight: 249,
                    });
                    // increment height
                    height = 1100;
                } else if (calls === 1) {
                    expect(context).toEqual({
                        range: 249,
                        fromBlockHeight: 250,
                        sleepTime: 1000,
                        abortOnError: false,
                        height: 1100,
                        remaining: 850,
                        toBlockHeight: 499,
                    });
                    // increment height
                    height = 1300;
                } else {
                    expect(context).toEqual({
                        range: 249,
                        fromBlockHeight: 500,
                        sleepTime: 1000,
                        abortOnError: false,
                        height: 1300,
                        remaining: 800,
                        toBlockHeight: 749,
                    });
                }
                calls++;
                return mockFcl.send();
            },
            onResponse: function(response) {
                expect(response).toEqual({ some: 'data' });
                if (calls === 2) {
                    unsubscribe();
                    done();
                }
            },
        });
    });
    it('remaining <= range', (done) => {
        const unsubscribe = subscribe({
            fromBlockHeight: 950,
            block: mockFcl.block,
            getQuery: function(context) {
                expect(context).toEqual({
                    range: 249,
                    fromBlockHeight: 950,
                    sleepTime: 1000,
                    abortOnError: false,
                    height: 1000,
                    remaining: 50,
                    toBlockHeight: 1000,
                });
                return mockFcl.send();
            },
            onResponse: function(response) {
                expect(response).toEqual({ some: 'data' });
                unsubscribe();
                done();
            },
        });
    });
    it('fromBlockHeight === undefined', (done) => {
        let calls = 0;
        const unsubscribe = subscribe({
            // no fromBlockHeight
            block: function() {
                if (calls === 0) {
                    height = 1000;
                    calls++;
                } else {
                    height = 1100;
                }
                return Promise.resolve({
                    height: height,
                });
            },
            getQuery: function(context) {
                expect(calls).toEqual(1);
                expect(context).toEqual({
                    range: 249,
                    fromBlockHeight: 1000,
                    sleepTime: 1000,
                    abortOnError: false,
                    height: 1100,
                    remaining: 100,
                    toBlockHeight: 1100,
                });
                return mockFcl.send();
            },
            onResponse: function(response) {
                expect(response).toEqual({ some: 'data' });
                unsubscribe();
                done();
            },
        });
    });
    it('block error, abortOnError === true', (done) => {
        mockFcl.block = function() {
            return Promise.reject(new Error('some error'));
        };
        subscribe({
            abortOnError: true,
            fromBlockHeight: 0,
            block: mockFcl.block,
            onError: function(error) {
                expect(error).toEqual(new Error('some error'));
                done();
            },
        });
    });
    it('send error, abortOnError === false', (done) => {
        let calls = 0;
        const unsubscribe = subscribe({
            fromBlockHeight: 0,
            block: mockFcl.block,
            getQuery: function(context) {
                if (calls === 0) {
                    expect(context).toEqual({
                        range: 249,
                        fromBlockHeight: 0,
                        sleepTime: 1000,
                        abortOnError: false,
                        height: 1000,
                        remaining: 1000,
                        toBlockHeight: 249,
                    });
                    // trigger failure
                    mockFcl.send = function() {
                        return Promise.reject(new Error('some error'));
                    };
                } else if (calls === 1) {
                    // no increment because query failed
                    expect(context).toEqual({
                        range: 249,
                        fromBlockHeight: 0,
                        sleepTime: 1000,
                        abortOnError: false,
                        height: 1000,
                        remaining: 1000,
                        toBlockHeight: 249,
                    });
                    // restore success
                    mockFcl.send = function() {
                        return Promise.resolve({ some: 'data' });
                    };
                } else {
                    // now incremented because of success
                    expect(context).toEqual({
                        range: 249,
                        fromBlockHeight: 250,
                        sleepTime: 1000,
                        abortOnError: false,
                        height: 1100,
                        remaining: 850,
                        toBlockHeight: 499,
                    });
                }
                calls++;
                return mockFcl.send();
            },
            onResponse: function(response) {
                expect(calls).not.toEqual(1); // should not call onResponse
                expect(response).toEqual({ some: 'data' });
                if (calls === 2) {
                    unsubscribe();
                    done();
                }
            },
            onError: function(error) {
                expect(calls).toEqual(1);
                expect(error).toEqual(new Error('some error'));
            },
        });
    });
});
