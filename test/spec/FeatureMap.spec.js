/* globals Swivel */
;(function() {
    "use strict";

    /**
     * FeatureMap test suite
     */
    describe("FeatureMap", function() {
        var FeatureMap = Swivel.FeatureMap;
        var Bucket = Swivel.Bucket;

        describe("parse", function() {
            it("should parse maps into maps of bitmasks", function() {
                var map = { a :  [6, 7], "a.b" : [7] };
                var parsed = FeatureMap.parse(map);
                expect(parsed.a).toBe(Bucket.SIXTH | Bucket.SEVENTH);
                expect(parsed["a.b"]).toBe(Bucket.SEVENTH);
            });
        });
    });
}());
