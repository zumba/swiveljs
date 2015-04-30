/* globals Swivel */
;(function() {
    "use strict";

    /**
     * Behavior test suite
     */
    describe("Behavior", function() {
        var Behavior = Swivel.Behavior;

        describe("execute", function() {
            it("should call the strategy with the arguments provided", function() {
                var strategy = jasmine.createSpy("strategy").and.returnValue(123);
                var behavior = new Behavior("test", strategy);

                expect(behavior.execute(["a", "b"])).toBe(123);
                expect(strategy).toHaveBeenCalledWith("a", "b");
            });
        });
    });
}());
