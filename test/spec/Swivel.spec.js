/* globals Swivel */
;(function() {
    "use strict";

    /**
     * Swivel test suite
     */
    describe("Swivel", function() {
        var Builder = Swivel.Builder;

        describe("Constructor", function() {
            it("should allow the use of 'new'", function() {
                expect(new Swivel() instanceof Swivel).toBe(true);
            });

            it("creates a new instance if called like a function", function() {
                /* jshint newcap: false */
                expect(Swivel() instanceof Swivel).toBe(true);
                /* jshint newcap: true */
            });
            it("should have a bucket with an empty callback function", function() {
                var swivel = new Swivel({
                    callback : function () {
                        return "Test";
                    }
                });
                expect(swivel.bucket.callback()).toBe("Test");
            });
            it("should have a bucket with a valid callback function", function() {
                var swivel = new Swivel();
                expect(swivel.bucket.callback()).toBe(undefined);
            });
        });
        describe("returnValue", function() {
            it("should equal to default value", function() {
                var swivel = new Swivel();
                expect(swivel.returnValue("slug", "custom", "default")).toBe("default");
            });
            it("should equal to custom value", function() {
                var swivel = new Swivel();
                var forFeature = spyOn(swivel, [ "forFeature" ]);
                var bucket = jasmine.createSpyObj("Bucket", [ "enabled" ]);
                var builder = new Builder("Test", bucket);

                bucket.enabled.and.returnValue(true);
                forFeature.and.returnValue(builder);
                expect(swivel.returnValue("slug", "custom", "default")).toBe("custom");
            });
        });
    });
}());
