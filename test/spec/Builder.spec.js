/* globals Swivel */
;(function() {
    "use strict";

    /**
     * Builder test suite
     */
    describe("Builder", function() {
        var Builder = Swivel.Builder;
        var Behavior = Swivel.Behavior;

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
        describe("addValue", function() {
            it("will not add disabled values", function() {
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var behavior = jasmine.createSpyObj("Behavior", [ "execute" ]);
                var builder = new Builder("Test", bucket);
                var getBehavior = spyOn(builder, "getBehavior");

                getBehavior.and.returnValue(behavior);
                bucket.enabled.and.returnValue(false);

                builder.addValue("a", "test");

                expect(getBehavior).toHaveBeenCalledWith("a", jasmine.any(Function));
                expect(bucket.enabled).toHaveBeenCalledWith(behavior);
                expect(behavior.execute).not.toHaveBeenCalled();
                expect(builder.behavior).toBeNull();
                expect(builder.args).toEqual([]);
            });
            it("will add an enabled behavior", function() {
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var behavior = jasmine.createSpyObj("Behavior", [ "execute" ]);
                var builder = new Builder("Test", bucket);
                var getBehavior = spyOn(builder, "getBehavior");

                getBehavior.and.returnValue(behavior);
                bucket.enabled.and.returnValue(true);

                builder.addValue("a", "test");

                expect(getBehavior).toHaveBeenCalledWith("a", jasmine.any(Function));
                expect(bucket.enabled).toHaveBeenCalledWith(behavior);
                expect(behavior.execute).not.toHaveBeenCalled();
                expect(builder.behavior).toBe(behavior);
                expect(builder.args).toEqual([]);
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
        describe("defaultValue", function() {
            it("will add a default value", function() {
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var behavior = jasmine.createSpyObj("Behavior", [ "execute" ]);
                var builder = new Builder("Test", bucket);
                var getBehavior = spyOn(builder, "getBehavior");

                getBehavior.and.returnValue(behavior);

                builder.defaultValue("test");

                expect(getBehavior).toHaveBeenCalledWith(jasmine.any(Function));
                expect(bucket.enabled).not.toHaveBeenCalled();
                expect(behavior.execute).not.toHaveBeenCalled();
                expect(builder.behavior).toBe(behavior);
                expect(builder.args).toEqual([]);
            });
        });
        describe("getBehavior", function() {
            it("should get a behavior", function() {
                var builder = new Builder("Test", {});
                var behavior = builder.getBehavior("a", function() {});

                expect(behavior instanceof Behavior).toBe(true);
                expect(behavior.slug).toBe("Test.a");
            });
            it("should accept functions returning falsey values", function() {
                var builder = new Builder("Test", {});
                var behavior = builder.getBehavior("a", function() { return 0; });

                expect(behavior instanceof Behavior).toBe(true);
                expect(behavior.execute()).toBe(0);
            });
        });
    });
}());
