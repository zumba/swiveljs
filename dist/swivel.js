;(function SwivelJS(undefined) {
    'use strict';
    /**
     * SwivelJS v0.0.1 - 2015-04-29
     * Strategy driven, segmented feature toggles
     *
     * Copyright (c) 2015 Zumba&reg;
     * Licensed MIT
     */
    
    
    /**
     * Swivel constructor
     */
    var Swivel = function Swivel(config) {
        if (!(this instanceof Swivel)) {
            return new Swivel(config);
        }
    };
    
    /**
     * Swivel prototype
     */
    var proto = Swivel.prototype;
    
    /**
     * Create a new Builder instance
     *
     * @param String $slug
     * @return Builder
     */
    proto.forFeature = function forFeature() { };
    proto.invoke = function invoke() { };
    proto.setBucket = function setBucket() { };
    
    /**
     * Exports script adapted from lodash v2.4.1 Modern Build
     *
     * @see http://lodash.com/
     */
    
    /**
     * Valid object type map
     *
     * @type Object
     */
    var objectTypes = {
        'function' : true,
        'object' : true
    };
    
    (function exportSwivel(root) {
    
        /**
         * Free variable exports
         *
         * @type Function
         */
        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    
        /**
         * Free variable module
         *
         * @type Object
         */
        var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    
        /**
         * CommonJS module.exports
         *
         * @type Function
         */
        var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
    
        /**
         * Free variable `global`
         *
         * @type Object
         */
        var freeGlobal = objectTypes[typeof global] && global;
        if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
            root = freeGlobal;
        }
    
        /**
         * Export
         */
        if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
            root.Swivel = Swivel;
            define(function defineSwivel() { return Swivel; });
        } else if (freeExports && freeModule) {
            if (moduleExports) {
                (freeModule.exports = Swivel).Swivel = Swivel;
            } else {
                freeExports.Swivel = Swivel;
            }
        } else {
            root.Swivel = Swivel;
        }
    }((objectTypes[typeof window] && window) || this));
    
}.call(this));