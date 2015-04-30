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
        describe("add", function() {
            it("should add multiple maps together and return a new map", function() {
                var map1 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map2 = new FeatureMap({ a : [2,3,4], b : [4,5,6], d : [7] });
                var map3 = new FeatureMap({ a : [4,5], d : [9,10], e : [7] });
                var key;
                var expected = {
                    a : Bucket.FIRST | Bucket.SECOND | Bucket.THIRD | Bucket.FOURTH | Bucket.FIFTH,
                    b : Bucket.FOURTH | Bucket.FIFTH | Bucket.SIXTH,
                    c : Bucket.SEVENTH,
                    d : Bucket.SEVENTH | Bucket.NINTH | Bucket.TENTH,
                    e : Bucket.SEVENTH
                };
                var result = map1.add(map2, map3).map;
                for (key in expected) {
                    if (expected.hasOwnProperty(key)) {
                        expect(expected[key]).toBe(result[key]);
                    }
                }
            });
        });
    });
}());
