/* globals Swivel */
;(function() {
    "use strict";

    /**
     * Builder test suite
     */
    describe("Builder", function() {
        var Builder = Swivel.Builder;
        var Behavior = Swivel.Behavior;
        var FeatureMap = Swivel.FeatureMap;

        describe("addBehavior", function() {
            it("will not add disabled behaviors", function() {
                var strategy = function() {};
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var behavior = jasmine.createSpyObj("Behavior", [ "execute" ]);
                var builder = new Builder("Test", bucket);
                var getBehavior = spyOn(builder, "getBehavior");

                getBehavior.and.returnValue(behavior);
                bucket.enabled.and.returnValue(false);

                builder.addBehavior("a", strategy, ["test"]);

                expect(getBehavior).toHaveBeenCalledWith("a", strategy);
                expect(bucket.enabled).toHaveBeenCalledWith(behavior);
                expect(behavior.execute).not.toHaveBeenCalled();
                expect(builder.behavior).toBeNull();
                expect(builder.args).toEqual([]);
            });
            it("will add an enabled behavior", function() {
                var strategy = function() {};
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var behavior = jasmine.createSpyObj("Behavior", [ "execute" ]);
                var builder = new Builder("Test", bucket);
                var getBehavior = spyOn(builder, "getBehavior");

                getBehavior.and.returnValue(behavior);
                bucket.enabled.and.returnValue(true);

                builder.addBehavior("a", strategy, ["test"]);

                expect(getBehavior).toHaveBeenCalledWith("a", strategy);
                expect(bucket.enabled).toHaveBeenCalledWith(behavior);
                expect(behavior.execute).not.toHaveBeenCalled();
                expect(builder.behavior).toBe(behavior);
                expect(builder.args).toEqual(["test"]);
            });
        });
        describe("defaultBehavior", function() {
            it("will add a default behavior", function() {
                var strategy = function() {};
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var behavior = jasmine.createSpyObj("Behavior", [ "execute" ]);
                var builder = new Builder("Test", bucket);
                var getBehavior = spyOn(builder, "getBehavior");

                getBehavior.and.returnValue(behavior);

                builder.defaultBehavior(strategy, ["test"]);

                expect(getBehavior).toHaveBeenCalledWith(strategy);
                expect(bucket.enabled).not.toHaveBeenCalled();
                expect(behavior.execute).not.toHaveBeenCalled();
                expect(builder.behavior).toBe(behavior);
                expect(builder.args).toEqual(["test"]);
            });
        });
        describe("getBehavior", function() {
            it("should get a behavior", function() {
                var builder = new Builder("Test", {});
                var behavior = builder.getBehavior("a", function() {});

                expect(behavior instanceof Behavior).toBe(true);
                expect(behavior.slug).toBe("Test" + FeatureMap.DELIMITER + "a");
            });
        });
    });
}());
