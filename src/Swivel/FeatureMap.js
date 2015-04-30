
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
 * Used by reduceToBitmask
 *
 * @param Number mask
 * @param Number index
 * @return Number
 */
var bitmaskIterator = function bitmaskIterator(mask, index) {
    return mask | 1 << --index;
};
