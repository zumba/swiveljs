;(function SwivelJS(undefined) {
    'use strict';
    /**
     * SwivelJS v0.1.1 - 2018-04-23
     * Strategy driven, segmented feature toggles
     *
     * Copyright (c) 2018 Zumba&reg;
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
     * Delimiter
     *
     * @type String
     */
    var DELIMITER = '.';
    
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
     *
     * @param String slug
     * @param Function strategy
     */
    var Behavior = function Behavior(slug, strategy) {
        this.slug = slug;
        this.strategy = strategy;
    };
    
    /**
     * Execute the behavior's strategy and return the result
     *
     * @param array args
     * @return mixed
     */
    Behavior.prototype.execute = function execute(args) {
        return this.strategy.apply(null, args || []);
    };
    
    
    /**
     * Bucket constructor
     */
    var Bucket = function Bucket(featureMap, index) {
        this.featureMap = featureMap;
        this.index = index;
    };
    
    /**
     * Check if a behavior is enabled for a particular context/bucket combination
     *
     * @param Behavior behavior
     * @return boolean
     */
    Bucket.prototype.enabled = function enabled(behavior) {
        return this.featureMap.enabled(behavior.slug, this.index);
    };
    
    
    /**
     * Set the behavior and args.
     *
     * @param Behavior behavior
     * @param array args
     */
    var setBehavior = function setBehavior(behavior, args) {
        this.behavior = behavior || null;
        this.args = args || [];
    };
    
    /**
     * Builder constructor
     *
     * @param String slug
     * @param Bucket bucket
     */
    var Builder = function Builder(slug, bucket) {
        this.slug = slug;
        this.bucket = bucket;
        this.waived = false;
        setBehavior.call(this);
    };
    
    /**
     * Slug used when one is not provided
     *
     * @type String
     */
    var DEFAULT_SLUG = '__swivel_default';
    
    /**
     * Builder prototype
     */
    var BuilderPrototype = Builder.prototype;
    
    
    /**
     * Add a behavior to be executed later.
     *
     * Behavior will only be added if it is enabled for the user's bucket.
     *
     * @param String slug
     * @param mixed strategy
     * @param array args
     */
    BuilderPrototype.addBehavior = function addBehavior(slug, strategy, args) {
        var behavior = this.getBehavior(slug, strategy);
        if (this.bucket.enabled(behavior)) {
            setBehavior.call(this, behavior, args);
        }
        return this;
    };
    
    /**
     * Add a value to be returned when the builder is executed.
     *
     * Value will only be returned if it is enabled for the user's bucket.
     *
     * @param String slug
     * @param mixed value
     */
    BuilderPrototype.addValue = function addValue(slug, value) {
        var behavior = this.getBehavior(slug, function() {
            return value;
        });
        if (this.bucket.enabled(behavior)) {
            setBehavior.call(this, behavior);
        }
        return this;
    };
    
    /**
     * Add a default behavior.
     *
     * Will be used if all other behaviors are not enabled for the user's bucket.
     *
     * @param mixed strategy
     * @param array args
     */
    BuilderPrototype.defaultBehavior = function defaultBehavior(strategy, args) {
        if (this.waived) {
            throw 'Defined a default behavior after `noDefault` was called.';
        }
        if (!this.behavior) {
            setBehavior.call(this, this.getBehavior(strategy), args);
        }
        return this;
    };
    
    /**
     * Add a default value.
     *
     * Will be used if all other behaviors and values are not enabled for the user's bucket.
     *
     * @param mixed value
     */
    BuilderPrototype.defaultValue = function defaultValue(value) {
        if (this.waived) {
            throw 'Defined a default value after `noDefault` was called.';
        }
        if (!this.behavior) {
            var callable = function() {
                return value;
            };
            setBehavior.call(this, this.getBehavior(callable));
        }
        return this;
    };
    
    /**
     * Execute the feature.
     *
     * @return mixed
     */
    BuilderPrototype.execute = function execute() {
        var behavior = this.behavior || this.getBehavior(function() { return null; });
        return behavior.execute(this.args || []);
    };
    
    /**
     * Create and return a new Behavior.
     *
     * The strategy parameter must be a valid callable function.
     *
     * @param String slug
     * @param Callable strategy
     * @return Behavior
     */
    BuilderPrototype.getBehavior = function getBehavior(slug, strategy) {
        if (strategy === undefined) {
            strategy = slug;
            slug = DEFAULT_SLUG;
        }
        if (typeof strategy !== 'function') {
            throw 'Invalid callable passed to Builder.getBehavior().';
        }
        return new Behavior(this.slug + DELIMITER + slug, strategy);
    };
    
    /**
     * Waive the default behavior for this feature.
     */
    BuilderPrototype.noDefault = function noDefault() {
        var behavior = this.behavior;
        if (behavior && behavior.slug === DEFAULT_SLUG) {
            throw 'Called `noDefault` after a default behavior was defined.';
        }
        this.waived = true;
        return this;
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
     * Parse a human readable map into a map of bitmasks
     *
     * @param Object map
     * @return Object
     */
    var parse = function parse(map) {
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
     * FeatureMap constructor
     *
     * @param Object map
     */
    var FeatureMap = function FeatureMap(map) {
        this.map = parse(map);
    };
    
    /**
     * FeatureMap prototype
     */
    var FeatureMapPrototype = FeatureMap.prototype;
    
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
     * Compare a FeatureMap to this instance and return a new FeatureMap.
     *
     * Returned object will contain only the elements that differ between the two maps. If a feature
     * with the same key has different buckets, the buckets from the passed-in FeatureMap will be in the
     * new object.
     *
     * @param FeatureMap featureMap
     * @return FeatureMap
     */
    FeatureMapPrototype.diff = function diff(featureMap) {
        var base = this.map;
        var compared = featureMap.map;
        var data = {};
        var key;
    
        for (key in compared) {
            if (compared.hasOwnProperty(key) && (base[key] === undefined || base[key] !== compared[key])) {
                data[key] = compared[key];
            }
        }
    
        for (key in base) {
            if (base.hasOwnProperty(key) && compared[key] === undefined) {
                data[key] = base[key];
            }
        }
    
        return new FeatureMap(data);
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
     * Compare featureMap to this instance and return a new FeatureMap.
     *
     * Returned object will contain only the elements that match between the two maps.
     *
     * @param FeatureMap featureMap
     * @return FeatureMap
     */
    FeatureMapPrototype.intersect = function intersect(featureMap) {
        var base = this.map;
        var compared = featureMap.map;
        var data = {};
        var key;
    
        for (key in compared) {
            if (compared.hasOwnProperty(key) && base[key] === compared[key]) {
                data[key] = compared[key];
            }
        }
        return new FeatureMap(data);
    };
    
    /**
     * Used to reduce masks when merging maps.
     *
     * @param Object data
     * @param FeatureMap featureMap
     * @return Object
     */
    var overwrite = function(data, featureMap) {
        var key;
        var map = featureMap.map;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                data[key] = map[key];
            }
        }
        return data;
    };
    
    /**
     * Merge this map with another map and return a new FeatureMap
     *
     * Values in featureMap will overwrite values in this instance.  Any number of additional maps may
     * be passed to this method, i.e. map->merge(map2, map3, map4, ...);
     *
     * @param FeatureMap map
     * @return FeatureMap
     */
    FeatureMapPrototype.merge = function merge(/* map1, map2, ... */) {
        return new FeatureMap(reduce.call(arguments, overwrite, this.map));
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
    
    /**
     * Syntactic sugar for creating simple feature toggles (ternary style)
     *
     * @param String slug
     * @param mixed a
     * @param mixed b
     * @return mixed
     */
    SwivelPrototype.invoke = function invoke(slug, a, b) {
        var parts = slug.split(DELIMITER);
        return this.forFeature(parts.shift())
            .addBehavior(parts.join(DELIMITER), a)
            .defaultBehavior(b)
            .execute();
    };
    
    /**
     * Syntactic sugar for creating simple feature toggles (ternary style)
     *
     * Uses Builder::addValue
     *
     * @param String slug
     * @param mixed a
     * @param mixed b
     * @return mixed
     */
    SwivelPrototype.returnValue = function returnValue(slug, a, b) {
        var parts = slug.split(DELIMITER);
        return this.forFeature(parts.shift())
            .addValue(parts.join(DELIMITER), a)
            .defaultValue(b)
            .execute();
    };
    
    /**
     * Set the Swivel Bucket
     *
     * @param Bucket bucket
     * @return Swivel
     */
    SwivelPrototype.setBucket = function setBucket(bucket) {
        this.bucket = bucket;
        return this;
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
            define('Swivel', function defineSwivel() { return Swivel; });
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