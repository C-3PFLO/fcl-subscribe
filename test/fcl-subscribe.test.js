import * as subscribe from '../src/fcl-subscribe';

describe('fcl-subscribe', () => {
    describe('mixin', () => {
        const fcl = {
            someProperty: 'someData',
            someFunction: function() {},
        };
        it('Object.assign', () => {
            Object.assign(fcl, subscribe);
            expect(fcl.someProperty).toBeDefined();
            expect(fcl.someFunction).toBeDefined();
            expect(fcl.subscribe).toBeDefined();
        });
    });
});
