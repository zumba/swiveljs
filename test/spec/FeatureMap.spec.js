/* globals Swivel */
;(function() {
    "use strict";

    /**
     * FeatureMap test suite
     */
    describe("FeatureMap", function() {
        var FeatureMap = Swivel.FeatureMap;

        describe("parse", function() {
            it("should parse maps into maps of bitmasks", function() {
                var map = { a :  [6, 7], "a.b" : [7] };
                var parsed = (new FeatureMap(map)).map;
                expect(parsed.a).toBe(32 | 64);
                expect(parsed["a.b"]).toBe(64);
            });
        });
        describe("add", function() {
            it("should add multiple maps together and return a new map", function() {
                var map1 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map2 = new FeatureMap({ a : [2,3,4], b : [4,5,6], d : [7] });
                var map3 = new FeatureMap({ a : [4,5], d : [9,10], e : [7] });
                var key;
                var expected = {
                    a : 1 | 2 | 4 | 8 | 16,
                    b : 8 | 16 | 32,
                    c : 64,
                    d : 64 | 256 | 512,
                    e : 64
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
                    a : 1 | 2 | 4
                });

                var map5 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map6 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map5.diff(map6).map).toEqual({ c : 64 });

                var map7 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map8 = new FeatureMap({ a : [1,2,3], b : [4,5,6], d : [1] });
                expect(map7.diff(map8).map).toEqual({ d : 1 });

                var map9 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map10 = new FeatureMap({ a : [1,2,3], b : [4,5,6], d : [1] });
                expect(map9.diff(map10).map).toEqual({
                    c : 64, d : 1
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
        describe("intersect", function() {
            it("should find the intersection between two maps and return a new map", function() {
                var map1 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map2 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map1.intersect(map2).map).toEqual({
                    a : 1 | 2 | 4,
                    b : 8 | 16 | 32
                });

                var map3 = new FeatureMap({ a : [1,2], b : [4,5,6] });
                var map4 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map3.intersect(map4).map).toEqual({
                    b : 8 | 16 | 32
                });

                var map5 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map6 = new FeatureMap({ a : [2,3,4], b : [4,5,6] });
                expect(map5.intersect(map6).map).toEqual({
                    b : 8 | 16 | 32
                });

                var map7 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map8 = new FeatureMap({ a : [1,2,3], b : [9,8,7], d : [1] });
                expect(map7.intersect(map8).map).toEqual({
                    a : 1 | 2 | 4
                });
            });
        });
        describe("merge", function() {
            it("should merge two maps and return a new map", function() {
                var map1 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map2 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map1.merge(map2).map).toEqual({
                    a : 1 | 2 | 4,
                    b : 8 | 16 | 32
                });

                var map3 = new FeatureMap({ a : [1,2], b : [4,5,6] });
                var map4 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                expect(map3.merge(map4).map).toEqual({
                    a : 1 | 2 | 4,
                    b : 8 | 16 | 32
                });

                var map5 = new FeatureMap({ a : [1,2,3], b : [4,5,6], c : [7] });
                var map6 = new FeatureMap({ a : [2,3,4], b : [4,5,6] });
                expect(map5.merge(map6).map).toEqual({
                    a : 2 | 4 | 8,
                    b : 8 | 16 | 32,
                    c : 64
                });

                var map7 = new FeatureMap({ a : [1,2,3], b : [4,5,6] });
                var map8 = new FeatureMap({ a : [1,2,3], b : [9,8,7], d : [1] });
                expect(map7.merge(map8).map).toEqual({
                    a : 1 | 2 | 4,
                    b : 256 | 128 | 64,
                    d : 1
                });
            });
        });
    });
}());
