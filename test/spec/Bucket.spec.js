/* globals Swivel */
;(function() {
    "use strict";

    /**
     * Bucket test suite
     */
    describe("Bucket", function() {
        var Bucket = Swivel.Bucket;
        var FeatureMap = Swivel.FeatureMap;
        var Behavior = Swivel.Behavior;

        describe("enabled", function() {
            it("should delegate to the injected FeatureMap", function() {
                var featureMap = new FeatureMap({ Test : [6], "Test.version" : [6] });
                var bucket = new Bucket(featureMap, 6);
                var behavior = new Behavior("Test.version", function() {});

                spyOn(featureMap, "enabled").and.callThrough();
                expect(bucket.enabled(behavior)).toBe(true);
                expect(featureMap.enabled).toHaveBeenCalledWith("Test.version", 6);
            });
        });
    });
}());
