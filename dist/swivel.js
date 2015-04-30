;(function SwivelJS(undefined) {
    'use strict';
    /**
     * SwivelJS v0.0.1 - 2015-04-30
     * Strategy driven, segmented feature toggles
     *
     * Copyright (c) 2015 Zumba&reg;
     * Licensed MIT
     */
    /* jshint freeze: false */
    /* jshint maxcomplexity: 9 */
    
    // Production steps of ECMA-262, Edition 5, 15.4.4.21
    // Reference: http://es5.github.io/#x15.4.4.21
    if (!Array.prototype.reduce) {
      Array.prototype.reduce = function(callback /*, initialValue*/) {
        if (this === null || this === undefined) {
          throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if (typeof callback !== 'function') {
          throw new TypeError(callback + ' is not a function');
        }
        var t = Object(this), len = t.length >>> 0, k = 0, value;
        if (arguments.length === 2) {
          value = arguments[1];
        } else {
          while (k < len && !(k in t)) {
            k++;
          }
          if (k >= len) {
            throw new TypeError('Reduce of empty array with no initial value');
          }
          value = t[k++];
        }
        for (; k < len; k++) {
          if (k in t) {
            value = callback(value, t[k], k, t);
          }
        }
        return value;
      };
    }
    
    /* jshint freeze: true */
    /* jshint maxcomplexity: 6 */
    
    /**
     * Native reduce
     *
     * @type Function
     */
    var reduce = Array.prototype.reduce;
    
    /**
     * @type Function
     */
    var toString = Object.prototype.toString;
    
    /**
     * Is array?
     *
     * @param mixed a
     * @return Boolean
     */
    var isArray = function isArray(a) {
        return toString.call(a) === '[object Array]';
    };
    
    
    /**
     * Behavior constructor
     */
    var Behavior = function Behavior() {
    
    };
    
    
    /**
     * Bucket constructor
     */
    var Bucket = function Bucket() {
    
    };
    
    /**
     * Ordinal Bitmasks
     */
    Bucket.FIRST = 1;
    Bucket.SECOND = 2;
    Bucket.THIRD = 4;
    Bucket.FOURTH = 8;
    Bucket.FIFTH = 16;
    Bucket.SIXTH = 32;
    Bucket.SEVENTH = 64;
    Bucket.EIGHTH = 128;
    Bucket.NINTH = 256;
    Bucket.TENTH = 512;
    Bucket.ALL = 1023;
    
    
    /**
     * Builder constructor
     */
    var Builder = function Builder() {
    
    };
    
    /**
     * Slug used when one is not provided
     *
     * @type String
     */
    Builder.DEFAULT_SLUG = '__swivel_default';
    
    /**
     * Builder prototype
     */
    var BuilderPrototype = Builder.prototype;
    
    /**
     * Create and return a new Behavior.
     *
     * If strategy is not a function, it will be wraped in a closure that returns the strategy.
     *
     * @param string slug
     * @param mixed strategy
     * @return Behavior
     */
    BuilderPrototype.getBehavior = function getBehavior(slug, strategy) {
        if (!strategy) {
            strategy = slug;
            slug = Builder.DEFAULT_SLUG;
        }
    
        if (typeof strategy !== 'function') {
            strategy = getAnonymousStrategy(strategy);
        }
        slug = this.slug + FeatureMap.DELIMITER + slug;
        return new Behavior(slug, strategy);
    };
    
    /**
     * Wrapper for an anonymous strategy
     *
     * @param mixed value
     * @return Function
     */
    var getAnonymousStrategy = function getAnonymousStrategy(value) {
        return function anonymousStrategy() {
            return value;
        };
    };
    
    
    /**
     * FeatureMap constructor
     *
     * @param Object map
     */
    var FeatureMap = function FeatureMap(map) {
        this.map = FeatureMap.parse(map);
    };
    
    FeatureMap.DELIMITER = '.';
    
    
    /**
     * FeatureMap prototype
     */
    var FeatureMapPrototype = FeatureMap.prototype;
    
    /**
     * Parse a human readable map into a map of bitmasks
     *
     * @param Object map
     * @return Object
     */
    FeatureMap.parse = function parse(map) {
        var parsed = {};
        var key, list;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                list = map[key];
                parsed[key] = isArray(list) ? list.reduce(bitmaskIterator, 0) : list;
            }
        }
        return parsed;
    };
    
    /**
     * Merge this map with another map and return a new one.
     *
     * Values in map param will be added to values in this instance. Any number of additional maps may
     * be passed to this method, i.e. map.add(map2, map3, map4, ...);
     *
     * @param FeatureMap featureMap
     * @return FeatureMap
     */
    FeatureMapPrototype.add = function add(/* map1, map2, ... */) {
        return new FeatureMap(reduce.call(arguments, combineMasks, this.map));
    };
    
    /**
     * Check if a feature slug is enabled for a particular bucket index
     *
     * @param String slug
     * @param Number index
     * @return Boolean
     */
    FeatureMapPrototype.enabled = function enabled(slug, index) {
        var map = this.map;
        var key = '';
        var DELIMITER = FeatureMap.DELIMITER;
        var list = slug.split(DELIMITER);
        var length = list.length;
        var i = 0;
        var child;
    
        index = 1 << index - 1;
    
        for (; i < length; i++) {
            child = list[i];
            key += key ? DELIMITER + child : child;
            if (!map[key] || !(map[key] & index)) {
                return false;
            }
        }
        return true;
    };
    
    /**
     * Used to reduce masks when adding maps.
     *
     * @param Object data
     * @param FeatureMap featureMap
     * @return Object
     */
    var combineMasks = function(data, featureMap) {
        var key, mask;
        var map = featureMap.map;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                mask = map[key];
                data[key] = data[key] ? data[key] | mask : mask;
            }
        }
        return data;
    };
    
    /**
     * Used by reduceToBitmask
     *
     * @param Number mask
     * @param Number index
     * @return Number
     */
    var bitmaskIterator = function bitmaskIterator(mask, index) {
        return mask | 1 << --index;
    };
    
    
    /**
     * Swivel constructor
     */
    var Swivel = function Swivel(config) {
        if (!(this instanceof Swivel)) {
            return new Swivel(config);
        }
        if (!config) {
            config = {};
        }
        var map = config.map || {};
        var featureMap = map instanceof FeatureMap ? map : new FeatureMap(map);
        this.bucket = new Bucket(featureMap, config.bucketIndex);
    };
    
    /**
     * Swivel prototype
     */
    var SwivelPrototype = Swivel.prototype;
    
    /**
     * Create a new Builder instance
     *
     * @param String slug
     * @return Builder
     */
    SwivelPrototype.forFeature = function forFeature(slug) {
        return new Builder(slug, this.bucket);
    };
    
    SwivelPrototype.invoke = function invoke() {
    
    };
    
    SwivelPrototype.setBucket = function setBucket() {
    
    };
    
    /**
     * Individual constructors
     */
    Swivel.Behavior = Behavior;
    Swivel.Bucket = Bucket;
    Swivel.Builder = Builder;
    Swivel.FeatureMap = FeatureMap;
    
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