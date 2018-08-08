/**
 * Used by parse reducer
 *
 * @param Number mask
 * @param Number index
 * @return Number
 */
var bitmaskIterator = function bitmaskIterator(mask, index) {
    if (!index || parseInt(index, 10) === 0) {
        return mask;
    }
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

        var isMissing = !this.slugExists(key);
        var isDisabled = isMissing || !(parseInt(map[key], 10) & index);

        if (isMissing || isDisabled) {
            return false;
        }
    }
    return true;
};

/**
 * Check if a feature slug exists in the Map.
 *
 * @param String slug
 * @return Boolean
 */
FeatureMapPrototype.slugExists = function slugExists(slug) {
    return typeof this.map[slug] !== 'undefined';
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
