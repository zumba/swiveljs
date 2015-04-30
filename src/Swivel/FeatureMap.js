
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
