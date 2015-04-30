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
        describe("diff", function() {
            it("should find the diff between two maps and return a new map", function() {
                var map1 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map2 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map1.diff(map2).map).toEqual({});

                var map3 = new FeatureMap({ a : [1,2], b : [4,5,6] });
                var map4 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map3.diff(map4).map).toEqual({
                    a : Bucket.FIRST | Bucket.SECOND | Bucket.THIRD
                });

                var map5 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map6 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map5.diff(map6).map).toEqual({ c : Bucket.SEVENTH });

                var map7 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map8 = new FeatureMap({ a : [1,2,3], b : [4,5,6], d : [1] });
                expect(map7.diff(map8).map).toEqual({ d : Bucket.FIRST });

                var map9 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map10 = new FeatureMap({ a : [1,2,3], b : [4,5,6], d : [1] });
                expect(map9.diff(map10).map).toEqual({
                    c : Bucket.SEVENTH,
                    d : Bucket.FIRST
                });

                var map11 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map12 = new FeatureMap({ a : [], b : [] });
                expect(map11.diff(map12).map).toEqual({ a : 0, b : 0 });

            });
        });
        describe("enabled", function() {
            it("should compare the slug to the map and indicate if the feature is enabled", function() {
                var map1 = new FeatureMap({
                    "Test" : [1], "Test.version" : [1], "Test.version.a" : [1]
                });
                expect(map1.enabled("Test", 1)).toBe(true);
                expect(map1.enabled("Test.version", 1)).toBe(true);
                expect(map1.enabled("Test.version.a", 1)).toBe(true);

                var map2 = new FeatureMap({
                    "Test" : [1], "Test.version" : [1], "Test.version.a" : []
                });
                expect(map2.enabled("Test", 1)).toBe(true);
                expect(map2.enabled("Test.version", 1)).toBe(true);
                expect(map2.enabled("Test.version.a", 1)).toBe(false);

                var map3 = new FeatureMap({
                    "Test" : [], "Test.version" : [1], "Test.version.a" : [1]
                });
                expect(map3.enabled("Test", 1)).toBe(false);
                expect(map3.enabled("Test.version", 1)).toBe(false);
                expect(map3.enabled("Test.version.a", 1)).toBe(false);

                var map4 = new FeatureMap({
                    "Test" : [1], "Test.version" : [], "Test.version.a" : [1]
                });
                expect(map4.enabled("Test", 1)).toBe(true);
                expect(map4.enabled("Test.version", 1)).toBe(false);
                expect(map4.enabled("Test.version.a", 1)).toBe(false);

                var map5 = new FeatureMap({
                    "Test" : [], "Test.version" : [], "Test.version.a" : []
                });
                expect(map5.enabled("Test", 1)).toBe(false);
                expect(map5.enabled("Test.version", 1)).toBe(false);
                expect(map5.enabled("Test.version.a", 1)).toBe(false);

                var map6 = new FeatureMap({
                    "Test" : [2,3,5], "Test.version" : [2,3], "Test.version.a" : [3]
                });
                expect(map6.enabled("Test", 1)).toBe(false);
                expect(map6.enabled("Test", 2)).toBe(true);
                expect(map6.enabled("Test", 3)).toBe(true);
                expect(map6.enabled("Test", 5)).toBe(true);
                expect(map6.enabled("Test.version", 1)).toBe(false);
                expect(map6.enabled("Test.version", 2)).toBe(true);
                expect(map6.enabled("Test.version", 3)).toBe(true);
                expect(map6.enabled("Test.version", 5)).toBe(false);
                expect(map6.enabled("Test.version.a", 1)).toBe(false);
                expect(map6.enabled("Test.version.a", 2)).toBe(false);
                expect(map6.enabled("Test.version.a", 3)).toBe(true);
                expect(map6.enabled("Test.version.a", 5)).toBe(false);
            });
        });
    });
}());
