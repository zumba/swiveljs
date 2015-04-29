/* globals Swivel */
;(function() {
    "use strict";

    /**
     * Swivel test suite
     */
    describe("Swivel", function() {
        describe("Constructor", function() {
            it("should allow the use of 'new'", function() {
                expect(new Swivel() instanceof Swivel).toBe(true);
            });

            it("creates a new instance if called like a function", function() {
                /* jshint newcap: false */
                expect(Swivel() instanceof Swivel).toBe(true);
                /* jshint newcap: true */
            });
        });
    });
}());
